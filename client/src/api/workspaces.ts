import { api } from "./client";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const res = await api.get("/workspaces");
  return res.data;
};

export const createWorkspace = async (name: string): Promise<Workspace> => {
  const res = await api.post("/workspaces", { name });
  return res.data;
};
