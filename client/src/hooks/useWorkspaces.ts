import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaces, createWorkspace } from "../api/workspaces";
import { api } from "../api/client"
export function useWorkspaces() {
  return useQuery({ queryKey: ["workspaces"], queryFn: getWorkspaces });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; name: string }) => {
      const res = await api.patch(`/workspaces/${vars.id}`, { name: vars.name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workspaces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["my-roles"] });   
    },
  });
}