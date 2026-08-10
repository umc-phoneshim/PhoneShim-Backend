import http from 'http';
import type { AddressInfo } from 'net';
import type { Express } from 'express';
import { io as createSocketClient } from 'socket.io-client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEFAULT_DEVELOPMENT_ORIGINS, parseCorsOrigins } from '../src/shared/config/cors';
import { createSocketServer } from '../src/shared/socket/socketServer';

let app: Express;
let httpServer: http.Server;
let socketServer: ReturnType<typeof createSocketServer>;
let serverUrl: string;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgresql://user:password@localhost:5432/phoneshim_test';
  process.env.GOOGLE_WEB_CLIENT_ID ||= 'test-google-client-id.apps.googleusercontent.com';
  ({ default: app } = await import('../src/app'));

  httpServer = http.createServer(app);
  socketServer = createSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', resolve);
  });

  const address = httpServer.address() as AddressInfo;
  serverUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    socketServer.close(() => resolve());
  });
});

describe('CORS configuration', () => {
  it('allows a configured origin', async () => {
    const origin = DEFAULT_DEVELOPMENT_ORIGINS[1];
    const response = await request(app).get('/health').set('Origin', origin);

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('does not add CORS headers for an unconfigured origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://untrusted.example.com');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each(DEFAULT_DEVELOPMENT_ORIGINS)('allows every development origin: %s', async (origin) => {
    const response = await request(serverUrl).get('/health').set('Origin', origin);

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers.vary).toContain('Origin');
  });

  it('adds CORS headers to application-level 404 responses', async () => {
    const origin = DEFAULT_DEVELOPMENT_ORIGINS[1];
    const response = await request(serverUrl).get('/missing-route').set('Origin', origin);

    expect(response.status).toBe(404);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' }
    });
  });

  it('handles preflight requests with authorization and content-type headers', async () => {
    const origin = DEFAULT_DEVELOPMENT_ORIGINS[0];
    const response = await request(app)
      .options('/health')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-headers']).toBe('Authorization, Content-Type');
  });

  it('passes an unconfigured preflight to the API without CORS authorization', async () => {
    const response = await request(serverUrl)
      .options('/api/users/me')
      .set('Origin', 'https://untrusted.example.com')
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    expect(response.status).toBe(401);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED' }
    });
  });

  it('applies the allowlist to a Socket.IO polling handshake', async () => {
    const origin = DEFAULT_DEVELOPMENT_ORIGINS[1];
    const response = await request(serverUrl)
      .get('/socket.io/')
      .query({ EIO: 4, transport: 'polling' })
      .set('Origin', origin);

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    expect(response.text).toContain('"sid"');
  });

  it('does not add Socket.IO CORS headers for an unconfigured origin', async () => {
    const response = await request(serverUrl)
      .get('/socket.io/')
      .query({ EIO: 4, transport: 'polling' })
      .set('Origin', 'https://untrusted.example.com');

    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('establishes a real Socket.IO connection from an allowed origin', async () => {
    const client = createSocketClient(serverUrl, {
      extraHeaders: { Origin: DEFAULT_DEVELOPMENT_ORIGINS[0] },
      forceNew: true,
      transports: ['websocket']
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Socket.IO connection timed out')), 3000);

        client.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        client.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      expect(client.connected).toBe(true);
      expect(client.id).toBeTruthy();
    } finally {
      client.close();
    }
  });

  it('rejects a real Socket.IO connection from an unconfigured origin', async () => {
    const client = createSocketClient(serverUrl, {
      extraHeaders: { Origin: 'https://untrusted.example.com' },
      forceNew: true,
      reconnection: false,
      transports: ['websocket']
    });

    try {
      const error = await new Promise<Error>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Socket.IO rejection timed out')), 3000);

        client.once('connect', () => {
          clearTimeout(timeout);
          reject(new Error('Unconfigured Socket.IO origin was accepted'));
        });
        client.once('connect_error', (connectionError) => {
          clearTimeout(timeout);
          resolve(connectionError);
        });
      });

      expect(error).toBeInstanceOf(Error);
      expect(client.connected).toBe(false);
    } finally {
      client.close();
    }
  });

  it('allows requests without an Origin header', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: 'ok' }
    });
  });

  it('uses local frontend origins by default in development', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual(DEFAULT_DEVELOPMENT_ORIGINS);
  });

  it('trims, removes empty entries, and deduplicates configured origins', () => {
    expect(
      parseCorsOrigins(
        ' https://app.example.com, ,https://admin.example.com,https://app.example.com ',
        'production'
      )
    ).toEqual(['https://app.example.com', 'https://admin.example.com']);
  });

  it('requires configured origins in production', () => {
    expect(() => parseCorsOrigins('', 'production')).toThrow(
      'Missing required environment variable: CORS_ORIGINS'
    );
  });

  it('rejects wildcard origins', () => {
    expect(() => parseCorsOrigins('*', 'development')).toThrow(
      'CORS_ORIGINS must not contain a wildcard (*)'
    );
  });
});
