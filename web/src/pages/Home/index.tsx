import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import Content from "./components/Content";
import MyInput from "./components/MyInput";
import { useAppDispatch, useAppSelector } from "@/store";
import { EventSourcePolyfill } from "event-source-polyfill";
import {
  createChat,
  updateMessages,
  updateCurrentMessage,
  setLoading,
  setReasoningTime,
  setTitle,
  setHistory,
  setCurrentChatId,
  type IHistory,
} from "@/store/modules/chat";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/store/modules/user";
import type { IMessage, IModel } from "@/types/chat";

interface IStreamParams {
  model?: IModel;
  chatId: number;
}
export interface IMyInputChildMethods {
  setSendBtnState: React.Dispatch<React.SetStateAction<TState>>;
}
export type TState = "default" | "loading" | "answering";
export type TEventSource = EventSourcePolyfill | undefined;

const Home = () => {
  const MyInputRef = useRef<IMyInputChildMethods>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { model, history, title, currentChatId } = useAppSelector(state => state.chat);
  const { token } = useAppSelector(state => state.user);
  const [eventSource, setEventSource] = useState<TEventSource>();
  const currentChatInfo = useRef<IHistory>(null);

  /**
   * 发送消息并处理响应
   * @param message - 用户输入的消息内容
   * @description
   * 1. 发送消息到服务端创建新的对话
   * 2. 更新本地消息列表和对话历史
   * 3. 设置当前对话ID和标题
   * 4. 创建消息流式响应
   * 5. 处理错误情况(登录过期、网络错误等)
   */
  const sendMessage = async (message: string) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(createChat({ content: message, chatId: currentChatId })).unwrap();
      const chatId = result.id;
      if (!chatId) return;
      dispatch(updateMessages({ type: "add", data: { role: "user", content: message } }));
      dispatch(setCurrentChatId(chatId));
      currentChatId === 0 && dispatch(setTitle(result.title));
      const currentChatHistory = history.find(item => item.chatId === currentChatInfo.current?.chatId);
      // 如果有历史记录
      if (currentChatHistory) {
        const updatedHistoryItem = Object.assign({}, currentChatHistory, {
          messages: [...currentChatHistory.messages, { role: "user", content: message }],
        });
        currentChatInfo.current = updatedHistoryItem;
      } else {
        currentChatInfo.current = {
          chatId,
          title: currentChatId === 0 ? result.title : title,
          messages: [{ role: "user", content: message }],
        };
      }
      // 创建消息流式响应
      createChatStream({ chatId, model });
    } catch (error: any) {
      if (error.status === 401) {
        dispatch(setToken(""));
        messageApi.error("登录过期，请重新登录");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
        return;
      }
      dispatch(setLoading(false));
      messageApi.error(error.message || "未知错误");
    }
  };

  /**
   * 创建聊天流式数据连接
   * @description 使用 EventSource 建立与服务器的流式连接,处理聊天消息的实时接收和状态更新
   * @param {IStreamParams} params - 包含聊天ID和模型参数
   * @remarks
   * - 处理三种消息类型:
   *   - reasoning: AI思考过程
   *   - answer: AI回答内容
   *   - complete: 回答完成
   * - 记录并计算AI思考时间
   * - 更新UI状态(loading、按钮等)
   * - 保存聊天历史记录
   * - 错误处理
   */
  const createChatStream = (params: IStreamParams) => {
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_APP_BASE_URL}/chat/chatStream?chatId=${params.chatId}&model=${
        params.model || "deepseek-v3"
      }`,
      { headers: { Authorization: "Bearer " + token } }
    );
    setEventSource(eventSource);

    let reasoningResult = ""; // 思考
    let answerResult = ""; // 回答
    let reasoningStartTime = 0; // 思考开始时间（性能高精度计时）
    let reasoningTimeMs = 0; // 思考总耗时（毫秒）

    // onopen
    eventSource.onopen = function (this: EventSource) {
      dispatch(setReasoningTime(0));
      console.log("🚀 ~ createChatStream ~ 流式数据开始----->");
    };
    // onmessage
    eventSource.onmessage = function (this, event) {
      MyInputRef.current?.setSendBtnState("answering");
      const { type, content, role } = JSON.parse(event.data || "{}");

      // 思考
      if (type === "reasoning") {
        if (!reasoningStartTime) {
          reasoningStartTime = performance.now(); // 记录思考开始时间
        }
        reasoningResult += content;
        dispatch(updateCurrentMessage({ content: reasoningResult, type }));
      }
      // 回答
      if (type === "answer") {
        answerResult += content;
        dispatch(updateCurrentMessage({ content: answerResult, type }));
        if (reasoningStartTime && !reasoningTimeMs) {
          reasoningTimeMs = performance.now() - reasoningStartTime; // 计算思考耗时
          dispatch(setReasoningTime((reasoningTimeMs / 1000).toFixed(2)));
        }
      }
      // 回答完成
      if (type === "complete") {
        eventSource.close();
        dispatch(setLoading(false));
        dispatch(updateCurrentMessage(null));
        const updatedHistoryItem = Object.assign({}, currentChatInfo.current, {
          messages: [...(currentChatInfo.current?.messages ?? []), { role, content: answerResult }],
        });
        dispatch(setHistory({ type: "update", data: updatedHistoryItem }));
        MyInputRef.current?.setSendBtnState("default");
        // 如果有思考答案
        const messageItem: IMessage = { content: answerResult, role };
        if (reasoningResult) {
          messageItem.reasoning = reasoningResult;
          messageItem.reasoningTime = (reasoningTimeMs / 1000).toFixed(2);
        }
        dispatch(updateMessages({ type: "add", data: messageItem }));
      }
    };
    // onerror
    eventSource.onerror = function (this: EventSource, event) {
      console.error("EventSource failed:", event);
      eventSource.close();
      dispatch(setLoading(false));
      messageApi.error("网络异常，请稍后再试");
    };
  };

  useEffect(() => {
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventSource]);

  return (
    <>
      {contextHolder}
      <div className="h-full flex flex-col p-24">
        <div className="flex-1 overflow-hidden">
          <Content />
        </div>
        <MyInput ref={MyInputRef} sendMessage={sendMessage} eventSource={eventSource} />
      </div>
    </>
  );
};

export default Home;
