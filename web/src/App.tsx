import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "@ant-design/v5-patch-for-react-19"; // antd v5 兼容 react 19  https://ant-design.antgroup.com/docs/react/v5-for-19-cn
import router from "@/router";
import store, { persistor } from "@/store";
import { PersistGate } from "redux-persist/integration/react";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
};
export default App;
