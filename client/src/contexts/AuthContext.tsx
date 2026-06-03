import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi, type AuthUser } from "../api/auth";
import { setAuthToken, registerAuthCallbacks } from "../api/client";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { getSocket } from "../lib/socket";
import { registerTokenGetter } from "../lib/socket";
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  socketConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(() => {
    return getSocket()?.connected ?? false;
  });
  useEffect(() => {
    registerAuthCallbacks({
      onTokenRefreshed: (_token) => {},
      onAuthFailure: () => {
        setAuthToken(null);
        setUser(null);
      },
    });
  }, []);

  useEffect(() => {
    registerTokenGetter(async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAuthToken(accessToken);
        return accessToken;
      } catch {
        return null;
      }
    });
  }, []);
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { accessToken } = await authApi.refresh();
        setAuthToken(accessToken);
        const me = await authApi.me();
        if (!cancelled) {
          setUser(me);
          connectSocket(accessToken);
        }
      } catch {
        // No valid refresh cookie → user is not logged in..
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [user]);
  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password });
    setAuthToken(result.accessToken);
    setUser(result.user);
    connectSocket(result.accessToken);
  }

  async function register(email: string, password: string, name: string) {
    await authApi.register({ email, password, name });
    // Auto-login after register
    await login(email, password);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      disconnectSocket();
      setAuthToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, socketConnected, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
