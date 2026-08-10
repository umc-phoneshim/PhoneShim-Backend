import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Gender, AgeGroup, UserStatus } from '@prisma/client';

import {
  getUserByUserId,
  updateUserGenderAge,
  updateUserNameMotiv
} from '../src/domains/user/application/userService';
import type {
  UpdateUserGenderAgeRequest,
  UpdateUserNameMotivRequest
} from '../src/domains/user/interfaces/userDto';
import * as userRepository from '../src/domains/user/infrastructure/userRepository';

vi.mock('../src/domains/user/infrastructure/userRepository', () => ({
  getUserByUserId: vi.fn(),
  updateUserGenderAge: vi.fn(),
  updateUserNameMotiv: vi.fn()
}));

const getUserByUserIdMock = vi.mocked(userRepository.getUserByUserId);
const updateUserGenderAgeMock = vi.mocked(userRepository.updateUserGenderAge);
const updateUserNameMotivMock = vi.mocked(userRepository.updateUserNameMotiv);

describe('getUserByUserId', () => {
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
      motivation: null,
      gender: null,
      ageGroup: null
    };
    getUserByUserIdMock.mockResolvedValueOnce(user);

    await expect(getUserByUserId('user-1')).resolves.toBe(user);
  });
});

describe('updateUserGenderAge', () => {
  const user = {
    name: 'Kim',
    email: 'kim@example.com',
    profileImage: null,
    motivation: null,
    gender: null,
    ageGroup: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a missing user id', async () => {
    await expect(
      updateUserGenderAge('', { gender: 'MALE', ageGroup: 'TWENTIES' })
    ).rejects.toMatchObject({
      statusCode: 400
    });
  });

  it('rejects a missing user', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(null);

    await expect(
      updateUserGenderAge('user-1', { gender: 'MALE', ageGroup: 'TWENTIES' })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('rejects a missing payload', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    await expect(
      updateUserGenderAge('user-1', {} as UpdateUserGenderAgeRequest)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('rejects a null payload', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    await expect(
      updateUserGenderAge('user-1', null as unknown as UpdateUserGenderAgeRequest)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('rejects an invalid gender', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    await expect(
      updateUserGenderAge('user-1', {
        gender: 'INVALID',
        ageGroup: 'TWENTIES'
      } as unknown as UpdateUserGenderAgeRequest)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('rejects an invalid age group', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    await expect(
      updateUserGenderAge('user-1', {
        gender: 'MALE',
        ageGroup: 'INVALID'
      } as unknown as UpdateUserGenderAgeRequest)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('updates an existing user', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);

    const updatedUser = {
      id: 'user-1',
      name: 'Kim',
      email: 'kim@example.com',
      profileImage: null,
      motivation: null,
      gender: Gender.MALE,
      ageGroup: AgeGroup.TWENTIES,
      status: UserStatus.ACTIVE,
      withdrawalRequestedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    updateUserGenderAgeMock.mockResolvedValueOnce(updatedUser);
    await expect(
      updateUserGenderAge('user-1', { gender: 'MALE', ageGroup: 'TWENTIES' })
    ).resolves.toBe(updatedUser);
  });
});

describe('updateUserNameMotiv', () => {
  const user = {
    name: 'Kim',
    email: 'kim@example.com',
    profileImage: null,
    motivation: null,
    gender: null,
    ageGroup: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a missing user id', async () => {
    await expect(
      updateUserNameMotiv('', { name: 'Park', motivation: "Let's go!" })
    ).rejects.toMatchObject({
      statusCode: 400
    });
  });

  it('rejects a missing user', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(null);

    await expect(
      updateUserNameMotiv('user-1', { name: 'Park', motivation: "Let's go!" })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND'
    });
  });

  it('rejects a null payload', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    await expect(
      updateUserNameMotiv('user-1', null as unknown as UpdateUserNameMotivRequest)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('normalizes name and motivation', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    const updatedUser = {
      id: 'user-1',
      name: 'Park',
      email: 'kim@example.com',
      profileImage: null,
      motivation: "Let's go!",
      gender: null,
      ageGroup: null,
      status: UserStatus.ACTIVE,
      withdrawalRequestedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    updateUserNameMotivMock.mockResolvedValueOnce(updatedUser);
    await expect(
      updateUserNameMotiv('user-1', { name: '  Park  ', motivation: "  Let's go!  " })
    ).resolves.toBe(updatedUser);
  });

  it('updates an existing user', async () => {
    getUserByUserIdMock.mockResolvedValueOnce(user);
    const updatedUser = {
      id: 'user-1',
      name: 'Park',
      email: 'kim@example.com',
      profileImage: null,
      motivation: "Let's go!",
      gender: null,
      ageGroup: null,
      status: UserStatus.ACTIVE,
      withdrawalRequestedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    updateUserNameMotivMock.mockResolvedValueOnce(updatedUser);
    await expect(
      updateUserNameMotiv('user-1', { name: 'Park', motivation: "Let's go!" })
    ).resolves.toBe(updatedUser);
  });
});
