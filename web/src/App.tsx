import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "@ant-design/v5-patch-for-react-19"; // antd v5 兼容 react 19  https://ant-design.antgroup.com/docs/react/v5-for-19-cn
import router from "@/router";
import store from "@/store";

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};
export default App;
