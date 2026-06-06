import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let getTokenFn: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:4000";

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect_error", async (err) => {
    if (err.message.includes("token") || err.message.includes("auth")) {
      if (!getTokenFn || !socket) return;
      const fresh = await getTokenFn();
      if (fresh) {
        socket.auth = { token: fresh };
        socket.connect();
      }
    }
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
