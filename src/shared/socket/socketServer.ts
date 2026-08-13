import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { verifyAccessToken } from '../auth/jwt';
import { corsOrigins, isOriginAllowed } from '../config/cors';
import { getUserRoomName, isSocketAuthRequired } from './socketConfig';
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

  io.use((socket, next) => {
    if (!isSocketAuthRequired()) {
      next();
      return;
    }

    const token = socket.handshake.auth?.token;

    if (typeof token !== 'string' || !token.trim()) {
      next(Object.assign(new Error('Invalid access token'), {
        data: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      }));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.join(getUserRoomName(payload.userId));
      next();
    } catch {
      next(Object.assign(new Error('Invalid access token'), {
        data: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      }));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('connected', {
      socketId: socket.id
    });
  });

  return io;
}
