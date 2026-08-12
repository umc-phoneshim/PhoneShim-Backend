import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGoogleUserInfo } from '../src/domains/auth/infrastructure/googleAuthClient';
import { fetchKakaoUserInfo } from '../src/domains/auth/infrastructure/kakaoAuthClient';
import { linkAccount, socialLogin } from '../src/domains/auth/application/socialLoginService';
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
    $transaction: vi.fn(),
    socialAccount: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn()
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn()
    }
  }
}));

const fetchGoogleUserInfoMock = vi.mocked(fetchGoogleUserInfo);
const fetchKakaoUserInfoMock = vi.mocked(fetchKakaoUserInfo);
const signAccessTokenMock = vi.mocked(signAccessToken);
const transactionMock = vi.mocked(prisma.$transaction);
const socialAccountFindUniqueMock = vi.mocked(prisma.socialAccount.findUnique);
const socialAccountFindUniqueOrThrowMock = vi.mocked(prisma.socialAccount.findUniqueOrThrow);
const userCreateMock = vi.mocked(prisma.user.create);
const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const userFindUniqueOrThrowMock = vi.mocked(prisma.user.findUniqueOrThrow);
const userUpdateMock = vi.mocked(prisma.user.update);

const activeUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'User',
  status: 'ACTIVE',
  withdrawalRequestedAt: null
};

const runTransactionCallback = async (callback: unknown) => {
  if (typeof callback !== 'function') {
    return callback;
  }

  return callback({
    socialAccount: {
      create: vi.fn()
    },
    user: {
      create: userCreateMock,
      findUniqueOrThrow: userFindUniqueOrThrowMock
    }
  });
};

const uniqueConstraintError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    clientVersion: 'test',
    code: 'P2002'
  });

describe('socialLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(runTransactionCallback as never);
    signAccessTokenMock.mockReturnValue('signed-token');
  });

  it('creates a new Kakao user and signs an access token', async () => {
    fetchKakaoUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'kakao-1',
      email: 'user@example.com',
      nickname: 'Nickname'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce(null);
    userFindUniqueMock.mockResolvedValueOnce(null);
    userCreateMock.mockResolvedValueOnce(activeUser as never);

    await expect(socialLogin('KAKAO', 'provider-token')).resolves.toEqual({
      accessToken: 'signed-token',
      isNewUser: true
    });

    expect(userCreateMock).toHaveBeenCalledWith({
      data: {
        email: 'user@example.com',
        name: 'Nickname',
        socialAccounts: {
          create: {
            provider: 'KAKAO',
            providerUserId: 'kakao-1',
            email: 'user@example.com'
          }
        }
      }
    });
    expect(signAccessTokenMock).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'user@example.com'
    });
  });

  it('logs in an existing Google social account', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce({ user: activeUser } as never);

    await expect(socialLogin('GOOGLE', 'provider-token')).resolves.toEqual({
      accessToken: 'signed-token',
      isNewUser: false
    });
  });

  it('links a social account to an existing email user', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce(null);
    userFindUniqueMock.mockResolvedValueOnce(activeUser as never);
    userFindUniqueOrThrowMock.mockResolvedValueOnce(activeUser as never);

    await expect(socialLogin('GOOGLE', 'provider-token')).resolves.toEqual({
      accessToken: 'signed-token',
      isNewUser: false
    });
    expect(userFindUniqueOrThrowMock).toHaveBeenCalledWith({ where: { id: 'user-1' } });
  });

  it('rejects a withdrawal pending account without reactivation', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock.mockResolvedValueOnce({
      user: {
        ...activeUser,
        status: 'WITHDRAWAL_PENDING',
        withdrawalRequestedAt: new Date('2026-07-10T00:00:00.000Z')
      }
    } as never);

    await expect(socialLogin('GOOGLE', 'provider-token')).rejects.toMatchObject({
      statusCode: 409,
      code: 'ACCOUNT_WITHDRAWAL_PENDING'
    });
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it('rejects deleted accounts', async () => {
    fetchGoogleUserInfoMock.mockResolvedValue({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });

    socialAccountFindUniqueMock.mockResolvedValueOnce({
      user: { ...activeUser, status: 'DELETED' }
    } as never);
    await expect(socialLogin('GOOGLE', 'provider-token')).rejects.toMatchObject({
      statusCode: 403,
      code: 'ACCOUNT_DELETED'
    });
  });

  it('recovers from a unique race by refinding the social account', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    socialAccountFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ user: activeUser } as never);
    userFindUniqueMock.mockResolvedValueOnce(null);
    userCreateMock.mockRejectedValueOnce(uniqueConstraintError());

    await expect(socialLogin('GOOGLE', 'provider-token')).resolves.toEqual({
      accessToken: 'signed-token',
      isNewUser: false
    });
  });
});

describe('linkAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(runTransactionCallback as never);
  });

  it('links a verified Google account to the authenticated user', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    userFindUniqueMock.mockResolvedValueOnce({ id: 'user-1' } as never);
    userFindUniqueOrThrowMock.mockResolvedValueOnce(activeUser as never);
    socialAccountFindUniqueOrThrowMock.mockResolvedValueOnce({
      id: 'social-1',
      provider: 'GOOGLE',
      providerUserId: 'google-1',
      email: 'user@example.com'
    } as never);

    await expect(linkAccount('GOOGLE', 'id-token', 'user-1')).resolves.toEqual({
      id: 'social-1',
      provider: 'GOOGLE',
      providerUserId: 'google-1',
      email: 'user@example.com'
    });
  });

  it('rejects linking when the verified email belongs to another user', async () => {
    fetchKakaoUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'kakao-1',
      email: 'other@example.com',
      nickname: 'Other'
    });
    userFindUniqueMock.mockResolvedValueOnce({ id: 'user-2' } as never);

    await expect(linkAccount('KAKAO', 'kakao-token', 'user-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'SOCIAL_ACCOUNT_ALREADY_LINKED'
    });
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('maps unique social account conflicts to SOCIAL_ACCOUNT_ALREADY_LINKED', async () => {
    fetchGoogleUserInfoMock.mockResolvedValueOnce({
      providerUserId: 'google-1',
      email: 'user@example.com',
      name: 'User'
    });
    userFindUniqueMock.mockResolvedValueOnce({ id: 'user-1' } as never);
    transactionMock.mockRejectedValueOnce(uniqueConstraintError());

    await expect(linkAccount('GOOGLE', 'id-token', 'user-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'SOCIAL_ACCOUNT_ALREADY_LINKED'
    });
  });
});
