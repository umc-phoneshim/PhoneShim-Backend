import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as deviceUsageService from '../application/deviceUsageService';
import type { RecordDeviceUsageRequest } from './deviceUsageDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const recordDeviceUsage = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as RecordDeviceUsageRequest;

  const result = await deviceUsageService.recordDeviceUsage({
    userId,
    date: body.date,
    totalUsedMinutes: body.totalUsedMinutes
  });

  sendSuccess(res, result);
});
