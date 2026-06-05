import { api } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  emailVerified?: string | null;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface RegisterResponse {
  message: string;
  email: string;
}

export const authApi = {
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<RegisterResponse> {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  async verifyEmail(data: {
    email: string;
    code: string;
  }): Promise<LoginResponse> {
    const res = await api.post("/auth/verify-email", data);
    return res.data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  },

  async me(): Promise<AuthUser> {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await api.post("/auth/refresh");
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
