import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as usageReasonService from '../application/usageReasonService';
import type { CreateUsageReasonRequest } from './usageReasonDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createUsageReason = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as CreateUsageReasonRequest;

  const result = await usageReasonService.createUsageReason({
    userId,
    monitoredAppId: body.monitoredAppId,
    usageLogId: body.usageLogId,
    date: body.date,
    timeRangeStart: body.timeRangeStart,
    timeRangeEnd: body.timeRangeEnd,
    reason: body.reason
  });

  sendCreated(res, result);
});
