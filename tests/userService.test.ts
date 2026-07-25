import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserByUserId } from '../src/domains/user/application/userService';
import * as userRepository from '../src/domains/user/infrastructure/userRepository';

vi.mock('../src/domains/user/infrastructure/userRepository', () => ({
  getUserByUserId: vi.fn()
}));

const getUserByUserIdMock = vi.mocked(userRepository.getUserByUserId);

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a missing user id', async () => {
    await expect(getUserByUserId('')).rejects.toMatchObject({
      statusCode: 400
    });
  });

  it('rejects a missing user', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(null);

    await expect(getUserByUserId('user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('returns an existing user', async () => {
    const user = {
      name: 'Kim',
      email: 'kim@example.com',
      profileImage: null,
      motivation: null
    };
    getUserByUserIdMock.mockResolvedValueOnce(user);

    await expect(getUserByUserId('user-1')).resolves.toBe(user);
  });
});
