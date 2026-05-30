import { api } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthUser> {
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
