import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import OpenAI from "openai";
import { getTokenUserInfo } from "src/utils/index";
import { Chat } from "./entities/chat.entity";
import type { Repository } from "typeorm";
import type { Request } from "express";
import type { CreateChatDto } from "./dto/create-chat.dto";
import { Message } from "./entities/message.entity";

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
   * @param model - 深度学习模型类型,"deepseek-v3" 或 "deepseek-r1"
   * @returns Observable 流,包含推理过程和答案内容
   * 
   * @description
   * 该方法通过 OpenAI API 创建流式聊天响应。
   * 它会查询指定聊天ID的历史消息,并使用选定的模型生成回复。
   * 响应内容通过 RxJS Subject 以流的形式返回,包含两种类型:
   * - reasoning: 推理过程
   * - answer: 最终答案
   * 
   * @throws 当 API 调用失败时会抛出错误
   */
  async createChatStream(chatId: number, model: "deepseek-v3" | "deepseek-r1") {
    const { Subject } = await import("rxjs");
    const subject = new Subject<{ type: string; content: string }>();
    const chatRes = await this.chat.findOne({ where: { id: chatId }, relations: ["messages"] });
    const messages = chatRes.messages.map(item => item.content.messages).flat();
    (async () => {
      try {
        if (!this.openai) await this.createChat();

        const stream = await this.openai.chat.completions.create({
          model,
          messages,
          stream: true,
        });

        for await (const chunk of stream) {
          if (!chunk.choices?.length) {
            this.logger.log("Received chunk without choices:", chunk);
            continue;
          }

          const delta = chunk.choices[0].delta as Delta;

          if (delta.reasoning_content) {
            subject.next({ type: "reasoning", content: delta.reasoning_content });
          }

          if (delta.content) {
            subject.next({ type: "answer", content: delta.content });
          }
        }

        subject.complete();
      } catch (error) {
        this.logger.error("Error in chat stream:", error);
        subject.error(error);
      }
    })();

    return subject.asObservable();
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
