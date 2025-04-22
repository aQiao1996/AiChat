import { Button, Input } from "antd";
import { useState } from "react";
import { useAppDispatch } from "@/store";
import { updateModel } from "@/store/modules/chat";

const { TextArea } = Input;

interface IProps {
  sendMessage: (message: string) => void;
}

const MyInput = ({ sendMessage }: IProps) => {
  const [value, setValue] = useState(""); // 输入框的值
  const [deepThinking, setDeepThinking] = useState(false);
  const dispatch = useAppDispatch();

  // 是否深度思考
  const handleConfirm = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 搜索
    if (!event.shiftKey && event.code === "Enter") {
      event.preventDefault();
      sendMessage(value);
      setValue("");
      return;
    }
    // 换行，获取光标位置
    const lastIdx = value.length;
    const target = event.target as HTMLInputElement;
    const startIdx = target.selectionStart || lastIdx;
    const endIdx = target.selectionEnd || lastIdx;
    console.log(startIdx, endIdx, value.slice(0, startIdx) + "\n" + value.slice(endIdx));
    setValue(val => val.slice(0, startIdx) + "\n" + val.slice(endIdx));
    // 设置光标位置
    setTimeout(() => {
      target.selectionStart = startIdx + 1;
      target.selectionEnd = startIdx + 1;
    }, 0);
  };
  const handleDeepThinking = () => {
    const newDeepThinking = !deepThinking;
    dispatch(updateModel(newDeepThinking ? "deepseek-r1" : "deepseek-v3"));
    setDeepThinking(newDeepThinking);
  };

  return (
    <div className="border border-gray-300 p-8 rounded-8 hover:border-[#4096ff] transition-all duration-200">
      <TextArea
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder="有问题，尽管问，shift+enter换行"
        className="!border-none !shadow-none"
        value={value}
        onChange={e => setValue(e.target.value)}
        onPressEnter={handleConfirm}
      />
      <div>
        <Button color={deepThinking ? "primary" : "default"} variant="outlined" onClick={handleDeepThinking}>
          深度思考
        </Button>
      </div>
    </div>
  );
};

export default MyInput;
