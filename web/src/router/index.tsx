import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";
import NotFound from "@/pages/NotFound";

// * 创建路由表
export const router = [
  {
    path: "/",
    element: <Navigate to="/home" />, // 重定向
  },
  {
    path: "/login",
    element: <Login />, // 重定向
  },
  {
    element: <Layout />,
    children: [{ path: "home", element: <Home />, meta: { name: "首页总览" } }],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default createBrowserRouter(router);
