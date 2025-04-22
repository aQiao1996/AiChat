export interface IMessage {
  role: "user" | "assistant";
  content: string;
}
export type IModel = "deepseek-v3" | "deepseek-r1";
