import { Prism } from "./Prism";
import { useAppSelector } from "@/store";

const MyHeader = () => {
  const { title } = useAppSelector(state => state.chat);
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-20 font-bold text-gray-800">{title}</div>
      <div>
        <Prism />
      </div>
    </div>
  );
};

export default MyHeader;
