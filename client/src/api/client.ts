import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Callback that AuthContext will register so we can update the in-memory token
// when the interceptor silently refreshes it.
let onTokenRefreshed: ((token: string) => void) | null = null;
let onAuthFailure: (() => void) | null = null;

export function registerAuthCallbacks(opts: {
  onTokenRefreshed: (token: string) => void;
  onAuthFailure: () => void;
}) {
  onTokenRefreshed = opts.onTokenRefreshed;
  onAuthFailure = opts.onAuthFailure;
}

// Tracks a single in-flight refresh so multiple parallel 401s don't trigger
// multiple refresh calls.
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

    // Only handle 401s
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh on auth endpoints themselves — that would loop
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

      // Retry the original request with the new token
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      // Refresh failed → session is truly dead
      onAuthFailure?.();
      return Promise.reject(refreshErr);
    }
  },
);
