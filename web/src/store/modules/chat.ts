import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IMessage, IModel } from "@/types/chat";

interface IChatStore {
  messages: IMessage[];
  model: IModel;
  currentAnswer: string;
  isLoading: boolean;
}
interface IChatParams {
  model?: IModel;
  content: string;
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
  isLoading: false,
};

export const createChat = createAsyncThunk("chat/createChat", async (params: IChatParams, { rejectWithValue }) => {
  const body = JSON.stringify({
    model: params.model || "deepseek-v3",
    messages: [{ role: "user", content: params.content }],
  });
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/chat/createChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: import.meta.env.VITE_APP_TOKEN,
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "未知错误",
      ...(error as any)?.response?.data,
    });
  }
});

const chatStore = createSlice({
  name: "chat",
  // * 初始状态数据
  initialState,
  // * 修改数据的同步方法
  reducers: {
    addMessages(state, { payload }: { payload: IMessage }) {
      state.messages.push(payload);
    },
    updateModel(state, { payload }: { payload: IModel }) {
      state.model = payload;
    },
    updateCurrentAnswer(state, { payload }: { payload: string }) {
      state.currentAnswer = payload;
    },
    setLoading(state, { payload }: { payload: boolean }) {
      state.isLoading = payload;
    },
  },
});
// * 解构并导出 actions 对象的函数
export const { addMessages, updateModel, updateCurrentAnswer, setLoading } = chatStore.actions;
// * 默认导出 reducer 函数
export default chatStore.reducer;
