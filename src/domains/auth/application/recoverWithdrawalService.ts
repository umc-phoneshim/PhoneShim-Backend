import { signAccessToken } from '../../../shared/auth/jwt';
import prisma from '../../../shared/database/prismaClient';
import { AppError, NotFoundError } from '../../../shared/errors/appError';
import { fetchGoogleUserInfo } from '../infrastructure/googleAuthClient';
import { fetchKakaoUserInfo } from '../infrastructure/kakaoAuthClient';
import type { Provider } from './socialLoginService';

const WITHDRAWAL_GRACE_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

type RecoverableUser = {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  motivation: string | null;
  status: string;
  withdrawalRequestedAt: Date | null;
};

async function verifyProviderUser(provider: Provider, token: string) {
  return provider === 'KAKAO' ? fetchKakaoUserInfo(token) : fetchGoogleUserInfo(token);
}

function userNotFound(): NotFoundError {
  return new NotFoundError('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
}

function isWithdrawalExpired(withdrawalRequestedAt: Date, now: Date): boolean {
  return now.getTime() > withdrawalRequestedAt.getTime() + WITHDRAWAL_GRACE_PERIOD_MS;
}

function toUserResponse(user: RecoverableUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileImage: user.profileImage,
    motivation: user.motivation,
    status: user.status
  };
}

export async function recoverWithdrawal(provider: Provider, token: string) {
  const userInfo = await verifyProviderUser(provider, token);
  const account = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId: userInfo.providerUserId
      }
    },
    include: { user: true }
  });

  const user = account?.user as RecoverableUser | undefined;

  if (!user || user.status !== 'WITHDRAWAL_PENDING' || !user.withdrawalRequestedAt) {
    throw userNotFound();
  }

  if (isWithdrawalExpired(user.withdrawalRequestedAt, new Date())) {
    throw new AppError(410, 'WITHDRAWAL_EXPIRED', '탈퇴 복구 가능 기간이 만료되었습니다.');
  }

  const recoveredUser = (await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
      withdrawalRequestedAt: null
    }
  })) as RecoverableUser;

  const accessToken = signAccessToken({
    userId: recoveredUser.id,
    email: recoveredUser.email
  });

  return {
    accessToken,
    user: toUserResponse(recoveredUser)
  };
}
