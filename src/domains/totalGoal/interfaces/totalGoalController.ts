import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as totalGoalService from '../application/totalGoalService';
import type { CreateTotalGoalRequest, UpdateTotalGoalRequest } from './totalGoalDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createTotalGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const body = req.body as CreateTotalGoalRequest;

  const result = await totalGoalService.createTotalGoal(userId, {
    targetMinutes: body.targetMinutes,
    restrictAfter: body.restrictAfter
  });

  sendCreated(res, result);
});

export const getTotalGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  const result = await totalGoalService.getTotalGoal(userId);

  sendSuccess(res, result);
});

export const updateTotalGoal = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  const result = await totalGoalService.updateTotalGoal(userId, req.body as UpdateTotalGoalRequest);

  sendSuccess(res, result);
});
