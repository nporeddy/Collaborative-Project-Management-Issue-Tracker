import { api } from "./client";

export interface Project {
  id: string;
  name: string;
  key: string;
  workspaceId: string;
  createdAt: string;
}

export const getProjects = async (workspaceId: string): Promise<Project[]> => {
  const res = await api.get(`/workspaces/${workspaceId}/projects`);
  return res.data;
};

export const createProject = async (
  workspaceId: string,
  data: { name: string; key: string },
): Promise<Project> => {
  const res = await api.post(`/workspaces/${workspaceId}/projects`, data);
  return res.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};
