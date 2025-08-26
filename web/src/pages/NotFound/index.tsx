import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  /**
   * 处理跳转到首页
   * @description 点击按钮后，跳转到首页
   */
  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-30 font-bold">404 - NotFound</div>
      <Button type="primary" className="!mt-20" onClick={handleGoHome}>
        去首页
      </Button>
    </div>
  );
};

export default NotFound;
