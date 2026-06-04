import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api/members";

export function useMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembers(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, 
  });
}
