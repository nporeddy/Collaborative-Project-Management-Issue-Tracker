import { api } from './client';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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

export const getIssues = async (projectId: string): Promise<IssueListResponse> => {
  const res = await api.get(`/projects/${projectId}/issues`);
  return res.data;
};

export const createIssue = async (
  projectId: string,
  data: { title: string; priority?: string }
): Promise<Issue> => {
  const res = await api.post(`/projects/${projectId}/issues`, data);
  return res.data;
};