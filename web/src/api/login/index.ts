import request from "@/api/config";

export interface ILoginParams {
  username: string;
  password: string;
}

export interface ILoginResponse {
  id: number;
  token: string;
  username: string;
}

/**
 * 用户登录接口
 * @param body 登录参数，包含用户名和密码等信息
 * @returns 返回登录请求的Promise对象
 */
export const loginApi = (body: ILoginParams) => {
  return request.post<ILoginParams, ILoginResponse>("/user/login", body);
};
