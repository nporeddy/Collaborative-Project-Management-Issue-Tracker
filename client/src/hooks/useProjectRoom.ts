import { useEffect } from "react";
import { getSocket } from "../lib/socket";

export function useProjectRoom(projectId: string | undefined) {
  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("project:join", projectId);

    return () => {
      socket.emit("project:leave", projectId);
    };
  }, [projectId]);
}
