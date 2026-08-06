import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as usageSessionService from '../application/usageSessionService';
import type { CreateUsageSessionRequest } from './usageSessionDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createUsageSession = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as CreateUsageSessionRequest;

  const result = await usageSessionService.createUsageSession({
    userId,
    monitoredAppId: body.monitoredAppId,
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime
  });

  sendCreated(res, result);
});

// REP101: GET /api/usage-sessions?date=YYYY-MM-DD [date 없으면 KST 오늘]
export const getUsageSessionsByDate = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const date = req.query.date;
  const dateParam = typeof date === 'string' ? date : undefined;

  const result = await usageSessionService.getUsageSessionsByDate(userId, dateParam);

  sendSuccess(res, result);
});
