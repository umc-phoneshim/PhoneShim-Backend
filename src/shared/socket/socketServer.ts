import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { setSocketServer } from './mainSyncEvents';

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*'
    }
  });

  setSocketServer(io);

  io.on('connection', (socket) => {
    socket.emit('connected', {
      socketId: socket.id
    });
  });

  return io;
}
