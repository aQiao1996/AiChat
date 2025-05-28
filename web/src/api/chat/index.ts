import request from "@/api/config";
import type { IMessage } from "@/types/chat";

export interface ICreateChatParams {
  chatId: number;
  messages: {
    content: string;
    role: "user";
  };
}

export interface ICreateChatResponse {
  id: number;
  title: string;
}

interface IMessagesHistoryResponse extends ICreateChatResponse {
  createDate: string;
  messages: IMessage[];
}

export type TUpdateChatTitleParams = ICreateChatResponse;

/**
 * 创建聊天会话
 * @param body 聊天参数
 * @returns 返回创建的聊天会话结果
 */
export const createChatApi = (body: ICreateChatParams) => {
  return request.post<ICreateChatResponse>("/chat/createChat", body);
};

/**
 * 获取用户所有聊天信息
 * @returns 包含用户聊天信息的响应数组
 */
export const getUserChatMenuApi = () => {
  return request.get<ICreateChatResponse[]>("/chat/userChatMenu");
};

/**
 * 获取指定聊天ID的消息历史记录
 * @param id 聊天ID，用于唯一标识一个聊天会话
 * @returns 一个 Promise 对象，解析为包含聊天会话ID、标题、创建日期和消息列表的响应数据
 */
export const getMessagesHistoryApi = (id: number) => {
  return request.get<IMessagesHistoryResponse>(`/chat/messagesHistory?chatId=${id}`);
};

/**
 * 删除指定聊天ID的聊天会话
 * @param id 聊天ID，用于唯一标识要删除的聊天会话
 * @returns 一个 Promise 对象，解析为删除操作结果的字符串信息
 */
export const deleteChatApi = (id: number) => {
  return request.delete<string>(`/chat/deleteChat?chatId=${id}`);
};

/**
 * 更新指定聊天ID的聊天会话标题
 * @param id 聊天ID，用于唯一标识要更新标题的聊天会话
 * @param title 新的聊天会话标题
 * @returns 一个 Promise 对象，解析为更新操作结果的字符串信息
 */
export const updateChatTitleApi = (body: TUpdateChatTitleParams) => {
  console.log("🚀 ~ updateChatTitleApi ~ body:", body);
  return request.put(`/chat/updateChatTitle`, body);
};
