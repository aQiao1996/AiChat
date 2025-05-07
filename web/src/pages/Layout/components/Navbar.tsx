import { Avatar, Divider, Dropdown, Space } from "antd";
import { useAppSelector } from "@/store";
import AvatarImage from "@/assets/images/avatar.png";
import { MessageOutlined, MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

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
  const { history } = useAppSelector(state => state.chat);
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
      <div className="h-40 text-16 border-1 border-[#666] rounded-8 flex items-center justify-center cursor-pointer hover:border-[#4096ff] hover:text-[#4096ff]">
        新对话
        <MessageOutlined className="ml-8" />
      </div>
      <Divider />
      {/*  */}
      <div>
        {history.map(item => (
          <Dropdown menu={{ items }} key={item.chatId}>
            <div className="!text-[#333] flex cursor-pointer border-1 border-transparent p-4 hover:border-1 hover:border-[#333] hover:rounded-8">
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
