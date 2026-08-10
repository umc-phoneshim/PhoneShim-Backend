// src/domains/auth/infrastructure/googleAuthClient.ts
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

import { env } from '../../../shared/config/env';
import { ForbiddenError, UnauthorizedError } from '../../../shared/errors/appError';

interface GoogleUserInfo {
  providerUserId: string;
  email: string;
  name: string;
}

const googleClient = new OAuth2Client(env.google.webClientId);

export async function fetchGoogleUserInfo(idToken: string): Promise<GoogleUserInfo> {
  let payload: TokenPayload | undefined;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.google.webClientId
    });
    payload = ticket.getPayload() as typeof payload;
  } catch {
    throw new UnauthorizedError('유효하지 않은 구글 ID 토큰입니다.', 'INVALID_GOOGLE_ID_TOKEN');
  }

  if (!payload?.sub || typeof payload.sub !== 'string') {
    throw new UnauthorizedError('유효하지 않은 구글 ID 토큰입니다. (sub 누락)', 'INVALID_GOOGLE_ID_TOKEN');
  }

  if (!payload.email || payload.email_verified !== true) {
    throw new ForbiddenError('구글 이메일 인증이 필요합니다.', 'EMAIL_NOT_VERIFIED');
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0] || payload.email
  };
}
