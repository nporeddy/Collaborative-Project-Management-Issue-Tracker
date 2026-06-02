import { useEffect } from 'react';
import { getSocket } from '../lib/socket';

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler as (data: unknown) => void);

    return () => {
      socket.off(event, handler as (data: unknown) => void);
    };
  }, [event, handler]);
}