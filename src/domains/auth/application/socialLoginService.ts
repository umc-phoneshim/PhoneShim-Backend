// src/domains/auth/application/socialLoginService.ts
import prisma from '../../../shared/database/prismaClient';
import { signAccessToken } from '../../../shared/auth/jwt';
import { fetchKakaoUserInfo } from '../infrastructure/kakaoAuthClient';
import { fetchGoogleUserInfo } from '../infrastructure/googleAuthClient';

type Provider = 'KAKAO' | 'GOOGLE';

export async function socialLogin(provider: Provider, accessToken: string) {
  try {
    // 1. provider별로 사용자 정보 조회
const userInfo =
  provider === 'KAKAO'
    ? await fetchKakaoUserInfo(accessToken)
    : await fetchGoogleUserInfo(accessToken);
   const name = 'nickname' in userInfo ? userInfo.nickname : userInfo.name;

    // 2. provider + providerUserId로 SocialAccount 먼저 조회 (이미 연동된 계정인지)
    const existingAccount = await prisma.socialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: userInfo.providerUserId,
        },
      },
      include: { user: true },
    });

    let isNewUser = false;
    let user;

    if (existingAccount) {
      // 3-A. 이미 연동된 계정 -> 그대로 로그인
      user = existingAccount.user;
    } else {
      // 3-B. 처음 보는 소셜 계정 -> 이메일로 기존 유저 있는지 확인 (ERR-01: 중복 이메일 귀속)
      const existingUser = await prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      if (existingUser) {
        // 기존 유저에 새 SocialAccount만 연결
        await prisma.socialAccount.create({
          data: {
            provider,
            providerUserId: userInfo.providerUserId,
            email: userInfo.email,
            userId: existingUser.id,
          },
        });
        user = existingUser;
      } else {
        // 완전히 새로운 유저 -> User + SocialAccount 함께 생성
        user = await prisma.user.create({
          data: {
            email: userInfo.email,
            name,
            socialAccounts: {
              create: {
                provider,
                providerUserId: userInfo.providerUserId,
                email: userInfo.email,
              },
            },
          },
        });
        isNewUser = true;
      }
    }

    // 4. 우리 서비스 JWT 발급
    const token = signAccessToken({ userId: user.id, email: user.email });

    return {
      accessToken: token,
      isNewUser,
    };
  } catch (error) {
    console.error('============= 소셜로그인 에러 발생 =============');
    console.error(error);
    console.error('====================================================');
    throw error;
  }
}