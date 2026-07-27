import prisma from '../../../shared/database/prismaClient';
import { signAccessToken } from '../../../shared/auth/jwt';
import { ForbiddenError } from '../../../shared/errors/appError';
import {
  isPrismaKnownError,
  PRISMA_UNIQUE_CONSTRAINT_ERROR
} from '../../../shared/errors/prismaError';
import { fetchKakaoUserInfo } from '../infrastructure/kakaoAuthClient';
import { fetchGoogleUserInfo } from '../infrastructure/googleAuthClient';

type Provider = 'KAKAO' | 'GOOGLE';

const WITHDRAWAL_GRACE_PERIOD_DAYS = 14;

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
  userInfo: { providerUserId: string; email: string },
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

function isWithinGracePeriod(withdrawalRequestedAt: Date | null): boolean {
  if (!withdrawalRequestedAt) {
    return true;
  }

  const elapsedMs = Date.now() - withdrawalRequestedAt.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  return elapsedDays <= WITHDRAWAL_GRACE_PERIOD_DAYS;
}

type LoginGuardedUser = {
  id: string;
  status: string;
  withdrawalRequestedAt: Date | null;
};

async function guardAndReactivateAccount<T extends LoginGuardedUser>(user: T): Promise<T> {
  if (user.status === 'DELETED') {
    throw new ForbiddenError('탈퇴 완료된 계정입니다.', 'ACCOUNT_DELETED');
  }

  if (user.status !== 'WITHDRAWAL_PENDING') {
    return user;
  }

  if (!isWithinGracePeriod(user.withdrawalRequestedAt)) {
    throw new ForbiddenError(
      '탈퇴 유예 기간(14일)이 만료되어 더 이상 로그인할 수 없습니다.',
      'WITHDRAWAL_PERIOD_EXPIRED'
    );
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
      withdrawalRequestedAt: null
    }
  }) as unknown as T;
}

export async function socialLogin(provider: Provider, accessToken: string) {
  const userInfo =
    provider === 'KAKAO'
      ? await fetchKakaoUserInfo(accessToken)
      : await fetchGoogleUserInfo(accessToken);

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
        const guardedExistingUser = await guardAndReactivateAccount(existingUser);
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
    user = await guardAndReactivateAccount(user);
  }

  const token = signAccessToken({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    isNewUser
  };
}
