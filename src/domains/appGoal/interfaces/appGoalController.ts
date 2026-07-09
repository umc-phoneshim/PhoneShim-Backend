import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as appGoalService from '../application/appGoalService';
import type { CreateAppGoalRequest, UpdateAppGoalRequest } from './appGoalDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await appGoalService.createAppGoal(
    userId,
    req.params.monitoredAppId,
    req.body as CreateAppGoalRequest
  );

  sendCreated(res, result);
});

export const getAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await appGoalService.getAppGoal(userId, req.params.monitoredAppId);

  sendSuccess(res, result);
});

export const updateAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await appGoalService.updateAppGoal(
    userId,
    req.params.monitoredAppId,
    req.body as UpdateAppGoalRequest
  );

  sendSuccess(res, result);
});

export const deleteAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  await appGoalService.deleteAppGoal(userId, req.params.monitoredAppId);

  res.status(204).send();
});
