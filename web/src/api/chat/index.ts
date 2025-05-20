import request from "@/api/config";
import type { IMessage } from "@/types/chat";

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

interface IMessagesHistoryResponse extends ICreateChatResponse {
  createDate: string;
  messages: IMessage[];
}

/**
 * 创建聊天会话
 * @param body 聊天参数
 * @returns 返回创建的聊天会话结果
 */
export const createChatApi = (body: ICreateChatParams) => {
  return request.post<ICreateChatParams, ICreateChatResponse>("/chat/createChat", body);
};

/**
 * 获取用户所有聊天信息
 * @returns 包含用户聊天信息的响应数组
 */
export const getUserChatInfosApi = () => {
  return request.get<null, ICreateChatResponse[]>("/chat/userChatInfos");
};

/**
 * 获取指定聊天ID的消息历史记录
 * @param id 聊天ID
 * @returns 包含消息历史记录的Promise对象
 */
export const getMessagesHistoryApi = (id: number) => {
  return request.get<number, IMessagesHistoryResponse>(`/chat/messagesHistory?chatId=${id}`);
};
