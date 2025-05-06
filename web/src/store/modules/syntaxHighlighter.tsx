import { createSlice } from "@reduxjs/toolkit";
import type { TPrism } from "@/enum/prism";

interface ISyntaxHighlighterStore {
  prism: TPrism; // 代码高亮样式
}

const initialState: ISyntaxHighlighterStore = {
  prism: "synthwave84", // 默认代码高亮样式
};

const syntaxHighlighterStore = createSlice({
  name: "syntaxHighlighter",
  // * 初始状态数据
  initialState,
  // * 修改数据的同步方法
  reducers: {
    setPrismTheme(state, { payload }: { payload: TPrism }) {
      state.prism = payload;
    },
  },
});
// * 解构并导出 actions 对象的函数
export const { setPrismTheme } = syntaxHighlighterStore.actions;
// * 默认导出 reducer 函数
export default syntaxHighlighterStore.reducer;
