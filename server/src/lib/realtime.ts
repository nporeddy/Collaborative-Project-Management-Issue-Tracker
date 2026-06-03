import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setIO(instance: SocketIOServer) {
  io = instance;
}

export function emitToProject(
  projectId: string,
  event: string,
  payload: unknown,
) {
  if (!io) return;
  io.to(`project:${projectId}`).emit(event, payload);
}
