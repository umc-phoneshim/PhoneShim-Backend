// src/domains/auth/infrastructure/kakaoAuthClient.ts

interface KakaoUserInfo {
  providerUserId: string;
  email: string;
  nickname: string;
}

export async function fetchKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('INVALID_TOKEN');
  }

  const data = await response.json();

  const email = data.kakao_account?.email;
  const nickname = data.kakao_account?.profile?.nickname;
  const providerUserId = String(data.id); // 카카오 고유 회원번호

  if (!email) {
    // 카카오 이메일 제공 동의를 안 한 경우
    throw new Error('EMAIL_PERMISSION_REQUIRED');
  }

  return { providerUserId, email, nickname };
}