import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIssues,
  createIssue,
  getIssue,
  updateIssue,
  deleteIssue,
} from "../api/issues";
import type { IssueListResponse } from "../api/issues";

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

export function useUpdateAnyIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Parameters<typeof updateIssue>[1]) =>
      updateIssue(id, data),

    // Run BEFORE the mutation fires — this is the optimistic part
    onMutate: async ({ id, ...changes }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["issues", projectId] });

      // Snapshot the previous state so we can roll back on error
      const snapshots: Array<
        [readonly unknown[], IssueListResponse | undefined]
      > = [];
      const queries = queryClient.getQueriesData<IssueListResponse>({
        queryKey: ["issues", projectId],
      });

      for (const [key, value] of queries) {
        snapshots.push([key, value]);
        if (!value) continue;

        // Optimistically write the updated issue into the cache
        queryClient.setQueryData<IssueListResponse>(key, {
          ...value,
          items: value.items.map((issue) =>
            issue.id === id ? { ...issue, ...changes } : issue,
          ),
        });
      }

      return { snapshots };
    },

    // On failure, restore everything from the snapshot
    onError: (_err, _vars, context) => {
      if (!context?.snapshots) return;
      for (const [key, value] of context.snapshots) {
        queryClient.setQueryData(key, value);
      }
    },

    // After success or failure, refetch from the server to be fully in sync
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["issue", variables.id] });
    },
  });
}
