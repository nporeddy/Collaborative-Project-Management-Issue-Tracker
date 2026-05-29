import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIssues, createIssue } from "../api/issues";

export function useIssues(projectId: string) {
  return useQuery({
    queryKey: ["issues", projectId],
    queryFn: () => getIssues(projectId),
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
