import http from 'http';

import app from './app';
import { env } from './shared/config/env';
import { createSocketServer } from './shared/socket/socketServer';

const server = http.createServer(app);

createSocketServer(server);

server.listen(env.port, () => {
  console.log(`PhoneShim backend server is running on port ${env.port}`);
});
