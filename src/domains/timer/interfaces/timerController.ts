import * as timerService from '../application/timerService';
import asyncHandler from '../../../shared/utils/asyncHandler';

export const startTimer = asyncHandler(async (req, res) => {
  const result = await timerService.startTimer(req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});

export const stopTimer = asyncHandler(async (req, res) => {
  const result = await timerService.stopTimer(req.body);

  res.json({
    success: true,
    data: result
  });
});
