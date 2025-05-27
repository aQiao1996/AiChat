export interface IMessage {
  role: "user" | "assistant";
  content: string; // 消息结果
  reasoningContent?: string; // 思考内容
  reasoningTime?: number | string; // 思考用时
}
export type IModel = "deepseek-v3" | "deepseek-r1";
