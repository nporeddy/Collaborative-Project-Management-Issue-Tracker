import { api } from "./client";

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  type: 'STORY' | 'BUG' | 'TASK';     
  projectId: string;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;  // ← ADD
  createdAt: string;
}

export interface IssueListResponse {
  items: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getIssues = async (
  projectId: string,
  params?: { page?: number; limit?: number; status?: string },
): Promise<IssueListResponse> => {
  const res = await api.get(`/projects/${projectId}/issues`, { params });
  return res.data;
};

export const createIssue = async (
  projectId: string,
  data: { title: string; priority?: string; type?: 'STORY' | 'BUG' | 'TASK' }
): Promise<Issue> => {
  const res = await api.post(`/projects/${projectId}/issues`, data);
  return res.data;
};

export interface IssueDetail extends Issue {
  description?: string;
  comments: {
    id: string;
    body: string;
    authorId: string;
    createdAt: string;
    author?: { id: string; name: string; email: string };
  }[];
  labels: { id: string; name: string; color: string; issueId: string }[];
  assignee?: { id: string; name: string; email: string };
  project?: { id: string; name: string; workspaceId: string }; 

}

export const getIssue = async (id: string): Promise<IssueDetail> => {
  const res = await api.get(`/issues/${id}`);
  return res.data;
};

export const updateIssue = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: Issue["status"];
    priority: Issue["priority"];
    type: Issue['type']; 
    assigneeId: string | null;
  }>,
): Promise<Issue> => {
  const res = await api.patch(`/issues/${id}`, data);
  return res.data;
};

export const deleteIssue = async (id: string): Promise<void> => {
  await api.delete(`/issues/${id}`);
};
