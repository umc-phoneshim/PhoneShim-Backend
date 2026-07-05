import * as timerService from '../application/timerService';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';
import type { StartTimerRequest, StopTimerRequest } from './timerDto';

export const startTimer = asyncHandler(async (req, res) => {
  const result = await timerService.startTimer(req.body as StartTimerRequest);

  sendCreated(res, result);
});

export const stopTimer = asyncHandler(async (req, res) => {
  const result = await timerService.stopTimer(req.body as StopTimerRequest);

  sendSuccess(res, result);
});
