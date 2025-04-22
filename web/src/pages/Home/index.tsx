import Content from "./components/Content";
import MyInput from "./components/MyInput";
import { useAppDispatch } from "@/store";
import { createMessage, updateMessages } from "@/store/modules/chat";

const Home = () => {
  const dispatch = useAppDispatch();

  const sendMessage = async (message: string) => {
    dispatch(updateMessages({ role: "user", content: message }));
    const { payload } = await dispatch(createMessage({ content: message }));
    const result = payload.choices[0].message;
    dispatch(updateMessages(result));
  };

  return (
    <div className="h-full flex flex-col p-24">
      <div className="flex-1">
        <Content />
      </div>
      <MyInput sendMessage={sendMessage} />
    </div>
  );
};

export default Home;
