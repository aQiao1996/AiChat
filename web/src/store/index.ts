import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import userStore from "./modules/user";
import chatStore from "./modules/chat";
import syntaxHighlighterStore from "./modules/syntaxHighlighter";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 默认使用 localStorage

// * 创建 persist 配置
const persistConfig = {
  key: "panghu", // 存储的 key 名称
  storage, // 存储引擎（默认 localStorage）
  whitelist: ["user", "syntaxHighlighter"], // 只持久化 user syntaxHighlighter 模块
  // blacklist: ["chat"], // 不持久化 chat 模块
};

// * 合并所有 Reducer
const rootReducer = combineReducers({
  user: userStore,
  chat: chatStore,
  syntaxHighlighter: syntaxHighlighterStore,
});

// * 应用 persistReducer 到 user 模块（如果只想持久化部分模块）
const persistedUserReducer = persistReducer(persistConfig, rootReducer);

// * 创建 store 组合子模块
const store = configureStore({
  reducer: persistedUserReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // 关闭序列化检查（redux-persist 需要）
    }),
});

// * 创建 persistor（用于手动控制持久化）
export const persistor = persistStore(store);

// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
