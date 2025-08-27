import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, type ILoginParams } from "@/api/login";

interface IUserStore {
  token: string;
  currentChatId: number;
}

const initialState: IUserStore = {
  token: "",
  currentChatId: 0, // 当前对话id,新对话是0
};

export const login = createAsyncThunk("user/login", async (params: ILoginParams, { rejectWithValue }) => {
  try {
    const result = await loginApi(params);
    return result;
  } catch (error) {
    return rejectWithValue({ ...(error as any)?.response });
  }
});

const userStore = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken(state, { payload }: { payload: string }) {
      state.token = payload;
    },
    setCurrentChatId(state, { payload }: { payload: number }) {
      state.currentChatId = payload;
    },
  },
});

export const { setToken, setCurrentChatId } = userStore.actions;
export default userStore.reducer;
