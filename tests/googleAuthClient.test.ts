import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdTokenMock = vi.fn();

vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn(function OAuth2Client() {
    return {
      verifyIdToken: verifyIdTokenMock
    };
  })
}));

describe('fetchGoogleUserInfo', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/phoneshim_test';
    process.env.GOOGLE_WEB_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';
  });

  it('verifies an ID token and maps Google claims', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-1',
        email: 'user@example.com',
        email_verified: true,
        name: 'User'
      })
    });

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('id-token')).resolves.toEqual({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    expect(verifyIdTokenMock).toHaveBeenCalledWith({
      idToken: 'id-token',
      audience: 'test-google-client-id.apps.googleusercontent.com'
    });
  });

  it('falls back to the email prefix when name is missing', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-1',
        email: 'user@example.com',
        email_verified: true
      })
    });

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('id-token')).resolves.toMatchObject({
      name: 'user'
    });
  });

  it('rejects token verification failures', async () => {
    verifyIdTokenMock.mockRejectedValueOnce(new Error('bad token'));

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('bad-id-token')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_GOOGLE_ID_TOKEN'
    });
  });

  it('rejects payloads without sub', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        email: 'user@example.com',
        email_verified: true
      })
    });

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('id-token')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_GOOGLE_ID_TOKEN'
    });
  });

  it('requires a verified email claim', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-1',
        email: 'user@example.com',
        email_verified: false
      })
    });

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('id-token')).rejects.toMatchObject({
      statusCode: 403,
      code: 'EMAIL_NOT_VERIFIED'
    });
  });

  it('requires an email claim', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-1',
        email_verified: true
      })
    });

    const { fetchGoogleUserInfo } = await import(
      '../src/domains/auth/infrastructure/googleAuthClient'
    );

    await expect(fetchGoogleUserInfo('id-token')).rejects.toMatchObject({
      statusCode: 403,
      code: 'EMAIL_NOT_VERIFIED'
    });
  });
});
