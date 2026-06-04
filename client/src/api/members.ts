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
