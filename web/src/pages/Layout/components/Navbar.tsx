import { Avatar, Divider, Dropdown, type MenuProps } from "antd";
import { useAppSelector, useAppDispatch } from "@/store";
import AvatarImage from "@/assets/images/avatar.png";
import { MessageOutlined, MoreOutlined } from "@ant-design/icons";
import { updateMessages, setLoading, setTitle, setCurrentChatId } from "@/store/modules/chat";
import type { IHistory } from "@/store/modules/chat";

const items: MenuProps["items"] = [
  {
    key: "rename",
    label: <span>重命名</span>,
  },
  {
    key: "delete",
    label: <span>删除</span>,
  },
];

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { history, currentChatId } = useAppSelector(state => state.chat);
  console.log("🚀 ~ Navbar ~ history:", history);

  const handleNewChat = () => {
    dispatch(setCurrentChatId(0));
    dispatch(setTitle("新对话"));
    dispatch(updateMessages({ type: "update", data: [] }));
  };

  const handleItemClick = (item: IHistory) => {
    if (item.chatId === currentChatId) return;
    dispatch(setCurrentChatId(item.chatId));
    dispatch(setTitle(item.title));
    dispatch(updateMessages({ type: "update", data: item.messages }));
  };

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
        {history.map(item => (
          <Dropdown menu={{ items }} key={item.chatId}>
            <div
              className={`!text-[#333] flex cursor-pointer px-4 py-8 rounded-8 mb-8 hover:bg-[#eeeeee80] ${
                currentChatId === item.chatId ? "bg-[#eeeeee80]" : ""
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
