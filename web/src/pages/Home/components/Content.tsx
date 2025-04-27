import { Avatar, Spin } from "antd";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppSelector } from "@/store";
import MarkdownRenderer from "@/pages/components/MarkdownRenderer";
import { useEffect, useRef } from "react";

const Content = () => {
  const chatListRef = useRef<HTMLDivElement>(null);
  const { messages, currentAnswer, currentReasoning, isLoading, reasoningTime } = useAppSelector(state => state.chat);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, currentAnswer, currentReasoning]);

  return (
    <div className="flex flex-col h-full overflow-y-auto" ref={chatListRef}>
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
                  {/* 思考 */}
                  {item.reasoning && (
                    <>
                      <span className="bg-gray-100 p-4 rounded-8 text-gray-500">
                        思考中{`（用时${item.reasoningTime}秒）`}
                      </span>
                      <div className="bg-gray-100 p-4 rounded-8 mt-8 text-gray-500">
                        <MarkdownRenderer markdown={item.reasoning} />
                      </div>
                    </>
                  )}
                  <MarkdownRenderer markdown={item.content} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {currentReasoning && (
        <div className="flex items-center justify-start mt-8">
          <Avatar style={{ verticalAlign: "middle" }} size="large" src={isLoading ? <Spin /> : AvatarImage}>
            胖虎
          </Avatar>
          <div className="flex-1 p-4 m-4">
            <span className="bg-gray-100 p-4 rounded-8 text-gray-500">
              思考中{isLoading ? "..." : `（用时${reasoningTime}秒）`}
            </span>
            <div className="bg-gray-100 p-4 rounded-8 mt-8 text-gray-500">
              <MarkdownRenderer markdown={currentReasoning} />
            </div>
          </div>
        </div>
      )}
      {currentAnswer && (
        <div className="flex items-center justify-start mt-8">
          <Avatar style={{ verticalAlign: "middle" }} size="large" src={isLoading ? <Spin /> : AvatarImage}>
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
