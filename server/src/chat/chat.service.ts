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
    @InjectRepository(Message) private readonly message: Repository<Message>,
    private readonly configService: ConfigService
  ) {}

  async createChat() {
    return new Promise(resolve => {
      const openai = new OpenAI({
        apiKey: this.configService.get("DATABASE_DASHSCOPE_API_KEY"),
        baseURL: this.configService.get("DATABASE_DASHSCOPE_API_URL"),
      });
      this.openai = openai;
      resolve(openai);
    });
  }
  async createChatStream(createChatDto: CreateChatDto) {
    const { Subject } = await import("rxjs");
    const subject = new Subject<{ type: string; content: string }>();

    (async () => {
      try {
        const stream = await this.openai.chat.completions.create({
          model: createChatDto.model,
          messages: createChatDto.messages,
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
  async create(createChatDto: CreateChatDto, request: Request) {
    await this.createChat();

    const token = request.get("authorization");
    const userInfo = getTokenUserInfo(token);

    let chatRes = await this.chat.findOne({
      where: { userId: userInfo.id },
      relations: ["messages"],
    });

    const message = new Message();
    message.content = [createChatDto];
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
    return chatRes;
  }
}
