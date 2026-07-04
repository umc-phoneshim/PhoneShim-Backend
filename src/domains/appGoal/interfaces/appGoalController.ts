import asyncHandler from '../../../shared/utils/asyncHandler';
import AppError from '../../../shared/errors/AppError';

import * as appGoalService from '../application/appGoalService';
import type { CreateAppGoalRequestBody, UpdateAppGoalRequestBody } from './appGoalDto';

export const createAppGoal = asyncHandler(async (req, res) => {
  const body = req.body as CreateAppGoalRequestBody;

  const appGoal = await appGoalService.registerAppGoal(body);

  res.status(201).json({
    success: true,
    data: appGoal
  });
});

export const getAppGoal = asyncHandler(async (req, res) => {
  const monitoredAppId = req.query.monitoredAppId as string | undefined;

  if (!monitoredAppId) {
    throw new AppError(
      'monitoredAppId 쿼리 파라미터는 필수입니다.',
      400,
      'INVALID_MONITORED_APP_ID'
    );
  }

  const appGoal = await appGoalService.getAppGoalByMonitoredAppId(monitoredAppId);

  res.json({
    success: true,
    data: appGoal
  });
});

export const getAppGoalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appGoal = await appGoalService.getAppGoalById(id);

  res.json({
    success: true,
    data: appGoal
  });
});

export const updateAppGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateAppGoalRequestBody;

  const appGoal = await appGoalService.updateAppGoal(id, body);

  res.json({
    success: true,
    data: appGoal
  });
});

export const deleteAppGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await appGoalService.deleteAppGoal(id);

  res.status(204).send();
});
