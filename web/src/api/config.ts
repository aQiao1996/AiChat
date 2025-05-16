import { message as antdMessage } from "antd";

/**
 * 请求方法类型
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * 请求配置
 */
export interface FetchOptions<T = any> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: T;
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
const checkStatus = async (response: Response): Promise<Response> => {
  if (response.ok) return response;
  // 下面这行会导致 同一个 Response 对象的 body 流被多次读取​​, 然后报 Failed to execute 'json' on 'Response': body stream already read 错误
  // const errRes = await response.json();
  const errRes = await response.clone().json();
  const error = new Error(errRes.message) as ApiError;
  error.response = errRes;
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
  const token = localStorage.getItem("token");
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
const responseInterceptor = <T>(response: ApiResponse<T>): T => {
  if (response.code !== 200) {
    throw new Error(response.message || "Error");
  }
  return response.data;
};

/**
 * 错误处理
 */
const errorHandler = (error: any): never => {
  if (isApiError(error)) {
    if (error.response) {
      switch (error.response.code) {
        case 400:
          // antdMessage.error 直接使用会报错
          antdMessage.open({ content: "请求错误", type: "error" });
          break;
        case 401:
          antdMessage.open({ content: "未授权，请登录", type: "error" });
          // 跳转登录页
          window.location.href = "/login";
          break;
        case 403:
          antdMessage.open({ content: "拒绝访问", type: "error" });
          break;
        case 404:
          antdMessage.open({ content: `请求地址出错: ${error.response.path || ""}`, type: "error" });
          break;
        case 500:
          antdMessage.open({ content: "服务器内部错误", type: "error" });
          break;
        default:
          antdMessage.open({ content: `连接错误 ${error.response.code}`, type: "error" });
      }
    } else {
      if (error.message.includes("timeout")) {
        antdMessage.open({ content: "请求超时", type: "error" });
      } else {
        antdMessage.open({ content: "网络异常，请检查网络连接", type: "error" });
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
const fetchRequest = async <T = any>(url: string, options: FetchOptions<T> = {}): Promise<T> => {
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

  // 规范化 headers
  const normalizedHeaders = {
    ...defaultOptions.headers,
    ...headers,
  } satisfies Record<string, string>;

  // 设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(finalUrl, {
      ...finalOptions,
      headers: normalizedHeaders, // 使用规范化 headers
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 处理非JSON响应
    if (!response.headers.get("content-type")?.includes("application/json")) {
      const text = await response.text();
      return text as unknown as T;
    }

    // todo 会导致 Failed to execute 'json' on 'Response': body stream already read
    // 检查状态
    checkStatus(response);

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
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  options?: Omit<FetchOptions<T>, "method" | "body">
): Promise<T> => {
  return fetchRequest<T>(url, { ...options, method: "GET", params });
};

/**
 * 封装POST请求
 */
export const post = <T = any>(
  url: string,
  body?: T,
  options?: Omit<FetchOptions<T>, "method" | "body">
): Promise<T> => {
  return fetchRequest<T>(url, { ...options, method: "POST", body });
};

/**
 * 封装PUT请求
 */
export const put = <T = any>(url: string, body?: T, options?: Omit<FetchOptions<T>, "method" | "body">): Promise<T> => {
  return fetchRequest<T>(url, { ...options, method: "PUT", body });
};

/**
 * 封装DELETE请求
 */
export const del = <T = any>(
  url: string,
  params?: Record<string, any>,
  options?: Omit<FetchOptions<T>, "method" | "body">
): Promise<T> => {
  return fetchRequest<T>(url, { ...options, method: "DELETE", params });
};

/**
 * 封装PATCH请求
 */
export const patch = <T = any>(
  url: string,
  body?: T,
  options?: Omit<FetchOptions<T>, "method" | "body">
): Promise<T> => {
  return fetchRequest<T>(url, { ...options, method: "PATCH", body });
};

/**
 * 带loading的请求封装
 */
export const requestWithLoading = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: T,
  params?: Record<string, any>,
  options?: Omit<FetchOptions<T>, "method" | "body" | "params">
) => {
  // 这里可以添加loading逻辑
  // const loading = message.loading('请求中...', 0);
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
  } finally {
    // loading();
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
