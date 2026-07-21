import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    socket.emit('connected', {
      socketId: socket.id
    });
  });

  return io;
}
