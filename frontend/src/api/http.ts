/**
 * 全局 axios 实例。
 * - 自动附 JWT
 * - 401 自动清 token + 跳 /login
 * - 业务错误（{detail:{code,message}}）转 ElMessage
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { ElMessage } from "element-plus";

const TOKEN_KEY = "swu_face_token";
const REFRESH_KEY = "swu_face_refresh";

type RequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, refresh?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const http: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !(config as RequestConfig).skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (error: AxiosError<{ detail?: { code?: string; message?: string } | string }>) => {
    const status = error.response?.status ?? 0;
    const detail = error.response?.data?.detail;
    const msg =
      (typeof detail === "string"
        ? detail
        : detail?.message) ||
      error.message ||
      "请求失败";

    if (status === 401) {
      clearToken();
      // 避免登录页本身循环跳转
      if (!location.pathname.startsWith("/login")) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        location.replace(`/login?redirect=${redirect}`);
      }
    } else if (status === 403) {
      ElMessage.warning("权限不足");
    } else if (status >= 500) {
      ElMessage.error("服务器开了小差，请稍后再试");
    } else if (msg) {
      ElMessage.error(msg);
    }

    return Promise.reject(error);
  },
);

/** 类型友好的小包装：直接拿到 data，不用 `.data` 套娃。 */
export async function request<T = unknown>(config: RequestConfig): Promise<T> {
  const r = await http.request<T>(config);
  return r.data;
}
