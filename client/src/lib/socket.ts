import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  // Reuse existing socket if it's still good
  if (socket?.connected) return socket;

  // Tear down any half-dead socket first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io("http://localhost:4000", {
    auth: { token },
    autoConnect: true,
    transports: ["websocket", "polling"], // prefer ws, fall back to polling
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
