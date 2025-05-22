import { useEffect, useState } from "react";
import { Avatar, Divider, Dropdown, type MenuProps } from "antd";
import { useAppSelector, useAppDispatch } from "@/store";
import AvatarImage from "@/assets/images/avatar.png";
import { MessageOutlined, MoreOutlined } from "@ant-design/icons";
import { updateMessages, setTitle, getUserChatInfos, getMessagesHistory, type IHistory } from "@/store/modules/chat";
import { setCurrentChatId } from "@/store/modules/user";
import type { ICreateChatResponse } from "@/api/chat";

const items: MenuProps["items"] = [
  { key: "rename", label: <span>重命名</span> },
  { key: "delete", label: <span>删除</span> },
];

const Navbar = () => {
  const dispatch = useAppDispatch();
  // const { history } = useAppSelector(state => state.chat);
  const { currentChatId } = useAppSelector(state => state.user);
  const [chatsHistory, setChatsHistory] = useState<ICreateChatResponse[]>([]);

  const getUserChatData = async () => {
    const { data } = await dispatch(getUserChatInfos()).unwrap();
    setChatsHistory(data);
    getCurrentChatMessages(currentChatId);
  };

  /**
   * 处理新建聊天逻辑
   * - 重置当前聊天ID为0
   * - 设置标题为"新对话"
   * - 清空消息列表
   */
  const handleNewChat = () => {
    dispatch(setCurrentChatId(0));
    dispatch(setTitle("新对话"));
    dispatch(updateMessages({ type: "update", data: [] }));
  };

  /**
   * 处理导航项点击事件
   * @param item - 历史记录项，包含 chatId、title 和 messages 等信息
   * @description 当点击不同聊天记录时，更新当前聊天ID、标题和消息列表
   * 如果点击的是当前已选中的聊天，则不执行任何操作
   */
  const handleItemClick = (item: ICreateChatResponse) => {
    if (item.id === currentChatId) return;
    dispatch(setCurrentChatId(item.id));
    dispatch(setTitle(item.title));
    getCurrentChatMessages(item.id);
  };

  const getCurrentChatMessages = async (id: number) => {
    const { data } = await dispatch(getMessagesHistory(id)).unwrap();
    dispatch(updateMessages({ type: "update", data: data.messages }));
  };

  useEffect(() => {
    getUserChatData();
  }, []);

  return (
    <div className="p-24">
      {/*  */}
      <div className="h-100">
        <Avatar style={{ verticalAlign: "middle" }} size="large" src={AvatarImage}>
          胖虎
        </Avatar>
      </div>
      <Divider />
      {/*  */}
      <div
        className="h-40 text-16 border-1 border-[#666] rounded-8 flex items-center justify-center cursor-pointer hover:border-[#4096ff] hover:text-[#4096ff]"
        onClick={handleNewChat}
      >
        新对话
        <MessageOutlined className="ml-8" />
      </div>
      <Divider />
      {/*  */}
      <div>
        {chatsHistory.map(item => (
          <Dropdown menu={{ items }} key={item.id}>
            <div
              className={`!text-[#333] flex cursor-pointer px-4 py-8 rounded-8 mb-8 hover:bg-[#eeeeee80] ${
                currentChatId === item.id ? "bg-[#eeeeee80]" : ""
              }`}
              onClick={() => handleItemClick(item)}
            >
              <span className="text-16 mr-8 flex-1">{item.title}</span>
              <MoreOutlined />
            </div>
          </Dropdown>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
