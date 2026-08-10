const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const DEFAULT_DEVELOPMENT_JWT_ACCESS_SECRET = 'change-this-access-secret';

export function resolveJwtAccessSecret(
  rawSecret = process.env.JWT_ACCESS_SECRET,
  nodeEnv = process.env.NODE_ENV || 'development'
): string {
  if (nodeEnv === 'production') {
    if (!rawSecret) {
      throw new Error('Missing required environment variable: JWT_ACCESS_SECRET');
    }

    if (rawSecret === DEFAULT_DEVELOPMENT_JWT_ACCESS_SECRET) {
      throw new Error(
        'JWT_ACCESS_SECRET must not use the insecure development default value in production'
      );
    }

    return rawSecret;
  }

  return rawSecret || DEFAULT_DEVELOPMENT_JWT_ACCESS_SECRET;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  google: {
    webClientId: getRequiredEnv('GOOGLE_WEB_CLIENT_ID')
  },
  jwt: {
    accessSecret: resolveJwtAccessSecret(),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
  }
};
