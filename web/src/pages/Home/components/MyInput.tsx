import { Button, Input, Tooltip, message } from "antd";
import { useImperativeHandle, useState } from "react";
import { useAppDispatch } from "@/store";
import { updateModel, setLoading } from "@/store/modules/chat";
import { LoadingOutlined, PauseCircleOutlined, SendOutlined } from "@ant-design/icons";
import type { IMyInputChildMethods, TEventSource, TState } from "..";

const { TextArea } = Input;

interface IMyInputProps {
  sendMessage: (message: string) => void;
  eventSource: TEventSource;
  ref: React.Ref<IMyInputChildMethods>;
}
interface IMyInputIconProps {
  state: TState;
  value: string;
  handleStopAnswer: () => void;
}

const MyInputIcon = ({ state, value, handleStopAnswer }: IMyInputIconProps) => {
  const iconMap = {
    default: (
      <Tooltip title={value || "请输入问题"}>
        <SendOutlined
          className={`text-20 ${value ? "cursor-pointer !text-[#4096ff]" : "cursor-not-allowed !text-[#999]"}`}
        />
      </Tooltip>
    ),
    loading: <LoadingOutlined className="text-20 !text-[#4096ff]" />,
    answering: (
      <Tooltip title="停止回答">
        <PauseCircleOutlined className="text-20 cursor-pointer !text-[#4096ff]" onClick={handleStopAnswer} />
      </Tooltip>
    ),
  };
  return iconMap[state];
};

const MyInput = ({ sendMessage, eventSource, ref }: IMyInputProps) => {
  const [value, setValue] = useState(""); // 输入框的值
  const [sendBtnState, setSendBtnState] = useState<TState>("default"); // 发送按钮状态
  const [deepThinking, setDeepThinking] = useState(false);
  const dispatch = useAppDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  // 暴露方法
  useImperativeHandle(ref, () => ({ setSendBtnState }));

  /**
   * 处理文本输入框的确认事件
   * @param event - 键盘事件对象
   * 
   * 功能说明:
   * 1. 当输入为空或状态为loading/answering时,阻止默认行为
   * 2. loading状态下提示用户等待
   * 3. Enter键(非Shift)触发消息发送
   * 4. Shift+Enter实现换行,并维护光标位置
   */
  const handleConfirm = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (value.trim() === "" || ["loading", "answering"].includes(sendBtnState)) {
      event.preventDefault();
      return;
    }
    if (sendBtnState === "loading") {
      event.preventDefault();
      messageApi.error("回答输出中，请稍等");
      return;
    }
    // 搜索
    if (!event.shiftKey && event.code === "Enter") {
      event.preventDefault();
      setSendBtnState("loading");
      sendMessage(value);
      setValue("");
      return;
    }
    // 换行，获取光标位置
    const lastIdx = value.length;
    const target = event.target as HTMLInputElement;
    const startIdx = target.selectionStart || lastIdx;
    const endIdx = target.selectionEnd || lastIdx;
    setValue(val => val.slice(0, startIdx) + "\n" + val.slice(endIdx));
    // 设置光标位置
    setTimeout(() => {
      target.selectionStart = startIdx + 1;
      target.selectionEnd = startIdx + 1;
    }, 0);
  };
  // 是否深度思考
  const handleDeepThinking = () => {
    const newDeepThinking = !deepThinking;
    dispatch(updateModel(newDeepThinking ? "deepseek-r1" : "deepseek-v3"));
    setDeepThinking(newDeepThinking);
  };
  // 停止回答
  const handleStopAnswer = () => {
    setSendBtnState("default");
    dispatch(setLoading(false));
    // 关闭 SSE
    eventSource?.close();
  };

  return (
    <>
      {contextHolder}
      <div className="border border-gray-300 p-8 rounded-8 hover:border-[#4096ff] transition-all duration-200">
        <TextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="有问题，尽管问，shift+enter换行"
          className="!border-none !shadow-none"
          value={value}
          onChange={e => setValue(e.target.value)}
          onPressEnter={handleConfirm}
        />
        <div className="flex items-center justify-between">
          <Button color={deepThinking ? "primary" : "default"} variant="outlined" onClick={handleDeepThinking}>
            深度思考
          </Button>
          {<MyInputIcon state={sendBtnState} value={value} handleStopAnswer={handleStopAnswer} />}
        </div>
      </div>
    </>
  );
};

export default MyInput;
