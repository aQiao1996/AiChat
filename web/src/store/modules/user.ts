import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface IUserStore {
  token: string;
}

export interface ILoginParams {
  username: string;
  password: string;
}

const initialState: IUserStore = {
  token: "",
};

export const login = createAsyncThunk("user/login", async (params: ILoginParams, { rejectWithValue }) => {
  const body = JSON.stringify(params);
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

const userStore = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken(state, { payload }: { payload: string }) {
      state.token = payload;
    },
  },
});

export const { setToken } = userStore.actions;
export default userStore.reducer;
