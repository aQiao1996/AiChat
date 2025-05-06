import { Prism } from "./Prism";

const MyHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>left</div>
      <div>
        <Prism />
      </div>
    </div>
  );
};

export default MyHeader;
