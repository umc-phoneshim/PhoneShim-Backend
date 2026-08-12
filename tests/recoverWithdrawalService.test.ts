import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { recoverWithdrawal } from '../src/domains/auth/application/recoverWithdrawalService';
import { fetchGoogleUserInfo } from '../src/domains/auth/infrastructure/googleAuthClient';
import { fetchKakaoUserInfo } from '../src/domains/auth/infrastructure/kakaoAuthClient';
import { signAccessToken } from '../src/shared/auth/jwt';
import prisma from '../src/shared/database/prismaClient';

vi.mock('../src/domains/auth/infrastructure/googleAuthClient', () => ({
  fetchGoogleUserInfo: vi.fn()
}));

vi.mock('../src/domains/auth/infrastructure/kakaoAuthClient', () => ({
  fetchKakaoUserInfo: vi.fn()
}));

vi.mock('../src/shared/auth/jwt', () => ({
  signAccessToken: vi.fn()
}));

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    socialAccount: {
      findUnique: vi.fn()
    },
    user: {
      update: vi.fn()
    }
  }
}));

const fetchGoogleUserInfoMock = vi.mocked(fetchGoogleUserInfo);
const fetchKakaoUserInfoMock = vi.mocked(fetchKakaoUserInfo);
const signAccessTokenMock = vi.mocked(signAccessToken);
const socialAccountFindUniqueMock = vi.mocked(prisma.socialAccount.findUnique);
const userUpdateMock = vi.mocked(prisma.user.update);

const pendingUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'User',
  profileImage: null,
  motivation: 'Focus',
  status: 'WITHDRAWAL_PENDING',
  withdrawalRequestedAt: new Date('2026-07-01T00:00:00.000Z')
};

describe('recoverWithdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-10T00:00:00.000Z'));
    signAccessTokenMock.mockReturnValue('signed-token');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reactivates a withdrawal pending user and signs an access token', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce({ user: pendingUser } as never);
    userUpdateMock.mockResolvedValueOnce({
      ...pendingUser,
      status: 'ACTIVE',
      withdrawalRequestedAt: null
    } as never);

    await expect(recoverWithdrawal('GOOGLE', 'id-token')).resolves.toEqual({
      accessToken: 'signed-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        profileImage: null,
        motivation: 'Focus',
        status: 'ACTIVE'
      }
    });
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        status: 'ACTIVE',
        withdrawalRequestedAt: null
      }
    });
    expect(signAccessTokenMock).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'user@example.com'
    });
  });

  it('returns USER_NOT_FOUND when the social account does not exist', async () => {
    fetchKakaoUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'kakao-1',
      email: 'user@example.com',
      nickname: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce(null);

    await expect(recoverWithdrawal('KAKAO', 'access-token')).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('hides non-pending account states behind USER_NOT_FOUND', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce({
      user: { ...pendingUser, status: 'ACTIVE' }
    } as never);

    await expect(recoverWithdrawal('GOOGLE', 'id-token')).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('rejects expired withdrawal recovery windows', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce({
      user: {
        ...pendingUser,
        withdrawalRequestedAt: new Date('2026-06-20T00:00:00.000Z')
      }
    } as never);

    await expect(recoverWithdrawal('GOOGLE', 'id-token')).rejects.toMatchObject({
      statusCode: 410,
      code: 'WITHDRAWAL_EXPIRED'
    });
  });
});
