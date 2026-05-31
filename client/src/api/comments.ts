import { api } from "./client";

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  issueId: string;
  createdAt: string;
  author?: { id: string; name: string; email: string };
}

export const getComments = async (issueId: string): Promise<Comment[]> => {
  const res = await api.get(`/issues/${issueId}/comments`);
  return res.data;
};

export const createComment = async (
  issueId: string,
  body: string,
): Promise<Comment> => {
  const res = await api.post(`/issues/${issueId}/comments`, { body });
  return res.data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments/${id}`);
};
