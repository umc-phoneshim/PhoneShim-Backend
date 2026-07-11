// src/domains/auth/infrastructure/googleAuthClient.ts
import { UnauthorizedError, BadRequestError } from '../../../shared/errors/appError';

interface GoogleUserInfo {
  providerUserId: string;
  email: string;
  name: string;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new UnauthorizedError('유효하지 않은 구글 토큰입니다.', 'INVALID_TOKEN');
  }

  const data = await response.json();

  if (!data.email) {
    throw new BadRequestError('구글 이메일 제공 동의가 필요합니다.', 'EMAIL_PERMISSION_REQUIRED');
  }

  // 구글의 'sub' 필드가 유저 고유 식별자
  return { providerUserId: data.sub, email: data.email, name: data.name };
}