import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIssues,
  createIssue,
  getIssue,
  updateIssue,
  deleteIssue,
} from "../api/issues";

export function useIssues(projectId: string, limit = 20) {
  return useQuery({
    queryKey: ["issues", projectId, limit],
    queryFn: () => getIssues(projectId, { limit }),
    enabled: !!projectId,
  });
}
export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; priority?: string }) =>
      createIssue(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
    },
  });
}

export function useIssue(id: string | undefined) {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: () => getIssue(id!),
    enabled: !!id,
  });
}

export function useUpdateIssue(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateIssue>[1]) =>
      updateIssue(id, data),
    onSuccess: (updated) => {
      // Invalidate this issue's detail cache + the list it belongs to
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({
        queryKey: ["issues", updated.projectId],
      });
    },
  });
}

export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
    },
  });
}
