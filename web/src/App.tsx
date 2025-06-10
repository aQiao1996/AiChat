import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "@ant-design/v5-patch-for-react-19"; // antd v5 兼容 react 19  https://ant-design.antgroup.com/docs/react/v5-for-19-cn
import router from "@/router";
import store, { persistor } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleReCaptchaProvider
          reCaptchaKey={import.meta.env.VITE_APP_GOOGLE_RECAPTCHA_SITE_KEY}
          scriptProps={{
            async: true, // 异步加载
            defer: true, // 延迟加载
            appendTo: "head", // 加载到 head 标签中
          }}
          useRecaptchaNet={true} // 国内谷歌验证 不开的话会去访问谷歌的 verify
          language="zh-CN" // 语言
        >
          <RouterProvider router={router} />
        </GoogleReCaptchaProvider>
      </PersistGate>
    </Provider>
  );
};
export default App;
