// src/domains/auth/infrastructure/googleAuthClient.ts

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
    throw new Error('INVALID_TOKEN');
  }

  const data = await response.json();

  if (!data.email) {
    throw new Error('EMAIL_PERMISSION_REQUIRED');
  }

  // 구글의 'sub' 필드가 유저 고유 식별자
  return { providerUserId: data.sub, email: data.email, name: data.name };
}