import { Avatar } from "antd";
import Markdown from "react-markdown";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppSelector } from "@/store";

const Content = () => {
  const { messages } = useAppSelector(state => state.chat);

  return (
    <div className="flex flex-col">
      {messages.map((item, index) => {
        return (
          <div key={index}>
            {item.role === "user" ? (
              // user
              <div className="flex items-center justify-end">
                <div className="bg-gray-100 p-4 rounded-8 m-4">
                  <Markdown>{item.content}</Markdown>
                </div>
                <Avatar style={{ verticalAlign: "middle" }} size="large">
                  user
                </Avatar>
              </div>
            ) : (
              // assistant
              <div className="flex items-center">
                <Avatar style={{ verticalAlign: "middle" }} size="large" src={AvatarImage}>
                  胖虎
                </Avatar>
                <div className="flex-1 p-4 m-4">
                  <Markdown>{item.content}</Markdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Content;
