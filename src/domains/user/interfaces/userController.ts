import { UnauthorizedError } from '../../../shared/errors/appError';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as userService from '../application/userService';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return user.userId;
};

export const getUser = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const user = await userService.getUserByUserId(userId);

  res.json({
    success: true,
    data: user
  });
});
