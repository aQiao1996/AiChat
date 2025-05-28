import { useEffect, useRef, useState } from "react";
import { Avatar, Divider, Dropdown, Input, message, Modal, type MenuProps } from "antd";
import { useAppSelector, useAppDispatch } from "@/store";
import AvatarImage from "@/assets/images/avatar.png";
import { MessageOutlined, MoreOutlined } from "@ant-design/icons";
import {
  updateMessages,
  setTitle,
  getUserChatMenu,
  getMessagesHistory,
  deleteChat,
  updateChatTitle,
} from "@/store/modules/chat";
import { setCurrentChatId } from "@/store/modules/user";
import type { ICreateChatResponse } from "@/api/chat";

const { TextArea } = Input;

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { currentChatId } = useAppSelector(state => state.user);
  const [chatsHistory, setChatsHistory] = useState<ICreateChatResponse[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const currentChatData = useRef<ICreateChatResponse>(null);

  const items: MenuProps["items"] = [
    { key: "rename", label: <span>重命名</span> },
    { key: "delete", label: <span>删除</span> },
  ];

  /**
   * 获取用户聊天数据
   * 1. 调用dispatch获取用户聊天信息
   * 2. 将获取的数据设置到chatsHistory状态
   * 3. 根据当前聊天ID获取对应消息
   */
  const getUserChatData = async () => {
    const { data } = await dispatch(getUserChatMenu()).unwrap();
    setChatsHistory(data);
    const { id } = data.find(item => item.id === currentChatId) || {};
    if (!id) return;
    getCurrentChatMessages(id);
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

  /**
   * 处理菜单项点击事件
   * @param param0 点击的菜单项key值
   * @param id 当前聊天记录的ID
   * @description
   * - 当key为"rename"时执行重命名操作
   *   - 调用dispatch更新聊天标题
   *   - 更新聊天历史状态
   * - 当key为"delete"时删除指定聊天记录
   *   - 更新聊天历史状态，过滤掉被删除的聊天记录
   *   - 更新聊天历史状态
   */
  const handleMenuClick = async (
    { key, domEvent }: { key: string; domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> },
    params: ICreateChatResponse
  ) => {
    domEvent.stopPropagation(); // 阻止冒泡
    currentChatData.current = params;
    if (key === "rename") {
      setInputValue(params.title);
      setIsModalOpen(true);
    } else if (key === "delete") {
      await dispatch(deleteChat(params.id)).unwrap();
      if (params.id === currentChatId) handleNewChat();
      messageApi.success("删除成功");
      setChatsHistory(prevChats => prevChats.filter(chat => chat.id !== params.id));
    }
  };

  /**
   * 获取指定聊天ID的历史消息
   * @param id 聊天ID，为0时不执行操作
   * @returns Promise<void> 异步获取并更新消息到store
   */
  const getCurrentChatMessages = async (id: number) => {
    if (id === 0) return;
    const { data } = await dispatch(getMessagesHistory(id)).unwrap();
    if (!data) return;
    dispatch(updateMessages({ type: "update", data: data.messages }));
  };

  /**
   * 处理模态框确认操作，更新聊天标题
   */
  const handleModalOk = async () => {
    if (!inputValue) return;
    if (!currentChatData.current) return;
    await dispatch(updateChatTitle({ id: currentChatData.current.id, title: inputValue })).unwrap();
    currentChatData.current.title = inputValue;
    messageApi.success("更新标题成功");
    setChatsHistory(prevChats =>
      prevChats.map(chat => (chat.id === currentChatData.current?.id ? { ...chat, title: inputValue } : chat))
    );
    setInputValue("");
    setIsModalOpen(false);
  };

  /**
   * 处理模态框取消操作，清空输入并关闭模态框
   */
  const handleModalCancel = () => {
    setInputValue("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    getUserChatData();
  }, [currentChatId]);

  return (
    <>
      {contextHolder}
      <Modal
        title="编辑对话名称"
        closable
        cancelText="取消"
        okText="确定"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <TextArea rows={4} maxLength={30} value={inputValue} onChange={e => setInputValue(e.target.value)} />
      </Modal>

      <div className="p-24">
        {/*  */}
        <div className="h-100">
          <Avatar style={{ verticalAlign: "middle" }} size="large" src={AvatarImage}>
            胖虎
          </Avatar>
          <span className="ml-8 font-bold text-18">胖虎</span>
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
            <div
              className={`!text-[#333] flex cursor-pointer px-4 py-8 rounded-8 mb-8 hover:bg-[#eeeeee80] ${
                currentChatId === item.id ? "bg-[#eeeeee80]" : ""
              }`}
              key={item.id}
              onClick={() => handleItemClick(item)}
            >
              <span className="text-16 mr-8 flex-1">{item.title}</span>
              <Dropdown
                menu={{
                  items,
                  onClick: event => handleMenuClick(event, item),
                }}
                key={item.id}
              >
                <MoreOutlined />
              </Dropdown>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
