import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, createWorkspace } from '../api/workspaces';

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: getWorkspaces });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      // refetch the list automatically after creating
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}