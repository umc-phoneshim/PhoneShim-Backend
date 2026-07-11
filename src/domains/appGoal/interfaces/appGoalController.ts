import { BadRequestError, UnauthorizedError } from '../../../shared/errors/appError';
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
  const body = req.body as CreateAppGoalRequest;

  const result = await appGoalService.createAppGoal(userId, {
    monitoredAppId: body.monitoredAppId,
    targetMinutes: body.targetMinutes,
    targetCount: body.targetCount,
    restrictAfter: body.restrictAfter,
    goalReason: body.goalReason
  });

  sendCreated(res, result);
});

export const getAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const monitoredAppId = req.query.monitoredAppId;

  if (typeof monitoredAppId !== 'string' || !monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  const result = await appGoalService.getAppGoalByMonitoredAppId(userId, monitoredAppId);

  sendSuccess(res, result);
});

export const updateAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await appGoalService.updateAppGoal(
    req.params.id,
    userId,
    req.body as UpdateAppGoalRequest
  );

  sendSuccess(res, result);
});

export const deleteAppGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  await appGoalService.deleteAppGoal(req.params.id, userId);

  res.status(204).send();
});
