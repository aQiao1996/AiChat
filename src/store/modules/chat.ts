import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IMessage, IModel } from "@/types/chat";

interface IChatStore {
  messages: IMessage[];
  model: IModel;
}
interface IParams {
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
};

export const createMessage = createAsyncThunk("chat/createMessage", async (params: IParams) => {
  const apiKey = import.meta.env.VITE_APP_DASHSCOPE_API_KEY;
  const url = import.meta.env.VITE_APP_DASHSCOPE_API_URL;
  const body = JSON.stringify({
    model: params.model || "deepseek-v3",
    messages: [{ role: "user", content: params.content }],
  });
  try {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }
      return response.json();
    });
    return result;
  } catch (error) {
    console.log("🚀 ~ createMessage ~ error:", error);
    return null;
  }
});

const chatStore = createSlice({
  name: "chat",
  // * 初始状态数据
  initialState,
  // * 修改数据的同步方法
  reducers: {
    updateMessages(state, { payload }: { payload: IMessage }) {
      state.messages.push(payload);
    },
    updateModel(state, { payload }: { payload: IModel }) {
      state.model = payload;
      console.log("🚀 ~ updateModel ~ state.model:", state.model);
    },
  },
});
// * 解构并导出 actions 对象的函数
export const { updateMessages, updateModel } = chatStore.actions;
// * 默认导出 reducer 函数
export default chatStore.reducer;
