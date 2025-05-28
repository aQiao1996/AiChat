import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createChatApi,
  getUserChatMenuApi,
  getMessagesHistoryApi,
  type ICreateChatParams,
  deleteChatApi,
  updateChatTitleApi,
} from "@/api/chat";
import type { IMessage, IModel } from "@/types/chat";
// import type { RootState } from "..";

interface IChatStore {
  messages: IMessage[];
  model: IModel;
  currentAnswer: string;
  currentReasoning: string;
  isLoading: boolean;
  reasoningTime?: number | string;
  title: string;
}

interface IChatParams {
  content: string;
  chatId: number;
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
};

// 创建聊天会话
export const createChat = createAsyncThunk(
  "chat/createChat",
  async (params: IChatParams, { rejectWithValue, getState }) => {
    // const { user } = getState() as RootState;
    // const token = user.token;
    const body = {
      messages: { role: "user", content: params.content },
      chatId: params.chatId,
    } as ICreateChatParams;
    try {
      const result = await createChatApi(body);
      return result;
    } catch (error) {
      return rejectWithValue({ ...(error as any)?.response });
    }
  }
);

// 获取用户所有聊天信息
export const getUserChatMenu = createAsyncThunk("chat/userChatMenu", async (_, { rejectWithValue }) => {
  try {
    const result = await getUserChatMenuApi();
    return result;
  } catch (error) {
    return rejectWithValue({ ...(error as any)?.response });
  }
});

// 获取对应消息id的聊天记录
export const getMessagesHistory = createAsyncThunk("chat/userChatInfos", async (id: number, { rejectWithValue }) => {
  try {
    const result = await getMessagesHistoryApi(id);
    return result;
  } catch (error) {
    return rejectWithValue({ ...(error as any)?.response });
  }
});

// 删除消息
export const deleteChat = createAsyncThunk("chat/deleteChat", async (id: number, { rejectWithValue }) => {
  try {
    const result = await deleteChatApi(id);
    return result;
  } catch (error) {
    return rejectWithValue({ ...(error as any)?.response });
  }
});

// 更新标题
export const updateChatTitle = createAsyncThunk(
  "chat/updateChatTitle",
  async ({ id, title }: { id: number; title: string }, { rejectWithValue }) => {
    try {
      const result = await updateChatTitleApi(id, title);
      return result;
    } catch (error) {
      return rejectWithValue({ ...(error as any)?.response });
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
  },
});
// * 解构并导出 actions 对象的函数
export const { updateMessages, updateModel, updateCurrentMessage, setLoading, setReasoningTime, setTitle } =
  chatStore.actions;
// * 默认导出 reducer 函数
export default chatStore.reducer;
