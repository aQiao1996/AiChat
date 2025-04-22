import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";

// * 创建路由表
export const router = [
  {
    path: "/",
    element: <Navigate to="/home" />, // 重定向
  },
  {
    element: <Layout />,
    children: [{ path: "home", element: <Home />, meta: { name: "首页总览" } }],
  },
  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
];

export default createBrowserRouter(router);