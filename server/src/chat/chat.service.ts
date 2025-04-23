import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import OpenAI from "openai";
import { ConfigService } from "@nestjs/config";
import { CreateChatDto } from "./dto/create-chat.dto";
import { getTokenUserInfo } from "src/utils/index";
import { InjectRepository } from "@nestjs/typeorm";
import { Chat } from "./entities/chat.entity";
import { Repository } from "typeorm";
import type { Request } from "express";

// 扩展 Delta 类型定义
interface Delta {
  content?: string;
  role?: string;
  // 如果有自定义字段，在这里添加
  reasoning_content?: string; // 可选，根据实际API响应决定
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name); // 直接调用
  private openai: OpenAI;
  constructor(
    @InjectRepository(Chat) private readonly chat: Repository<Chat>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
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
    let reasoningContent = "";
    let answerContent = "";
    let isAnswering = false;

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

      const delta = chunk.choices[0].delta as Delta; // 类型断言

      // 处理思考过程
      if (delta.reasoning_content) {
        process.stdout.write(delta.reasoning_content);
        reasoningContent += delta.reasoning_content;
      }
      // 处理正式回复
      if (delta.content) {
        if (!isAnswering) {
          this.logger.log("\n" + "=".repeat(20) + "完整回复" + "=".repeat(20) + "\n");
          isAnswering = true;
        }
        process.stdout.write(delta.content);
        answerContent += delta.content;
      }
    }

    return {
      answerContent, // 正式回复
      reasoningContent, // 思考过程
    };
  }
  async create(createChatDto: CreateChatDto, request: Request) {
    await this.createChat();
    const token = request.get("authorization");
    const userInfo = getTokenUserInfo(token);
    const messages = await this.chat.findOne({ where: { id: userInfo.id } });
    // todo 储存信息
    return messages;
  }
}
