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
      <div className="h-40 text-16">
        新对话
        <MessageOutlined className="ml-8" />
      </div>
      <Divider />
      {/*  */}
      <div>
        <Dropdown menu={{ items }}>
          <div className="!text-[#333] flex cursor-pointer border-1 border-transparent p-4 hover:border-1 hover:border-[#333] hover:rounded-8">
            <span className="text-16 mr-8 flex-1">AI对话</span>
            <MoreOutlined />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
