import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProConfigProvider, ProFormText } from "@ant-design/pro-components";
import { message, Tabs, theme, type TabsProps } from "antd";
import { useCallback, useState } from "react";
import AvatarImage from "@/assets/images/avatar.png";
import { useAppDispatch } from "@/store";
import { login, setToken } from "@/store/modules/user";
import { useNavigate } from "react-router-dom";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { verifyRecaptchaApi, type ILoginParams } from "@/api/login";

type LoginType = "account";

const items: TabsProps["items"] = [{ key: "account", label: "账号密码登录" }];

const Page = () => {
  const [loginType, setLoginType] = useState<LoginType>("account");
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  /**
   * 处理 reCAPTCHA 验证
   * @returns 验证结果
   * @throws 当验证失败时抛出错误信息
   * @description 调用 reCAPTCHA 进行验证，成功后返回 true，失败则返回 false
   */
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log("reCAPTCHA 未加载完成");
      return false;
    }
    try {
      // 调用 reCAPTCHA 获取 token
      const captchaToken = await executeRecaptcha("login"); // "login" 是 action 名称（自定义）
      await verifyRecaptchaApi(captchaToken, "login");
      return true;
    } catch (error) {
      console.error("reCAPTCHA 验证失败", error);
      messageApi.error("reCAPTCHA 验证失败，请重试");
      return false;
    }
  }, [executeRecaptcha]);

  /**
   * 处理登录表单提交
   * @param values 登录表单参数
   * @throws 当登录失败时抛出错误信息
   * @description 执行登录操作，成功后设置token并跳转到首页，失败则显示错误信息
   */
  const onFinish = async (values: ILoginParams) => {
    const isVerified = await handleReCaptchaVerify();
    if (!isVerified) return;
    const { data } = await dispatch(login(values)).unwrap();
    dispatch(setToken(data.token));
    messageApi.success("登录成功");
    setTimeout(() => {
      navigate("/home");
    }, 1000);
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
      {/* 谷歌人机验证 v3 */}
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_APP_GOOGLE_RECAPTCHA_SITE_KEY}>
        <Page />
      </GoogleReCaptchaProvider>
    </ProConfigProvider>
  );
};
