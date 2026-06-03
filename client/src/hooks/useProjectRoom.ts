import { useEffect } from "react";
import { getSocket } from "../lib/socket";

export function useProjectRoom(projectId: string | undefined) {
  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    if (!socket) return;

    const join = () => socket.emit("project:join", projectId);

    // Join immediately if already connected
    if (socket.connected) {
      join();
    }

    // Re-join on every (re)connect
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
      socket.emit("project:leave", projectId);
    };
  }, [projectId]);
}
