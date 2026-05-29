import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject, getProject } from "../api/projects";

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => getProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; key: string }) =>
      createProject(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}
