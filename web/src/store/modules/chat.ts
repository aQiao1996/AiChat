import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IMessage, IModel } from "@/types/chat";
import type { RootState } from "..";

interface IChatStore {
  messages: IMessage[];
  model: IModel;
  currentAnswer: string;
  currentReasoning: string;
  isLoading: boolean;
  reasoningTime?: number | string;
  title: string;
  history: IHistory[];
  currentChatId: number;
}
interface IChatParams {
  content: string;
  chatId: number;
}
export interface IHistory {
  title: string;
  chatId: number;
  messages: IMessage[];
}

interface IHistoryParams {
  type: "add" | "update" | "delete";
  data: IHistory;
}

const initialState: IChatStore = {
  messages: [
    {
      role: "assistant",
      content: "Hi~ 我是`胖虎` 您身边的智能助手，可以为你答疑解惑、精读文档、尽情创作 让胖虎助您轻松工作，多点生活。",
    },
  ],
  model: "deepseek-v3",
  currentAnswer: "", // 当前回答
  currentReasoning: "", // 当前思考
  isLoading: false,
  reasoningTime: undefined, // 思考用时
  title: "新对话", // 标题
  history: [], // 历史记录
  currentChatId: 0, // 当前对话id
};

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (params: IChatParams, { rejectWithValue, getState }) => {
    const body = JSON.stringify({
      messages: { role: "user", content: params.content },
      chatId: params.chatId,
    });
    const { user } = getState() as RootState;
    const token = user.token;
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/chat/createChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body,
      });

      // todo 懒得统一封装
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          return rejectWithValue({
            status: response.status, // 传递状态码
            message: errorData?.message || "token 过期，请重新登录",
          });
        }
        return rejectWithValue({
          status: response.status, // 传递状态码
          message: errorData?.message || `HTTP error! status: ${response.status}`,
        });
      }

      return await response.json();
    } catch (error) {
      // 处理非 HTTP 错误（如网络错误、CORS、JSON.parse 错误等）
      console.error("请求失败:", error);
      return rejectWithValue({
        status: 0, // 表示非 HTTP 错误
        message: error instanceof Error ? error.message : "未知错误",
      });
    }
  }
);

const chatStore = createSlice({
  name: "chat",
  // * 初始状态数据
  initialState,
  // * 修改数据的同步方法
  reducers: {
    updateMessages(state, { payload }: { payload: { type: "add" | "update"; data: IMessage | IMessage[] } }) {
      if (payload.type === "add") {
        state.messages.push(payload.data as IMessage);
        return;
      }
      if (payload.type === "update") {
        state.messages = [
          {
            role: "assistant",
            content:
              "Hi~ 我是`胖虎` 您身边的智能助手，可以为你答疑解惑、精读文档、尽情创作 让胖虎助您轻松工作，多点生活。",
          },
        ];
        state.messages = state.messages.concat(payload.data);
      }
    },
    updateModel(state, { payload }: { payload: IModel }) {
      state.model = payload;
    },
    updateCurrentMessage(state, { payload }: { payload: { content: string; type: "reasoning" | "answer" } | null }) {
      if (!payload) {
        state.currentAnswer = "";
        state.currentReasoning = "";
        return;
      }
      switch (payload.type) {
        case "reasoning":
          state.currentReasoning = payload.content;
          break;
        case "answer":
          state.currentAnswer = payload.content;
          break;
        default:
          break;
      }
    },
    setLoading(state, { payload }: { payload: boolean }) {
      state.isLoading = payload;
    },
    setReasoningTime(state, { payload }: { payload: number | string }) {
      state.reasoningTime = payload;
    },
    setTitle(state, { payload }: { payload: string }) {
      state.title = payload;
    },
    setHistory(state, { payload }: { payload: IHistoryParams }) {
      if (payload.type === "add") {
        state.history.push(payload.data);
      } else if (payload.type === "update") {
        const index = state.history.findIndex(item => item.chatId === payload.data.chatId);
        if (index !== -1) {
          state.history[index] = payload.data;
        }
      }
    },
    setCurrentChatId(state, { payload }: { payload: number }) {
      state.currentChatId = payload;
    },
  },
});
// * 解构并导出 actions 对象的函数
export const {
  updateMessages,
  updateModel,
  updateCurrentMessage,
  setLoading,
  setReasoningTime,
  setTitle,
  setHistory,
  setCurrentChatId,
} = chatStore.actions;
// * 默认导出 reducer 函数
export default chatStore.reducer;
