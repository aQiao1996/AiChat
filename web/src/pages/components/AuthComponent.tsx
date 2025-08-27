import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store";

const AuthComponent = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAppSelector(state => state.user);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default AuthComponent;
