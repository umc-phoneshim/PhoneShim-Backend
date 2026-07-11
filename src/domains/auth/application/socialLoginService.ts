// src/domains/auth/application/socialLoginService.ts
import { Prisma } from '@prisma/client';
import prisma from '../../../shared/database/prismaClient';
import { signAccessToken } from '../../../shared/auth/jwt';
import { fetchKakaoUserInfo } from '../infrastructure/kakaoAuthClient';
import { fetchGoogleUserInfo } from '../infrastructure/googleAuthClient';

type Provider = 'KAKAO' | 'GOOGLE';

// Prisma unique constraint 위반 에러(P2002)인지 확인하는 헬퍼
function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );
}

async function findUserBySocialAccount(provider: Provider, providerUserId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: { provider, providerUserId },
    },
    include: { user: true },
  });

  return account?.user ?? null;
}

// 신규 유저/소셜계정 생성을 트랜잭션으로 원자적으로 묶는다.
// (existingUser 조회 후 socialAccount만 추가하는 경우 / User+SocialAccount 함께 새로 만드는 경우 둘 다 커버)
async function createUserWithSocialAccount(
  provider: Provider,
  userInfo: { providerUserId: string; email: string },
  name: string,
  existingUserId: string | null
) {
  return prisma.$transaction(async (tx) => {
    if (existingUserId) {
      // 기존 유저에 새 SocialAccount만 연결
      await tx.socialAccount.create({
        data: {
          provider,
          providerUserId: userInfo.providerUserId,
          email: userInfo.email,
          userId: existingUserId,
        },
      });
      return tx.user.findUniqueOrThrow({ where: { id: existingUserId } });
    }

    // 완전히 새로운 유저 -> User + SocialAccount 함께 생성
    return tx.user.create({
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
  });
}

export async function socialLogin(provider: Provider, accessToken: string) {
  try {
    // 1. provider별로 사용자 정보 조회
    const userInfo =
      provider === 'KAKAO'
        ? await fetchKakaoUserInfo(accessToken)
        : await fetchGoogleUserInfo(accessToken);

    const name = 'nickname' in userInfo ? userInfo.nickname : userInfo.name;

    // 2. 이미 연동된 소셜 계정인지 조회
    let user = await findUserBySocialAccount(provider, userInfo.providerUserId);
    let isNewUser = false;

    if (!user) {
      // 3. 처음 보는 소셜 계정 -> 이메일로 기존 유저 있는지 확인 (ERR-01: 중복 이메일 귀속)
      const existingUser = await prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      try {
        user = await createUserWithSocialAccount(
          provider,
          userInfo,
          name,
          existingUser?.id ?? null
        );
        isNewUser = !existingUser;
      } catch (error) {
        // race condition: 동시 요청으로 이미 다른 요청이 먼저 생성/연결한 경우
        // 트랜잭션이 unique constraint(P2002) 위반으로 롤백되면,
        // 에러로 취급하지 않고 재조회해서 로그인으로 이어간다.
        if (isUniqueConstraintError(error)) {
          const recoveredUser =
            (await findUserBySocialAccount(provider, userInfo.providerUserId)) ??
            (await prisma.user.findUniqueOrThrow({ where: { email: userInfo.email } }));

          user = recoveredUser;
          isNewUser = false;
        } else {
          throw error;
        }
      }
    }

    // 4. 우리 서비스 JWT 발급
    const token = signAccessToken({ userId: user.id, email: user.email });

    return {
      accessToken: token,
      isNewUser,
    };
  } catch (error) {
    console.error('============= 🚨 소셜로그인 에러 발생 🚨 =============');
    console.error(error);
    console.error('====================================================');
    throw error;
  }
}