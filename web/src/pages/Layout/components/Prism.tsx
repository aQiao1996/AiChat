import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import PrismEnum from "@/enum/prism";
import { useAppSelector, useAppDispatch } from "@/store";
import { setPrismTheme } from "@/store/modules/syntaxHighlighter";

import type { MenuProps } from "antd";
import type { TPrism } from "@/enum/prism";

const items: MenuProps["items"] = Object.entries(PrismEnum).map(([_, value]) => ({ label: value, key: value }));

export const Prism = () => {
  const { prism } = useAppSelector(state => state.syntaxHighlighter);
  const dispatch = useAppDispatch();
  const handlePrismClick: MenuProps["onClick"] = ({ key }) => {
    dispatch(setPrismTheme(key as TPrism));
  };
  return (
    <Dropdown menu={{ items, selectable: true, defaultSelectedKeys: [prism], onClick: handlePrismClick }}>
      <a onClick={e => e.preventDefault()}>
        <Space>
          代码高亮样式
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};
