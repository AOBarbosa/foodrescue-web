import axios, { type AxiosResponse } from "axios";
import { expireSession, getToken } from "@/lib/auth/session";
import type { ApiResponse } from "@/types/api";
import { toAppError } from "./errors";

/**
 * The only Axios instance in the app. Nothing outside `lib/api` imports axios.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const appError = toAppError(error);
    // A 401 on a request that carried a token means the session is no longer
    // valid; a 401 without one (e.g. wrong password on login) is just an error.
    const sentToken =
      axios.isAxiosError(error) && Boolean(error.config?.headers?.Authorization);
    if (appError.status === 401 && sentToken) {
      expireSession();
    }
    return Promise.reject(appError);
  },
);

/** Unwraps `ApiResponse<T>.data` from a successful response. */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data as T;
}
