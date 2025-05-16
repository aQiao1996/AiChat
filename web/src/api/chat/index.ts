import request from "@/api/config";

export interface ICreateChatParams {
  chatId: number;
  messages: {
    content: string;
    role: "user";
  };
}

interface ICreateChatResponse {
  id: number;
  title: string;
}

/**
 * 创建聊天会话
 * @param body 聊天参数
 * @returns 返回创建的聊天会话结果
 */
export const createChatApi = (body: ICreateChatParams) => {
  return request.post<ICreateChatParams, ICreateChatResponse>("/chat/createChat", body);
};
