import { beforeEach, describe, expect, it, vi } from 'vitest';

import prisma from '../src/shared/database/prismaClient';
import { withdrawUser } from '../src/domains/auth/application/withdrawUserService';

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const userUpdateMock = vi.mocked(prisma.user.update);

describe('withdrawUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a missing user', async () => {
    userFindUniqueMock.mockResolvedValueOnce(null);

    await expect(withdrawUser('user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('rejects a user that is already withdrawal pending', async () => {
    userFindUniqueMock.mockResolvedValueOnce({
      id: 'user-1',
      status: 'WITHDRAWAL_PENDING'
    } as never);

    await expect(withdrawUser('user-1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'ALREADY_WITHDRAWAL_PENDING'
    });
  });

  it('rejects a deleted user', async () => {
    userFindUniqueMock.mockResolvedValueOnce({ id: 'user-1', status: 'DELETED' } as never);

    await expect(withdrawUser('user-1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'USER_ALREADY_DELETED'
    });
  });

  it('marks an active user as withdrawal pending', async () => {
    const withdrawalRequestedAt = new Date('2026-07-16T00:00:00.000Z');
    userFindUniqueMock.mockResolvedValueOnce({ id: 'user-1', status: 'ACTIVE' } as never);
    userUpdateMock.mockResolvedValueOnce({
      id: 'user-1',
      status: 'WITHDRAWAL_PENDING',
      withdrawalRequestedAt
    } as never);

    await expect(withdrawUser('user-1')).resolves.toEqual({
      status: 'WITHDRAWAL_PENDING',
      withdrawalRequestedAt
    });
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        status: 'WITHDRAWAL_PENDING',
        withdrawalRequestedAt: expect.any(Date)
      }
    });
  });
});
