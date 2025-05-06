import { CodeOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import PrismEnum from "@/enum/prism";
import { useAppSelector, useAppDispatch } from "@/store";
import { setPrismTheme } from "@/store/modules/syntaxHighlighter";

import type { MenuProps } from "antd";
import type { TPrism } from "@/enum/prism";

const prismItems: MenuProps["items"] = Object.entries(PrismEnum).map(([_, value]) => ({ label: value, key: value }));
const items: MenuProps["items"] = [
  { label: <span className="font-bold text-[#333]">代码高亮样式</span>, key: "default", disabled: true },
  { type: "divider" },
  ...prismItems,
];

export const Prism = () => {
  const { prism } = useAppSelector(state => state.syntaxHighlighter);
  const dispatch = useAppDispatch();
  const handlePrismClick: MenuProps["onClick"] = ({ key }) => {
    dispatch(setPrismTheme(key as TPrism));
  };
  return (
    <Dropdown menu={{ items, selectable: true, defaultSelectedKeys: [prism], onClick: handlePrismClick }}>
      <a className="cursor-pointer text-18 !text-black hover:!text-[#1890ff]" onClick={e => e.preventDefault()}>
        <Space>
          <CodeOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};
