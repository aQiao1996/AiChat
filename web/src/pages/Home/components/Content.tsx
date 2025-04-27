import { Avatar } from "antd";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppSelector } from "@/store";
import MarkdownRenderer from "@/pages/components/MarkdownRenderer";

const Content = () => {
  const { messages, currentAnswer } = useAppSelector(state => state.chat);

  return (
    <div className="flex flex-col">
      {messages.map((item, index) => {
        return (
          <div key={index}>
            {item.role === "user" ? (
              // user
              <div className={`flex items-center justify-end ${index !== 0 && "mt-8"}`}>
                <div className="bg-gray-100 p-4 rounded-8 m-4">{item.content}</div>
                <Avatar style={{ verticalAlign: "middle" }} size="large" className="min-w-40">
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
                  <MarkdownRenderer markdown={item.content} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {currentAnswer && (
        <div className="flex items-center justify-start mt-8">
          <Avatar style={{ verticalAlign: "middle" }} size="large" src={AvatarImage}>
            胖虎
          </Avatar>
          <div className="flex-1 p-4 m-4">
            <MarkdownRenderer markdown={currentAnswer} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
