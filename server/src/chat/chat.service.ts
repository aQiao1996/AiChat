import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { ConfigService } from "@nestjs/config";
import { CreateChatDto } from "./dto/create-chat.dto";

interface IOpenaiParams {
  model: "deepseek-v3" | "deepseek-r1";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

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
  constructor(private readonly configService: ConfigService) {}

  async init(openaiParams: IOpenaiParams) {
    this.logger.log("Initializing chat with params:", openaiParams);

    try {
      const openai = new OpenAI({
        apiKey: this.configService.get("DATABASE_DASHSCOPE_API_KEY"),
        baseURL: this.configService.get("DATABASE_DASHSCOPE_API_URL"),
      });

      let reasoningContent = "";
      let answerContent = "";
      let isAnswering = false;

      const stream = await openai.chat.completions.create({
        model: openaiParams.model,
        messages: openaiParams.messages,
        stream: true,
      });

      this.logger.log("\n" + "=".repeat(20) + " Stream started " + "=".repeat(20));

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
    } catch (error) {
      this.logger.error("Error in chat initialization:", error);
      throw new Error(`Failed to initialize chat: ${error.message}`);
    }
  }
  async create(openaiParams: IOpenaiParams) {
    const openaiRes = await this.init(openaiParams);
    return { ...openaiRes, ...openaiParams };
  }
}
