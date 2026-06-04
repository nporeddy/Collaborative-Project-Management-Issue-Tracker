import { api } from "./client";

export interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const getMembers = async (workspaceId: string): Promise<Member[]> => {
  const res = await api.get(`/workspaces/${workspaceId}/members`);
  return res.data;
};

export const addMember = async (
  workspaceId: string,
  data: { email: string; role?: "ADMIN" | "MEMBER" }
): Promise<Member> => {
  const res = await api.post(`/workspaces/${workspaceId}/members`, data);
  return res.data;
};

export const removeMember = async (
  workspaceId: string,
  userId: string
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
};

export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  role: "ADMIN" | "MEMBER"
): Promise<Member> => {
  const res = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, {
    role,
  });
  return res.data;
};