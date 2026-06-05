import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMembers,
  addMember,
  removeMember,
  updateMemberRole,
} from "../api/members";
import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";


export function useMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembers(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role?: "ADMIN" | "MEMBER" }) =>
      addMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: string; role: "ADMIN" | "MEMBER" }) =>
      updateMemberRole(workspaceId, vars.userId, vars.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });
}

export function useMyRole(workspaceId: string | undefined): "OWNER" | "ADMIN" | "MEMBER" | null {
  const { user } = useAuth();
  const { data: members } = useMembers(workspaceId);

  return useMemo(() => {
    if (!user || !members) return null;
    const me = members.find((m) => m.user.id === user.id);
    return me?.role ?? null;
  }, [user, members]);
}

export type RoleMap = Record<string, "OWNER" | "ADMIN" | "MEMBER">;

export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async (): Promise<RoleMap> => {
      const res = await api.get("/me/roles");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}