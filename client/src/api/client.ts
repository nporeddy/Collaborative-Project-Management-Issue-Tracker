import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

let onTokenRefreshed: ((token: string) => void) | null = null;
let onAuthFailure: (() => void) | null = null;

export function registerAuthCallbacks(opts: {
  onTokenRefreshed: (token: string) => void;
  onAuthFailure: () => void;
}) {
  onTokenRefreshed = opts.onTokenRefreshed;
  onAuthFailure = opts.onAuthFailure;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => res.data.accessToken as string)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    if (
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await refreshAccessToken();
      setAuthToken(newToken);
      onTokenRefreshed?.(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      onAuthFailure?.();
      return Promise.reject(refreshErr);
    }
  },
);
