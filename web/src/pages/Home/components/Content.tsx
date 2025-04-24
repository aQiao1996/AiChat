import { Avatar } from "antd";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppSelector } from "@/store";
import MarkdownRenderer from "@/pages/components/MarkdownRenderer";

const Content = () => {
  const { messages } = useAppSelector(state => state.chat);

  return (
    <div className="flex flex-col">
      {messages.map((item, index) => {
        return (
          <div key={index}>
            {item.role === "user" ? (
              // user
              <div className={`flex items-center justify-end ${index !== 0 && "mt-8"}`}>
                <div className="bg-gray-100 p-4 rounded-8 m-4">
                  <MarkdownRenderer markdown={item.content} role="user"></MarkdownRenderer>
                </div>
                <Avatar style={{ verticalAlign: "middle" }} size="large">
                  user
                </Avatar>
              </div>
            ) : (
              // assistant
              <div className={`flex items-center justify-start ${index !== 0 && "mt-8"}`}>
                <Avatar style={{ verticalAlign: "middle" }} size="large" src={AvatarImage}>
                  胖虎
                </Avatar>
                <div className="flex-1 p-4 m-4">
                  <MarkdownRenderer markdown={item.content} isLast={index === messages.length - 1}></MarkdownRenderer>
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
