import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as dashboardService from '../application/dashboardService';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const getDailyUsageSummary = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await dashboardService.getDailyUsageSummary(userId);

  sendSuccess(res, result);
});
