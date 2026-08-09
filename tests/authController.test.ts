import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const socialLoginMock = vi.fn();

vi.mock('../src/domains/auth/application/socialLoginService', () => ({
  socialLogin: socialLoginMock
}));

vi.mock('../src/domains/auth/application/withdrawUserService', () => ({
  withdrawUser: vi.fn()
}));

vi.mock('../src/shared/middlewares/authMiddleware', () => ({
  authenticate: vi.fn((_req, _res, next) => next())
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
});
