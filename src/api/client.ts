import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { secureStorage } from "@/utils/secureStorage";
import type { ApiError } from "@/types";

/**
 * Single Axios instance used by every service in src/services/*.
 * Do not create additional axios instances elsewhere.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request interceptor: attach access token ----
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ---- Refresh-token handling ----
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Deliberately uses a bare axios call (not apiClient) to avoid interceptor recursion.
  const response = await axios.post(`${env.API_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data as {
    accessToken: string;
    refreshToken: string;
  };

  await secureStorage.setTokens(accessToken, newRefreshToken);
  return accessToken;
}

// Called by the auth store when a refresh fails and the session must end.
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

// ---- Response interceptor: normalize errors + retry on 401 ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await secureStorage.clearTokens();
        onSessionExpired?.();
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as Partial<ApiError> | undefined;
    return {
      statusCode: error.response.status,
      message: data?.message ?? friendlyMessageForStatus(error.response.status),
      errors: data?.errors,
    };
  }
  if (error.request) {
    return { statusCode: 0, message: "Network error. Please check your connection." };
  }
  return { statusCode: 0, message: "Something went wrong. Please try again." };
}

function friendlyMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "That request wasn't valid. Please check the details and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "This conflicts with existing data.";
    case 422:
      return "Some fields need to be corrected.";
    case 429:
      return "You're doing that too much. Please slow down and try again shortly.";
    default:
      return status >= 500 ? "Our servers are having trouble. Please try again shortly." : "Something went wrong.";
  }
}
