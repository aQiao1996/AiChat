import { message } from "antd";
import Content from "./components/Content";
import MyInput from "./components/MyInput";
import { useAppDispatch } from "@/store";
import { EventSourcePolyfill } from "event-source-polyfill";
import { createChat, updateMessages } from "@/store/modules/chat";
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
      dispatch(updateMessages({ role: "user", content: message }));
      const chatId = result.data;
      createChatStream({ chatId });
    } catch (error: any) {
      messageApi.error(error.message || "未知错误");
    }
    // dispatch(updateMessages(result));
  };

  const createChatStream = (params: IStreamParams) => {
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_APP_BASE_URL}/chat/chatStream?chatId=${params.chatId}&model=${
        params.model || "deepseek-v3"
      }`,
      { headers: { Authorization: import.meta.env.VITE_APP_TOKEN } }
    );
    eventSource.onmessage = function (this, event) {
      const result = JSON.parse(event.data || "{}");
      if (result.type === "answer") {
        eventSource.close();
      }
      console.log("🚀 ~ createChatStream ~ result:", result);
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
