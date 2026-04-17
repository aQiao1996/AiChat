import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";
import { AIService } from "./ai.service";

describe("AIService", () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  it("uses custom AI by default with gpt-5.4 and low reasoning", () => {
    const service = new AIService(
      createConfigService({
        OPENAI_COMPATIBLE_API_KEY: "custom-key",
        OPENAI_COMPATIBLE_BASE_URL: "https://example.com/v1",
        OPENAI_COMPATIBLE_MODEL: "gpt-5.4",
      })
    );

    const config = service.getDefaultChatConfig();

    expect(config.provider).toBe("openai_compatible");
    expect(config.model).toBe("gpt-5.4");
    expect(config.reasoningEffort).toBe("low");
  });

  it("keeps explicit deepseek models routable", () => {
    const service = new AIService(
      createConfigService({
        DATABASE_DASHSCOPE_API_KEY: "deepseek-key",
        DATABASE_DASHSCOPE_API_URL: "https://dashscope.example.com/compatible-mode/v1",
      })
    );

    const config = service.getChatConfig("deepseek-r1");

    expect(config.provider).toBe("deepseek");
    expect(config.model).toBe("deepseek-r1");
    expect(config.reasoningEffort).toBeUndefined();
  });

  it("throws a clear error when custom AI config is missing", () => {
    const service = new AIService(createConfigService({}));

    expect(() => service.getDefaultChatConfig()).toThrow(InternalServerErrorException);
    expect(() => service.getDefaultChatConfig()).toThrow("缺少 AI 配置项: OPENAI_COMPATIBLE_API_KEY");
  });
});
