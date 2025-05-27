import { Fragment, useEffect, useRef } from "react";
import { Avatar, Spin } from "antd";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppSelector } from "@/store";
import MarkdownRenderer from "@/pages/components/MarkdownRenderer";

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
          <Fragment key={index}>
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
                  {item.reasoningContent && (
                    <>
                      <span className="bg-gray-100 p-4 rounded-8 text-gray-500">
                        {item.reasoningTime ? `思考中（用时${item.reasoningTime}秒）` : "已深度思考"}
                      </span>
                      <div className="bg-gray-100 p-4 rounded-8 mt-8 text-gray-500">
                        <MarkdownRenderer markdown={item.reasoningContent} />
                      </div>
                    </>
                  )}
                  <MarkdownRenderer markdown={item.content} />
                </div>
              </div>
            )}
          </Fragment>
        );
      })}
      {/* 思考中 */}
      {currentReasoning && (
        <div className="flex items-center justify-start mt-8">
          {currentAnswer ? (
            <div className="w-40 h-40"></div>
          ) : (
            <Avatar style={{ verticalAlign: "middle" }} size="large" src={isLoading ? <Spin /> : AvatarImage}>
              胖虎
            </Avatar>
          )}
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
      {/* 回答 */}
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
