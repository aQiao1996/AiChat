import { message } from "antd";
import Content from "./components/Content";
import MyInput from "./components/MyInput";
import { useAppDispatch } from "@/store";
import { EventSourcePolyfill } from "event-source-polyfill";
import { createChat, addMessages, updateMessages, updateCurrentAnswer } from "@/store/modules/chat";
import type { IModel } from "@/types/chat";

interface IStreamParams {
  model?: IModel;
  chatId: number;
}
const Home = () => {
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const sendMessage = async (message: string) => {
    try {
      const result = await dispatch(createChat({ content: message })).unwrap();
      dispatch(addMessages({ role: "user", content: message }));
      const chatId = result.data;
      createChatStream({ chatId });
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

    let answerResult = ""; // 结果
    let isFirst = true; // 是否首次接收消息

    eventSource.onmessage = function (this, event) {
      const { type, content, role } = JSON.parse(event.data || "{}");
      // console.log("🚀 ~ createChatStream ~ result:", type, content, role);
      // 思考
      if (type === "reasoning") {
      }
      // 回答
      if (type === "answer") {
        answerResult += content;
        if (isFirst) {
          dispatch(updateMessages({ type: "plus", content: "", role }));
          isFirst = false;
        }
        dispatch(updateCurrentAnswer(content));
      }
      // 回答完成
      if (type === "complete") {
        eventSource.close();
        dispatch(updateMessages({ type: "minus", content: answerResult, role }));
        // dispatch(addMessages({ content: answerResult, role }));
      }
    };
  };

  return (
    <>
      {contextHolder}
      <div className="h-full flex flex-col p-24">
        <div className="flex-1">
          <Content />
        </div>
        <MyInput sendMessage={sendMessage} />
      </div>
    </>
  );
};

export default Home;
