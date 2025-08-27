import { message as antdMessage } from "antd";
import store from "@/store";
import { setToken } from "@/store/modules/user";
import { createRoot } from "react-dom/client";
import React from "react";
import Loading from "@/pages/components/Loading";

/**
 * 请求方法类型
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * 请求配置
 */
export interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  credentials?: RequestCredentials; // 'omit' | 'same-origin' | 'include'
  requiresToken?: boolean;
}

/**
 * 响应数据类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 错误响应类型
 */
export interface ApiError extends Error {
  response?: {
    code: number;
    message: string;
    method: HttpMethod;
    path: string;
    timestamp: string;
  };
}

function isApiError(error: unknown): error is ApiError {
  return (error as ApiError)?.response !== undefined;
}

/**
 * 默认请求配置
 */
const defaultOptions: FetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  requiresToken: true, // 默认需要token
};

/**
 * 检查响应状态
 */
// const checkStatus = async (response: Response): Promise<Response> => {
//   if (response.ok) return response;
//   const errRes = await response.clone().json();
//   const error = new Error(errRes.message) as ApiError;
//   error.response = errRes;
//   throw error;
// };
const checkStatus = async (response: Response) => {
  if (response.ok) return; // 2xx 状态码直接放行

  // 统一处理错误
  let errorPayload: any;
  const contentType = response.headers.get("content-type");
  const responseClone = response.clone();

  try {
    errorPayload = contentType?.includes("application/json") ? await responseClone.json() : await responseClone.text();
  } catch {
    errorPayload = `Failed to parse error response (status ${responseClone.status})`;
  }

  // 构造包含详细信息的错误对象
  const error = new Error(`HTTP ${response.status} ${response.statusText}`) as any;
  error.response = errorPayload;

  throw error;
};

/**
 * 格式化请求参数
 */
const formatParams = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
};

/**
 * 创建完整的URL
 */
const createUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url;
  const queryString = formatParams(params);
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * 类型守卫：检查是否为ApiResponse
 */
function isApiResponse<T>(data: any): data is ApiResponse<T> {
  return typeof data === "object" && data !== null && "code" in data && "message" in data && "data" in data;
}

/**
 * 请求拦截器
 */
const requestInterceptor = async (
  url: string,
  options: FetchOptions
): Promise<{ url: string; options: FetchOptions }> => {
  // 添加认证token（仅当requiresToken为true时）
  const { requiresToken = true } = options;
  const token = store.getState().user.token;
  const newOptions = { ...options };

  if (requiresToken && token) {
    newOptions.headers = {
      ...newOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // 处理GET请求的params
  if (newOptions.method === "GET" && newOptions.params) {
    url = createUrl(url, newOptions.params);
    delete newOptions.params;
  }

  return { url, options: newOptions };
};

/**
 * 响应拦截器
 */
// const responseInterceptor = <T>(response: ApiResponse<T>): T => {
//   if (response.code !== 200) {
//     throw new Error(response.message || "Error");
//   }
//   return response.data;
// };
// 还是不做处理,全部返回
const responseInterceptor = <T>(response: ApiResponse<T>) => {
  if (response.code !== 200) {
    throw new Error(response.message || "Error");
  }
  return response;
};

/**
 * 错误处理
 */
const errorHandler = (error: any): never => {
  if (isApiError(error)) {
    if (error.response) {
      const response = error.response;
      switch (response.code) {
        case 400:
          antdMessage.open({ content: response.message || "请求错误", type: "error" });
          break;
        case 401:
          antdMessage.open({ content: "未授权，请登录", type: "error" });
          store.dispatch(setToken("")); // 清除 token ,会直接走 AuthComponent 组件
          // 跳转登录页
          // window.location.href = "/login";
          break;
        case 403:
          antdMessage.open({ content: `拒绝访问 ${response.message || ""}`, type: "error" });
          break;
        case 404:
          antdMessage.open({ content: `请求地址出错: ${response.path || ""}`, type: "error" });
          break;
        case 500:
          antdMessage.open({ content: response.message || "服务器内部错误", type: "error" });
          break;
        default:
          antdMessage.open({ content: `连接错误 ${response.code}`, type: "error" });
      }
    } else {
      if (error.message.includes("timeout")) {
        antdMessage.open({ content: "请求超时", type: "error" });
      } else {
        antdMessage.open({ content: "网络异常，请联系管理员", type: "error" });
      }
    }
  } else if (error instanceof TypeError) {
    antdMessage.open({ content: `网络异常:${error.message}`, type: "error" });
  } else {
    antdMessage.open({ content: error, type: "error" });
  }
  throw error;
};

/**
 * 封装fetch请求
 */
const fetchRequest = async <T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> => {
  const { method = "GET", headers, body, timeout = 10000 } = options;

  // 应用请求拦截器
  const requestUrl = import.meta.env.VITE_APP_BASE_URL + url; // 添加前缀
  const { url: finalUrl, options: finalOptions } = await requestInterceptor(requestUrl, {
    ...defaultOptions,
    ...options,
    method: method.toUpperCase() as HttpMethod,
    headers: {
      ...defaultOptions.headers,
      ...headers,
    },
  });

  // 设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(finalUrl, {
      ...finalOptions,
      headers: finalOptions.headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 检查状态
    await checkStatus(response);

    // 解析JSON响应
    const responseData = await response.json();

    // 如果是ApiResponse格式，处理响应
    if (isApiResponse<T>(responseData)) {
      return responseInterceptor<T>(responseData);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    errorHandler(error);
    throw error;
  }
};

/**
 * 封装GET请求
 */
export const get = <T>(
  url: string,
  params?: Record<string, any>,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<ApiResponse<T>> => {
  return fetchRequest<T>(url, { ...options, method: "GET", params });
};

/**
 * 封装POST请求
 */
export const post = <T>(
  url: string,
  body?: any,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<ApiResponse<T>> => {
  return fetchRequest<T>(url, { ...options, method: "POST", body });
};

/**
 * 封装PUT请求
 */
export const put = <T>(
  url: string,
  body?: any,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<ApiResponse<T>> => {
  return fetchRequest<T>(url, { ...options, method: "PUT", body });
};

/**
 * 封装DELETE请求
 */
export const del = <T>(
  url: string,
  params?: Record<string, any>,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<ApiResponse<T>> => {
  return fetchRequest<T>(url, { ...options, method: "DELETE", params });
};

/**
 * 封装PATCH请求
 */
export const patch = <T>(
  url: string,
  body?: any,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<ApiResponse<T>> => {
  return fetchRequest<T>(url, { ...options, method: "PATCH", body });
};

// 当前正在请求的数量
let requestCount = 0;

/**
 * 显示 loading
 */
function showLoading() {
  if (requestCount === 0) {
    const dom = document.createElement("div");
    dom.setAttribute("id", "loading");
    dom.style.position = "fixed";
    dom.style.top = "0";
    dom.style.left = "0";
    dom.style.width = "100%";
    dom.style.height = "100%";
    // dom.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    dom.style.display = "flex";
    dom.style.justifyContent = "center";
    dom.style.alignItems = "center";
    dom.style.zIndex = "9999";
    document.body.appendChild(dom);
    createRoot(dom).render(React.createElement(Loading));
  }
  requestCount++;
}

/**
 * 隐藏 loading
 */
function hideLoading() {
  requestCount--;
  if (requestCount === 0) {
    const loadingDom = document.getElementById("loading");
    if (loadingDom) {
      document.body.removeChild(loadingDom);
    }
  }
}

/**
 * 带 loading 的请求封装
 */
export const requestWithLoading = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  params?: Record<string, any>,
  options?: Omit<FetchOptions, "method" | "body" | "params">
): Promise<ApiResponse<T>> => {
  showLoading();
  try {
    if (method === "GET") {
      return await get<T>(url, params, options);
    } else if (method === "POST") {
      return await post<T>(url, data, options);
    } else if (method === "PUT") {
      return await put<T>(url, data, options);
    } else if (method === "DELETE") {
      return await del<T>(url, params, options);
    } else if (method === "PATCH") {
      return await patch<T>(url, data, options);
    }
    throw new Error("Unsupported HTTP method");
  } finally {
    hideLoading();
  }
};

export default {
  get,
  post,
  put,
  delete: del,
  patch,
  requestWithLoading,
};
