import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi, type AuthUser } from "../api/auth";
import { setAuthToken, registerAuthCallbacks } from "../api/client";
import { connectSocket, disconnectSocket } from "../lib/socket";
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
