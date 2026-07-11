import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as usageLogService from '../application/usageLogService';
import type { RecordUsageLogRequest } from './usageLogDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const recordUsageLog = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as RecordUsageLogRequest;

  const result = await usageLogService.recordUsageLog({
    userId,
    monitoredAppId: body.monitoredAppId,
    date: body.date,
    usedMinutes: body.usedMinutes,
    entryCount: body.entryCount
  });

  sendSuccess(res, result);
});

export const getTodayUsageStatus = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await usageLogService.getTodayUsageStatus(userId);

  sendSuccess(res, result);
});

// API_SPEC.md: GET /api/usage-logs?date=
export const getUsageLogsByDate = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const date = req.query.date;
  const dateParam = typeof date === 'string' ? date : undefined;

  const result = await usageLogService.getUsageLogsByDate(userId, dateParam);

  sendSuccess(res, result);
});
