import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import Navbar from "./components/Navbar";

const { Header, Sider, Content } = Layout;

const LayoutPage = () => {
  const { token } = theme.useToken();
  const { colorBgContainer, borderRadiusLG } = token;

  return (
    <Layout className="h-screen">
      <Sider width="20%" style={{ background: colorBgContainer, marginRight: "24px" }}>
        {/*  */}
        <Navbar />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer }}>Header</Header>
        <Content style={{ background: colorBgContainer, margin: "24px 24px 0 0", borderRadius: borderRadiusLG }}>
          {/* 二级路由出口 */}
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
