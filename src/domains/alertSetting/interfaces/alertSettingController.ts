import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as alertSettingService from '../application/alertSettingService';
import type { UpdateAlertSettingRequest } from './alertSettingDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const getAlertSetting = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await alertSettingService.getAlertSetting(userId);

  sendSuccess(res, result);
});

export const updateAlertSetting = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as UpdateAlertSettingRequest;

  const result = await alertSettingService.updateAlertSetting(userId, body.alertTimeMinutes);

  sendSuccess(res, result);
});
