import { message } from "antd";
import Content from "./components/Content";
import MyInput from "./components/MyInput";
import { useAppDispatch, useAppSelector } from "@/store";
import { EventSourcePolyfill } from "event-source-polyfill";
import { createChat, addMessages, updateCurrentMessage, setLoading, setReasoningTime } from "@/store/modules/chat";
import type { IMessage, IModel } from "@/types/chat";

interface IStreamParams {
  model?: IModel;
  chatId: number;
}
const Home = () => {
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const { model } = useAppSelector(state => state.chat);

  const sendMessage = async (message: string) => {
    try {
      const result = await dispatch(createChat({ content: message, model })).unwrap();
      dispatch(addMessages({ role: "user", content: message }));
      const chatId = result.data;
      createChatStream({ chatId, model });
    } catch (error: any) {
      messageApi.error(error.message || "未知错误");
    }
  };

  const createChatStream = (params: IStreamParams) => {
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_APP_BASE_URL}/chat/chatStream?chatId=${params.chatId}&model=${
        params.model || "deepseek-v3"
      }`,
      { headers: { Authorization: import.meta.env.VITE_APP_TOKEN } }
    );

    let reasoningResult = ""; // 思考
    let answerResult = ""; // 回答
    let reasoningStartTime = 0; // 思考开始时间（性能高精度计时）
    let reasoningTimeMs = 0; // 思考总耗时（毫秒）

    eventSource.onopen = function (this: EventSource) {
      dispatch(setLoading(true));
      dispatch(setReasoningTime(0));
      console.log("🚀 ~ createChatStream ~ 流式数据开始----->");
    };

    eventSource.onmessage = function (this, event) {
      const { type, content, role } = JSON.parse(event.data || "{}");
      // console.log("🚀 ~ createChatStream ~ result:", type, content, role);
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
        console.log("🚀 ~ createChatStream ~ 流式数据结束----->");
        dispatch(setLoading(false));
        dispatch(updateCurrentMessage(null));
        // 如果有思考答案
        const messageItem: IMessage = { content: answerResult, role };
        if (reasoningResult) {
          messageItem.reasoning = reasoningResult;
          messageItem.reasoningTime = (reasoningTimeMs / 1000).toFixed(2);
        }
        dispatch(addMessages(messageItem));
      }
    };

    eventSource.onerror = function (this: EventSource, event) {
      console.error("EventSource failed:", event);
      eventSource.close();
      dispatch(setLoading(false));
      messageApi.error("网络异常，请稍后再试");
    };
  };

  return (
    <>
      {contextHolder}
      <div className="h-full flex flex-col p-24">
        <div className="flex-1 overflow-hidden">
          <Content />
        </div>
        <MyInput sendMessage={sendMessage} />
      </div>
    </>
  );
};

export default Home;
