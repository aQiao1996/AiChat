import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProConfigProvider, ProFormText } from "@ant-design/pro-components";
import { Tabs, theme } from "antd";
import { useState } from "react";
import AvatarImage from "@/assets/images/avatar.png";

type LoginType = "account";

const Page = () => {
  const [loginType, setLoginType] = useState<LoginType>("account");
  const { token } = theme.useToken();
  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        logo={AvatarImage}
        title="胖虎"
        containerStyle={{ backgroundColor: "rgba(0, 0, 0,0.65)", backdropFilter: "blur(4px)" }}
        initialValues={{ username: "panghu", password: "123456" }}
      >
        <Tabs centered activeKey={loginType} onChange={activeKey => setLoginType(activeKey as LoginType)}>
          <Tabs.TabPane key={"account"} tab={"账号密码登录"} />
        </Tabs>
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
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};
