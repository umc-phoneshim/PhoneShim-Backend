import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { corsOrigins, isOriginAllowed } from '../config/cors';
import { setSocketServer } from './mainSyncEvents';

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    allowRequest: (request, callback) => {
      callback(null, isOriginAllowed(request.headers.origin));
    },
    cors: {
      origin: corsOrigins,
      credentials: false
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
