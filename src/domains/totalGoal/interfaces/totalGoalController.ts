import asyncHandler from '../../../shared/utils/asyncHandler';

import * as totalGoalService from '../application/totalGoalService';
import type { CreateTotalGoalRequestBody, UpdateTotalGoalRequestBody } from './totalGoalDto';

export const createTotalGoal = asyncHandler(async (req, res) => {
  const body = req.body as CreateTotalGoalRequestBody;

  const totalGoal = await totalGoalService.registerTotalGoal({ ...body, userId: req.userId! });

  res.status(201).json({
    success: true,
    data: totalGoal
  });
});

export const getTotalGoal = asyncHandler(async (req, res) => {
  const totalGoal = await totalGoalService.getTotalGoalByUserId(req.userId!);

  res.json({
    success: true,
    data: totalGoal
  });
});

export const getTotalGoalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const totalGoal = await totalGoalService.getTotalGoalById(id);

  res.json({
    success: true,
    data: totalGoal
  });
});

export const updateTotalGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateTotalGoalRequestBody;

  const totalGoal = await totalGoalService.updateTotalGoal(id, body);

  res.json({
    success: true,
    data: totalGoal
  });
});

export const deleteTotalGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await totalGoalService.deleteTotalGoal(id);

  res.status(204).send();
});
