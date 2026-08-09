import { beforeAll, describe, expect, it } from 'vitest';

let resolveJwtAccessSecret: typeof import('../src/shared/config/env').resolveJwtAccessSecret;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgresql://user:password@localhost:5432/phoneshim_test';
  process.env.GOOGLE_WEB_CLIENT_ID ||= 'test-google-client-id.apps.googleusercontent.com';
  ({ resolveJwtAccessSecret } = await import('../src/shared/config/env'));
});

describe('resolveJwtAccessSecret', () => {
  it('falls back to the development default when unset in development', () => {
    expect(resolveJwtAccessSecret(undefined, 'development')).toBe('change-this-access-secret');
  });

  it('uses a configured secret in development', () => {
    expect(resolveJwtAccessSecret('dev-secret', 'development')).toBe('dev-secret');
  });

  it('requires a configured secret in production', () => {
    expect(() => resolveJwtAccessSecret(undefined, 'production')).toThrow(
      'Missing required environment variable: JWT_ACCESS_SECRET'
    );
  });

  it('rejects the insecure development default in production', () => {
    expect(() => resolveJwtAccessSecret('change-this-access-secret', 'production')).toThrow(
      'JWT_ACCESS_SECRET must not use the insecure development default value in production'
    );
  });

  it('accepts a real secret in production', () => {
    expect(resolveJwtAccessSecret('a-real-production-secret', 'production')).toBe(
      'a-real-production-secret'
    );
  });
});
