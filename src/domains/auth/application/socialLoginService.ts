import prisma from '../../../shared/database/prismaClient';
import { signAccessToken } from '../../../shared/auth/jwt';
import { AppError, BadRequestError, ForbiddenError } from '../../../shared/errors/appError';
import {
  isPrismaKnownError,
  PRISMA_UNIQUE_CONSTRAINT_ERROR
} from '../../../shared/errors/prismaError';
import { fetchKakaoUserInfo } from '../infrastructure/kakaoAuthClient';
import { fetchGoogleUserInfo } from '../infrastructure/googleAuthClient';

export type Provider = 'KAKAO' | 'GOOGLE';
type ProviderUserInfo = { providerUserId: string; email: string };
type SocialLoginUserInfo = ProviderUserInfo & ({ name: string } | { nickname: string });

function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaKnownError(error, PRISMA_UNIQUE_CONSTRAINT_ERROR);
}

async function findUserBySocialAccount(provider: Provider, providerUserId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: { provider, providerUserId }
    },
    include: { user: true }
  });

  return account?.user ?? null;
}

async function linkSocialAccountToUser(
  provider: Provider,
  userInfo: ProviderUserInfo,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    await tx.socialAccount.create({
      data: {
        provider,
        providerUserId: userInfo.providerUserId,
        email: userInfo.email,
        userId
      }
    });
    return tx.user.findUniqueOrThrow({ where: { id: userId } });
  });
}

async function verifyProviderUser(provider: Provider, token: string): Promise<SocialLoginUserInfo> {
  return provider === 'KAKAO' ? fetchKakaoUserInfo(token) : fetchGoogleUserInfo(token);
}

async function createUserWithSocialAccount(
  provider: Provider,
  userInfo: { providerUserId: string; email: string },
  name: string
) {
  return prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        email: userInfo.email,
        name,
        socialAccounts: {
          create: {
            provider,
            providerUserId: userInfo.providerUserId,
            email: userInfo.email
          }
        }
      }
    });
  });
}

type LoginGuardedUser = {
  id: string;
  status: string;
  withdrawalRequestedAt: Date | null;
};

function guardLoginAccount<T extends LoginGuardedUser>(user: T): T {
  if (user.status === 'DELETED') {
    throw new ForbiddenError('탈퇴 완료된 계정입니다.', 'ACCOUNT_DELETED');
  }

  if (user.status !== 'WITHDRAWAL_PENDING') {
    return user;
  }

  throw new AppError(409, 'ACCOUNT_WITHDRAWAL_PENDING', '탈퇴 유예 상태의 계정입니다.');
}

export async function socialLogin(provider: Provider, accessToken: string) {
  const userInfo = await verifyProviderUser(provider, accessToken);

  const name = 'nickname' in userInfo ? userInfo.nickname : userInfo.name;

  let user = await findUserBySocialAccount(provider, userInfo.providerUserId);
  let isNewUser = false;
  let alreadyGuarded = false;

  if (!user) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userInfo.email }
    });

    try {
      if (existingUser) {
        const guardedExistingUser = guardLoginAccount(existingUser);
        user = await linkSocialAccountToUser(provider, userInfo, guardedExistingUser.id);
        isNewUser = false;
        alreadyGuarded = true;
      } else {
        user = await createUserWithSocialAccount(provider, userInfo, name);
        isNewUser = true;
      }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const recoveredUser =
          (await findUserBySocialAccount(provider, userInfo.providerUserId)) ??
          (await prisma.user.findUniqueOrThrow({ where: { email: userInfo.email } }));

        user = recoveredUser;
        isNewUser = false;
        alreadyGuarded = false;
      } else {
        throw error;
      }
    }
  }

  if (!alreadyGuarded) {
    user = guardLoginAccount(user);
  }

  const token = signAccessToken({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    isNewUser
  };
}

export async function linkAccount(provider: Provider, token: string, userId: string) {
  const userInfo = await verifyProviderUser(provider, token);
  const existingEmailUser = await prisma.user.findUnique({
    where: { email: userInfo.email }
  });

  if (existingEmailUser && existingEmailUser.id !== userId) {
    throw new AppError(
      409,
      'SOCIAL_ACCOUNT_ALREADY_LINKED',
      '이미 다른 계정에 연결된 소셜 계정입니다.'
    );
  }

  try {
    await linkSocialAccountToUser(provider, userInfo, userId);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        409,
        'SOCIAL_ACCOUNT_ALREADY_LINKED',
        '이미 연결된 소셜 계정입니다.'
      );
    }
    throw error;
  }

  const account = await prisma.socialAccount.findUniqueOrThrow({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId: userInfo.providerUserId
      }
    }
  });

  return {
    id: account.id,
    provider: account.provider,
    providerUserId: account.providerUserId,
    email: account.email
  };
}

export function validateProvider(value: unknown): Provider {
  if (value !== 'GOOGLE' && value !== 'KAKAO') {
    throw new BadRequestError('provider must be GOOGLE or KAKAO', 'VALIDATION_ERROR');
  }

  return value;
}
