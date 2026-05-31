import { api } from "./client";

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  assigneeId?: string;
  createdAt: string;
}

interface IssueListResponse {
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
  data: { title: string; priority?: string },
): Promise<Issue> => {
  const res = await api.post(`/projects/${projectId}/issues`, data);
  return res.data;
};

// Add to issues.ts (alongside existing exports)

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
    assigneeId: string | null;
  }>,
): Promise<Issue> => {
  const res = await api.patch(`/issues/${id}`, data);
  return res.data;
};

export const deleteIssue = async (id: string): Promise<void> => {
  await api.delete(`/issues/${id}`);
};
