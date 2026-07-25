import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';
import * as userService from '../application/userService';
import type { UpdateUserGenderAgeRequest } from './userDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return user.userId;
};

export const getUser = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const user = await userService.getUserByUserId(userId);

  sendSuccess(res, user);
});

export const updateUserGenderAge = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await userService.updateUserGenderAge(
    userId,
    req.body as UpdateUserGenderAgeRequest
  );
  sendSuccess(res, result);
});
