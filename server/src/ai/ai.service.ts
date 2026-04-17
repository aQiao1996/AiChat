import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

// DeepSeek 可选模型
export type DeepseekModel = "deepseek-v3" | "deepseek-r1";
// 自定义 AI 默认模型
export type CustomAIModel = "gpt-5.4";
// 当前聊天模块支持的所有模型
export type ChatModel = DeepseekModel | CustomAIModel;
// 当前聊天模块支持的 AI 提供商
export type AIProvider = "openai_compatible" | "deepseek";
// OpenAI Compatible 推理强度
export type OpenAIReasoningEffort = "low" | "medium" | "high";

// 标准化后的 AI 客户端配置
export interface AIClientConfig {
  client: OpenAI;
  provider: AIProvider;
  model: ChatModel;
  reasoningEffort?: OpenAIReasoningEffort;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * 获取默认聊天配置
   * @returns 默认自定义 AI 的客户端配置
   */
  getDefaultChatConfig(): AIClientConfig {
    return this.getChatConfig();
  }

  /**
   * 根据模型名称获取对应的聊天配置
   * @param model 模型名称,未传时默认走自定义 AI
   * @returns 标准化后的客户端配置
   */
  getChatConfig(model?: string): AIClientConfig {
    if (this.isDeepseekModel(model)) {
      return this.createDeepseekConfig(model);
    }

    return this.createOpenAICompatibleConfig();
  }

  /**
   * 创建自定义 OpenAI Compatible 客户端配置
   * @returns 自定义 AI 客户端、模型和推理强度
   */
  private createOpenAICompatibleConfig(): AIClientConfig {
    const apiKey = this.getRequiredConfig("OPENAI_COMPATIBLE_API_KEY");
    const baseURL = this.getRequiredConfig("OPENAI_COMPATIBLE_BASE_URL");
    const model = (this.configService.get<string>("OPENAI_COMPATIBLE_MODEL") || "gpt-5.4") as CustomAIModel;
    const reasoningEffort = this.getReasoningEffort();

    this.logger.log(`使用自定义 AI 模型: ${model} @ ${baseURL}, reasoning=${reasoningEffort}`);

    return {
      client: new OpenAI({ apiKey, baseURL }),
      provider: "openai_compatible",
      model,
      reasoningEffort,
    };
  }

  /**
   * 创建 DeepSeek 客户端配置
   * @param model DeepSeek 模型名称
   * @returns DeepSeek 对应客户端和模型配置
   */
  private createDeepseekConfig(model: DeepseekModel): AIClientConfig {
    const apiKey = this.getRequiredConfig("DATABASE_DASHSCOPE_API_KEY");
    const baseURL = this.getRequiredConfig("DATABASE_DASHSCOPE_API_URL");

    this.logger.log(`使用 DeepSeek 模型: ${model} @ ${baseURL}`);

    return {
      client: new OpenAI({ apiKey, baseURL }),
      provider: "deepseek",
      model,
    };
  }

  /**
   * 获取自定义 AI 的推理强度
   * @returns 兼容 OpenAI SDK 的推理强度值
   */
  private getReasoningEffort(): OpenAIReasoningEffort {
    const configured = this.configService.get<string>("OPENAI_COMPATIBLE_REASONING_EFFORT")?.toLowerCase();
    if (configured === "medium" || configured === "high") {
      return configured;
    }

    return "low";
  }

  /**
   * 读取必填配置项
   * @param key 环境变量名称
   * @returns 对应配置值
   * @throws InternalServerErrorException 当配置缺失时抛出异常
   */
  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      this.logger.error(`缺少 AI 配置项: ${key}`);
      throw new InternalServerErrorException(`缺少 AI 配置项: ${key}`);
    }

    return value;
  }

  /**
   * 判断当前模型是否为 DeepSeek 模型
   * @param model 模型名称
   * @returns 是否为支持的 DeepSeek 模型
   */
  private isDeepseekModel(model?: string): model is DeepseekModel {
    return model === "deepseek-v3" || model === "deepseek-r1";
  }
}
