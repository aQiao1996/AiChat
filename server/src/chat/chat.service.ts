import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import OpenAI from "openai";
import { Subject, Observable } from "rxjs";
import { get_encoding } from "tiktoken";
import { getTokenUserInfo } from "src/utils/index";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { User } from "src/user/entities/user.entity";
import type { Repository } from "typeorm";
import type { Request } from "express";
import type { CreateChatDto, ChatMessageDto } from "./dto/create-chat.dto";

// 扩展 Delta 类型定义
interface Delta {
  content?: string;
  role?: string;
  reasoning_content?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name); // 直接调用
  private openai: OpenAI;
  constructor(
    @InjectRepository(Chat) private readonly chat: Repository<Chat>,
    @InjectRepository(Message) private readonly message: Repository<Message>,
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly configService: ConfigService
  ) {}

  /**
   * 创建聊天服务实例
   * 初始化 OpenAI 配置,设置 API 密钥和基础 URL
   * @returns Promise<void> 返回一个 Promise,resolve 为 null
   */
  async createChat() {
    return new Promise(resolve => {
      const openai = new OpenAI({
        apiKey: this.configService.get("DATABASE_DASHSCOPE_API_KEY"),
        baseURL: this.configService.get("DATABASE_DASHSCOPE_API_URL"),
      });
      this.openai = openai;
      resolve(null);
    });
  }
  /**
   * 创建聊天流式响应
   *
   * @param chatId - 聊天ID
   * @param model - 使用的模型类型,"deepseek-v3" 或 "deepseek-r1"
   * @returns Observable 流,包含 reasoning(思考过程)和 answer(回答内容)
   * @throws Error 当找不到对应的聊天记录时
   *
   * @description
   * 该方法创建一个流式的聊天响应:
   * - 查询聊天记录和最新消息
   * - 使用 OpenAI API 创建流式对话
   * - 处理超时控制(30秒)
   * - 解析并发送思考过程和回答内容
   * - 错误处理和资源清理
   */
  async createChatStream(chatId: number, model: "deepseek-v3" | "deepseek-r1") {
    const subject = new Subject<{
      type: "reasoning" | "answer" | "complete";
      content?: string;
      role: "user" | "assistant";
    }>();

    try {
      const [chat, latestMessage] = await Promise.all([
        this.chat.findOneBy({ id: chatId }),
        this.message.find({
          where: { chat: { id: chatId } },
          order: { timestamp: "DESC" },
          take: 3, // 多轮对话,获取最近的三条消息
        }),
      ]);

      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }

      const rawMessages = latestMessage
        ? latestMessage
            .reverse()
            .map(item => item.content.messages)
            .flat()
        : [];

      // 计算 tokens
      const tokenizer = get_encoding("cl100k_base"); // 通用编码
      // https://bailian.console.aliyun.com/?tab=api#/api/?type=model&url=https%3A%2F%2Fhelp.aliyun.com%2Fdocument_detail%2F2868565.html
      const MAX_TOKENS_MAP = {
        "deepseek-v3": 4096, // 合理范围：4096-8192（保守取4096）
        "deepseek-r1": 8192, // 合理范围：8192-16384（保守取8192）
      };
      const maxTokens = MAX_TOKENS_MAP[model];

      // 计算当前 Token 数量
      let currentTokens = 0;
      const validMessages = rawMessages.filter(message => {
        if (!message.role || !message.content) return false;
        const tokens = tokenizer.encode(message.content).length;
        currentTokens += tokens;
        return true;
      });

      // 截断旧消息
      while (currentTokens > maxTokens && validMessages.length > 0) {
        const removed = validMessages.shift();
        currentTokens -= tokenizer.encode(removed.content).length;
      }

      // 确保至少保留一个空消息
      if (validMessages.length === 0) {
        validMessages.push({ role: "user", content: "" });
      }

      if (!this.openai) {
        await this.createChat();
      }
      const messages = validMessages;

      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      // AbortController 超时控制
      const abortController = new AbortController();
      const timeout = setTimeout(() => {
        abortController.abort("Stream timeout after 30 seconds");
      }, 30000);

      let answerResult = ""; // 回答

      (async () => {
        try {
          for await (const chunk of stream) {
            clearTimeout(timeout); // 收到数据后重置超时计时器

            if (!chunk.choices?.length) {
              this.logger.debug("Empty choices in chunk:", chunk);
              continue;
            }

            const delta = chunk.choices[0].delta as Delta;

            // 思考过程
            if (delta.reasoning_content) {
              subject.next({
                type: "reasoning",
                content: delta.reasoning_content,
                role: "assistant",
              });
            }
            // 回答
            if (delta.content) {
              subject.next({ type: "answer", content: delta.content, role: "assistant" });
              answerResult += delta.content;
            }

            // 检查是否结束（根据OpenAI流式响应结束标志）
            if (chunk.choices[0]?.finish_reason) {
              subject.next({ type: "complete", role: "assistant" });
              subject.complete();
              break; // 退出循环
            }
          }
          // 完成后添加 AI 回复的消息
          const message = new Message();
          message.content = { messages: { content: answerResult, role: "assistant" } };
          message.role = "assistant";
          message.timestamp = new Date();
          message.chat = chat; // 关联 chat 实体
          await this.message.save(message);

          subject.complete();
        } catch (error) {
          if (!abortController.signal.aborted) {
            this.logger.error("Stream processing error:", error);
            subject.error(error);
          }
        } finally {
          clearTimeout(timeout);
        }
      })();

      return new Observable(observer => {
        const sub = subject.subscribe(observer);
        return () => {
          abortController.abort();
          sub.unsubscribe();
        };
      });
    } catch (error) {
      this.logger.error("Initialization failed:", error);
      subject.error(error);
      return subject.asObservable();
    }
  }
  /**
   * 根据对话消息生成对话标题
   *
   * @param messages - 对话消息内容
   * @returns 返回生成的标题字符串
   *
   * @description
   * 该方法通过 OpenAI API 分析对话内容,生成一个简洁准确的中文标题
   * - 标题长度不超过15个字
   * - 准确反映代码或问题的核心内容
   * - 优先使用中文描述
   * - 避免使用模糊词汇,尽量具体
   *
   * @throws 如果 OpenAI 服务未初始化或API调用失败
   */
  async getDialogueTitle(messages: ChatMessageDto) {
    if (!this.openai) {
      await this.createChat();
    }
    // 动态注入提示词
    const promptMessages: ChatMessageDto[] = [
      {
        role: "user",
        content:
          "你是一个专业的代码分析助手，擅长从代码和问题描述中提取精准的标题。" +
          "请根据以下信息生成一个简洁、准确的标题，避免冗余描述。",
      },
      messages,
      {
        role: "user",
        content:
          "请根据上述内容生成一个标题，要求：\n" +
          "- 简洁（不超过15个字）\n" +
          "- 准确反映代码或问题的核心\n" +
          "- 使用中文（如果适用）\n" +
          "- 避免模糊词汇（如'问题'、'错误'），尽量具体（如'数组越界异常处理'）",
      },
    ];
    const completion = await this.openai.chat.completions.create({
      model: "deepseek-v3",
      messages: promptMessages,
    });
    const title = completion.choices[0].message.content;
    return title;
  }
  /**
   * 创建新的聊天记录
   *
   * @param createChatDto - 创建聊天的数据传输对象
   * @param request - HTTP请求对象，用于获取授权token
   * @returns 返回创建的聊天记录ID
   *
   * @description
   * 该方法首先验证用户身份，然后检查是否存在该用户的聊天记录：
   * - 如果存在，则向现有聊天记录添加新消息
   * - 如果不存在，则创建新的聊天记录
   *
   * 每条消息都包含内容、角色和时间戳信息
   */
  async create(createChatDto: CreateChatDto, request: Request) {
    const token = request.get("authorization");
    const userInfo = getTokenUserInfo(token);
    const { chatId, ...rest } = createChatDto;
    let title = "";

    // 获取用户信息
    const userRes = await this.user.findOne({
      where: { id: userInfo.id },
      relations: ["chats"],
    });

    let chatRes: Chat;
    // 新消息
    if (chatId === 0) {
      // 新建聊天记录（自动绑定当前用户）
      title = await this.getDialogueTitle(createChatDto.messages);
      chatRes = new Chat();
      chatRes.user = userRes; // 绑定用户
      chatRes.title = title;
      chatRes.messages = [];
    } else {
      // 查询现有聊天记录时，强制校验用户所有权
      chatRes = await this.chat.findOne({
        where: {
          id: chatId,
          user: { id: userInfo.id }, // 只查当前用户的 chat
        },
        relations: ["messages"],
      });

      if (!chatRes) {
        throw new Error("Chat not found or access denied");
      }
    }

    // 创建新消息
    const message = new Message();
    message.content = rest;
    message.role = "user";
    message.timestamp = new Date();

    if (chatRes) {
      // 如果聊天记录已存在，添加新消息
      chatRes.messages = [...(chatRes.messages || []), message];
      await this.chat.save(chatRes);
    } else {
      // 如果聊天记录不存在，创建新聊天记录
      chatRes = new Chat();
      chatRes.user = userRes;
      chatRes.messages = [message];
      await this.chat.save(chatRes); // cascade 会自动保存 messages
    }

    return { id: chatRes.id, title };
  }
  /**
   * 获取当前用户的所有聊天会话ID和标题
   * @param request HTTP请求对象，需包含Authorization头
   * @returns 返回按创建时间降序排列的聊天会话数组，包含id和title字段
   */
  async getUserChatInfos(request: Request) {
    const token = request.get("authorization");
    const userInfo = getTokenUserInfo(token);
    const chatRes = await this.chat.find({
      where: { user: { id: userInfo.id } },
      // select: ["id"],
    });
    return chatRes
      .sort((a, b) => b.createDate.getTime() - a.createDate.getTime())
      .map(item => ({
        id: item.id,
        title: item.title,
      }));
  }
  /**
   * 获取用户的消息历史记录
   *
   * @param request 请求对象，包含authorization头部和chatId查询参数
   * @returns 返回指定聊天ID的消息记录或用户的所有消息记录
   * @description 根据请求中的token验证用户身份，若提供chatId则返回该聊天的消息，否则返回用户所有聊天记录
   */
  async getMessagesHistory(request: Request) {
    const token = request.get("authorization");
    const chatId = request.query.chatId;
    const userInfo = getTokenUserInfo(token);
    if (chatId) {
      const chatRes = await this.chat.findOne({
        where: { id: Number(chatId), user: { id: userInfo.id } },
        relations: ["messages"],
      });
      const { id, createDate } = chatRes;
      const messages = this.handleMessageContent(chatRes);
      return {
        id,
        createDate,
        messages,
      };
    }
    const chatResList = await this.chat.find({
      where: { user: { id: userInfo.id } },
      relations: ["messages"],
    });
    const messagesList = chatResList.map(item => ({
      id: item.id,
      createDate: item.createDate,
      messages: this.handleMessageContent(item),
    }));
    return messagesList;
  }

  /**
   * 处理聊天消息内容，提取角色、内容和时间戳信息
   * @param chat 包含消息列表的聊天对象
   * @returns 返回处理后的消息列表，包含角色、内容和时间戳字段
   */
  handleMessageContent(chat: Chat) {
    let list = [];
    for (let index = 0; index < chat.messages.length; index++) {
      const item = chat.messages[index];
      list.push({
        role: item.role,
        content: item.content.messages.content,
        timestamp: item.timestamp,
      });
    }
    return list;
  }

  /**
   * 删除指定聊天记录
   * 
   * @param request 请求对象，包含authorization头信息和chatId查询参数
   * @returns 成功返回"success"字符串
   * @throws HttpException 当聊天记录不存在或用户无权访问时抛出400错误
   * @throws HttpException 当删除操作未影响任何记录时抛出400错误
   */
  async deleteChat(request: Request) {
    const token = request.get("authorization");
    const chatId = Number(request.query.chatId);
    const userInfo = getTokenUserInfo(token);
    const chatRes = await this.chat.findOne({
      where: { id: chatId, user: { id: userInfo.id } },
    });
    if (!chatRes) {
      throw new HttpException(`chatId：${chatId} 不存在或无权访问`, HttpStatus.BAD_REQUEST);
    }
    const result = await this.chat.delete(chatId);
    if (result.affected === 0) {
      throw new HttpException(`chatId：${chatId} 不存在`, HttpStatus.BAD_REQUEST);
    }
    return "success";
  }
}
