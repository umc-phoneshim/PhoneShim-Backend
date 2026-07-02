const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
  }
};
