import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const socialLoginMock = vi.fn();
const linkAccountMock = vi.fn();
const recoverWithdrawalMock = vi.fn();

vi.mock('../src/domains/auth/application/socialLoginService', async () => {
  const { BadRequestError } =
    await vi.importActual<typeof import('../src/shared/errors/appError')>(
      '../src/shared/errors/appError'
    );

  return {
    linkAccount: linkAccountMock,
    socialLogin: socialLoginMock,
    validateProvider: (value: unknown) => {
      if (value !== 'GOOGLE' && value !== 'KAKAO') {
        throw new BadRequestError('provider must be GOOGLE or KAKAO', 'VALIDATION_ERROR');
      }

      return value;
    }
  };
});

vi.mock('../src/domains/auth/application/recoverWithdrawalService', () => ({
  recoverWithdrawal: recoverWithdrawalMock
}));

vi.mock('../src/domains/auth/application/withdrawUserService', () => ({
  withdrawUser: vi.fn()
}));

vi.mock('../src/shared/middlewares/authMiddleware', () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { userId: 'user-1', email: 'user@example.com' };
    next();
  })
}));

async function createTestApp() {
  const { default: authRouter } = await import('../src/domains/auth/interfaces/authController');
  const { default: errorHandler } = await import('../src/shared/middlewares/errorHandler');
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use(errorHandler);

  return app;
}

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socialLoginMock.mockResolvedValue({
      accessToken: 'jwt-access-token',
      isNewUser: false
    });
    linkAccountMock.mockResolvedValue({
      id: 'social-1',
      provider: 'GOOGLE',
      providerUserId: 'google-1',
      email: 'user@example.com'
    });
    recoverWithdrawalMock.mockResolvedValue({
      accessToken: 'jwt-access-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        profileImage: null,
        motivation: null,
        status: 'ACTIVE'
      }
    });
  });

  it('passes idToken to Google social login', async () => {
    const app = await createTestApp();

    const response = await request(app).post('/api/auth/google').send({ idToken: 'google-id-token' });

    expect(response.status).toBe(200);
    expect(socialLoginMock).toHaveBeenCalledWith('GOOGLE', 'google-id-token');
  });

  it('requires idToken for Google login', async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post('/api/auth/google')
      .send({ accessToken: 'google-access-token' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'ID_TOKEN_REQUIRED' }
    });
    expect(socialLoginMock).not.toHaveBeenCalled();
  });

  it('keeps accessToken for Kakao login', async () => {
    const app = await createTestApp();

    const response = await request(app).post('/api/auth/kakao').send({ accessToken: 'kakao-token' });

    expect(response.status).toBe(200);
    expect(socialLoginMock).toHaveBeenCalledWith('KAKAO', 'kakao-token');
  });

  it('logs out with no response body', async () => {
    const app = await createTestApp();

    const response = await request(app).post('/api/auth/logout');

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });

  it('links a Google account with a verified idToken', async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post('/api/auth/link-account')
      .send({ provider: 'GOOGLE', idToken: 'google-id-token' });

    expect(response.status).toBe(200);
    expect(linkAccountMock).toHaveBeenCalledWith('GOOGLE', 'google-id-token', 'user-1');
  });

  it('requires accessToken for Kakao account linking', async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post('/api/auth/link-account')
      .send({ provider: 'KAKAO', idToken: 'kakao-id-token' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'ACCESS_TOKEN_REQUIRED' }
    });
    expect(linkAccountMock).not.toHaveBeenCalled();
  });

  it('rejects an unsupported provider before account linking', async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post('/api/auth/link-account')
      .send({ provider: 'APPLE', idToken: 'apple-id-token' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' }
    });
    expect(linkAccountMock).not.toHaveBeenCalled();
  });

  it('recovers withdrawal with a Kakao accessToken without authentication middleware', async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post('/api/auth/recover-withdrawal')
      .send({ provider: 'KAKAO', accessToken: 'kakao-token' });

    expect(response.status).toBe(200);
    expect(recoverWithdrawalMock).toHaveBeenCalledWith('KAKAO', 'kakao-token');
  });
});
