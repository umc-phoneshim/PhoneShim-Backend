import { BadRequestError, UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
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
    reasonCodes: body.reasonCodes
  });

  sendCreated(res, result);
});

export const getUsageReasonCalendar = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const month = req.query.month;

  if (typeof month !== 'string') {
    throw new BadRequestError('month query is required (YYYY-MM)', 'VALIDATION_ERROR');
  }

  const result = await usageReasonService.getUsageReasonCalendar(userId, month);

  sendSuccess(res, result);
});
