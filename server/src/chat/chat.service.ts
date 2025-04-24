import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import OpenAI from "openai";
import { getTokenUserInfo } from "src/utils/index";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { Subject, Observable } from "rxjs";
import type { Repository } from "typeorm";
import type { Request } from "express";
import type { CreateChatDto } from "./dto/create-chat.dto";
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
    const subject = new Subject<{ type: string; content: string }>();

    try {
      const [chat, latestMessage] = await Promise.all([
        this.chat.findOneBy({ id: chatId }),
        this.message.findOne({
          where: { chat: { id: chatId } },
          order: { timestamp: "DESC" },
        }),
      ]);

      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }

      const messages = latestMessage ? latestMessage.content.messages.flat() : [];

      if (!this.openai) {
        await this.createChat();
      }

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

      (async () => {
        try {
          for await (const chunk of stream) {
            clearTimeout(timeout); // 收到数据后重置超时计时器

            if (!chunk.choices?.length) {
              this.logger.debug("Empty choices in chunk:", chunk);
              continue;
            }

            const delta = chunk.choices[0].delta as Delta;

            // 思考
            if (delta.reasoning_content) {
              subject.next({
                type: "reasoning",
                content: delta.reasoning_content,
              });
            }
            // 回答
            if (delta.content) {
              subject.next({
                type: "answer",
                content: delta.content,
              });
            }
          }

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
    await this.createChat();

    const token = request.get("authorization");
    const userInfo = getTokenUserInfo(token);

    let chatRes = await this.chat.findOne({
      where: { userId: userInfo.id },
      relations: ["messages"],
    });

    const message = new Message();
    message.content = createChatDto;
    message.role = "user";
    message.timestamp = new Date();

    if (chatRes) {
      // 如果聊天记录已存在，添加新消息
      chatRes.messages.push(message);
      await this.chat.save(chatRes);
    } else {
      // 如果聊天记录不存在，创建新聊天记录
      chatRes = new Chat();
      chatRes.userId = userInfo.id;
      chatRes.messages = [message];
      await this.chat.save(chatRes);
    }
    return chatRes.id;
  }
}
