import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as usageLogService from '../application/usageLogService';
import type { UpsertUsageLogRequest } from './usageLogDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const upsertUsageLog = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as UpsertUsageLogRequest;

  const result = await usageLogService.upsertUsageLog({
    userId,
    monitoredAppId: body.monitoredAppId,
    date: body.date,
    usedMinutes: body.usedMinutes,
    entryCount: body.entryCount
  });

  sendSuccess(res, result);
});
