import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserStatus } from '@prisma/client';
import {
  getUser,
  updateUserGenderAge,
  updateUserNameMotiv
} from '../src/domains/user/interfaces/userController';
import * as userService from '../src/domains/user/application/userService';
import { sendSuccess } from '../src/shared/responses/apiResponse';

vi.mock('../src/domains/user/application/userService', () => ({
  getUserByUserId: vi.fn(),
  updateUserGenderAge: vi.fn(),
  updateUserNameMotiv: vi.fn()
}));
vi.mock('../src/shared/responses/apiResponse', () => ({
  sendSuccess: vi.fn()
}));

const getUserByUserIdMock = vi.mocked(userService.getUserByUserId);
const updateUserGenderAgeMock = vi.mocked(userService.updateUserGenderAge);
const updateUserNameMotivMock = vi.mocked(userService.updateUserNameMotiv);
const sendSuccessMock = vi.mocked(sendSuccess);

type MockRequest = Partial<Request> & {
  user?: {
    userId: string;
  };
};

const createAuthenticatedRequest = (body?: Request['body']): MockRequest => ({
  user: { userId: 'user-1' },
  body
});

const createMockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
  send: vi.fn()
});

const mockNext = vi.fn();

const expectUnauthorized = async (controllerFn: RequestHandler) => {
  mockNext.mockClear();

  controllerFn(
    {} as Request,
    createMockResponse() as unknown as Response,
    mockNext as NextFunction
  );

  await vi.waitFor(() => {
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        name: 'UnauthorizedError'
      })
    );
  });

  expect(sendSuccessMock).not.toHaveBeenCalled();
};

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user data for authenticated user', async () => {
    const mockUser = {
      name: 'Kim',
      email: 'kim@example.com',
      profileImage: null,
      motivation: null,
      gender: null,
      ageGroup: null
    };
    getUserByUserIdMock.mockResolvedValueOnce(mockUser);

    const req = createAuthenticatedRequest();
    const res = createMockResponse() as unknown as Response;

    getUser(req as Request, res, mockNext as NextFunction);

    await vi.waitFor(() => {
      expect(getUserByUserIdMock).toHaveBeenCalledWith('user-1');
      expect(sendSuccessMock).toHaveBeenCalledWith(res, mockUser);
    });
  });

  it('throws UnauthorizedError for unauthenticated user', async () => {
    await expectUnauthorized(getUser);
    expect(getUserByUserIdMock).not.toHaveBeenCalled();
  });

  it('forwards service errors to next', async () => {
    const error = new Error('Service error');
    getUserByUserIdMock.mockRejectedValueOnce(error);

    getUser(
      createAuthenticatedRequest() as Request,
      createMockResponse() as unknown as Response,
      mockNext as NextFunction
    );

    await vi.waitFor(() => {
      expect(mockNext).toHaveBeenCalledWith(error);
    });
    expect(sendSuccessMock).not.toHaveBeenCalled();
  });
});

describe('updateUserGenderAge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user gender and age for authenticated user', async () => {
    const mockResult = {
      id: 'user-1',
      name: 'Kim',
      email: 'kim@example.com',
      profileImage: null,
      motivation: null,
      gender: null,
      ageGroup: null,
      status: UserStatus.ACTIVE,
      withdrawalRequestedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    updateUserGenderAgeMock.mockResolvedValueOnce(mockResult);

    const req = createAuthenticatedRequest({ gender: 'MALE', ageGroup: 'TWENTIES' });
    const res = createMockResponse() as unknown as Response;

    updateUserGenderAge(req as Request, res, mockNext as NextFunction);

    await vi.waitFor(() => {
      expect(updateUserGenderAgeMock).toHaveBeenCalledWith('user-1', {
        gender: 'MALE',
        ageGroup: 'TWENTIES'
      });
      expect(sendSuccessMock).toHaveBeenCalledWith(res, mockResult);
    });
  });

  it('throws UnauthorizedError for unauthenticated user', async () => {
    await expectUnauthorized(updateUserGenderAge);
    expect(updateUserGenderAgeMock).not.toHaveBeenCalled();
  });

  it('forwards service errors to next', async () => {
    const error = new Error('Service error');
    updateUserGenderAgeMock.mockRejectedValueOnce(error);

    updateUserGenderAge(
      createAuthenticatedRequest({
        gender: 'MALE',
        ageGroup: 'TWENTIES'
      }) as Request,
      createMockResponse() as unknown as Response,
      mockNext as NextFunction
    );

    await vi.waitFor(() => {
      expect(mockNext).toHaveBeenCalledWith(error);
    });
    expect(sendSuccessMock).not.toHaveBeenCalled();
  });
});

describe('updateUserNameMotiv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user name and motivation for authenticated user', async () => {
    const mockResult = {
      id: 'user-1',
      name: 'Kim',
      email: 'kim@example.com',
      profileImage: null,
      motivation: null,
      gender: null,
      ageGroup: null,
      status: UserStatus.ACTIVE,
      withdrawalRequestedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    updateUserNameMotivMock.mockResolvedValueOnce(mockResult);

    const req = createAuthenticatedRequest({ name: 'Kim', motivation: '매일 기록하기' });
    const res = createMockResponse() as unknown as Response;

    updateUserNameMotiv(req as Request, res, mockNext as NextFunction);

    await vi.waitFor(() => {
      expect(updateUserNameMotivMock).toHaveBeenCalledWith('user-1', {
        name: 'Kim',
        motivation: '매일 기록하기'
      });
      expect(sendSuccessMock).toHaveBeenCalledWith(res, mockResult);
    });
  });

  it('throws UnauthorizedError for unauthenticated user', async () => {
    await expectUnauthorized(updateUserNameMotiv);
    expect(updateUserNameMotivMock).not.toHaveBeenCalled();
  });

  it('forwards service errors to next', async () => {
    const error = new Error('Service error');
    updateUserNameMotivMock.mockRejectedValueOnce(error);

    updateUserNameMotiv(
      createAuthenticatedRequest({
        name: 'Kim',
        motivation: '매일 기록하기'
      }) as Request,
      createMockResponse() as unknown as Response,
      mockNext as NextFunction
    );

    await vi.waitFor(() => {
      expect(mockNext).toHaveBeenCalledWith(error);
    });
    expect(sendSuccessMock).not.toHaveBeenCalled();
  });
});
