import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProConfigProvider, ProFormText } from "@ant-design/pro-components";
import { message, Tabs, theme, type TabsProps } from "antd";
import { useState } from "react";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppDispatch } from "@/store";
import { login, setToken } from "@/store/modules/user";
import { useNavigate } from "react-router-dom";
import type { ILoginParams } from "@/api/login";

type LoginType = "account";

const items: TabsProps["items"] = [{ key: "account", label: "账号密码登录" }];

const Page = () => {
  const [loginType, setLoginType] = useState<LoginType>("account");
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * 处理登录表单提交
   * @param values 登录表单参数
   * @throws 当登录失败时抛出错误信息
   * @description 执行登录操作，成功后设置token并跳转到首页，失败则显示错误信息
   */
  const onFinish = async (values: ILoginParams) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      dispatch(setToken(result.token));
      messageApi.success("登录成功");
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error: any) {
      messageApi.error(error.message || "未知错误");
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ backgroundColor: "white", height: "100vh" }}>
        <LoginFormPage
          backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
          backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
          logo={AvatarImage}
          title="胖虎"
          containerStyle={{ backgroundColor: "rgba(0, 0, 0,0.65)", backdropFilter: "blur(4px)" }}
          initialValues={{ username: "panghu", password: "panghu666" }}
          onFinish={onFinish}
        >
          {/*  */}
          <Tabs
            centered
            items={items}
            activeKey={loginType}
            onChange={activeKey => setLoginType(activeKey as LoginType)}
          ></Tabs>
          {/*  */}
          {loginType === "account" && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: "large",
                  prefix: <UserOutlined style={{ color: token.colorText }} className={"prefixIcon"} />,
                }}
                placeholder={"请输入用户名"}
                rules={[{ required: true, message: "请输入用户名!" }]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: "large",
                  prefix: <LockOutlined style={{ color: token.colorText }} className={"prefixIcon"} />,
                }}
                placeholder={"请输入密码"}
                rules={[{ required: true, message: "请输入密码！" }]}
              />
            </>
          )}
        </LoginFormPage>
      </div>
    </>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};
