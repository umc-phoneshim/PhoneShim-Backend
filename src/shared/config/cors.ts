import type { CorsOptions } from 'cors';

export const DEFAULT_DEVELOPMENT_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];

export function parseCorsOrigins(
  rawOrigins = process.env.CORS_ORIGINS,
  nodeEnv = process.env.NODE_ENV || 'development'
): string[] {
  const origins = [
    ...new Set(
      (rawOrigins || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    )
  ];

  if (origins.includes('*')) {
    throw new Error('CORS_ORIGINS must not contain a wildcard (*)');
  }

  if (origins.length > 0) {
    return origins;
  }

  if (nodeEnv === 'production') {
    throw new Error('Missing required environment variable: CORS_ORIGINS');
  }

  return [...DEFAULT_DEVELOPMENT_ORIGINS];
}

export const corsOrigins = parseCorsOrigins();

export function isOriginAllowed(origin: string | undefined): boolean {
  return !origin || corsOrigins.includes(origin);
}

export const corsOptions: CorsOptions = {
  credentials: false,
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  }
};
