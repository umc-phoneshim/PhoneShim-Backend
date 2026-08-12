import { BadRequestError, UnauthorizedError } from '../../../shared/errors/appError';
import { sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as reportService from '../application/reportService';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

// REP104: GET /api/reports/summary?range=day|week|month&date=YYYY-MM-DD
export const getReportSummary = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const range = req.query.range;
  const date = req.query.date;

  if (typeof range !== 'string') {
    throw new BadRequestError('range query is required (day, week, month)', 'INVALID_REPORT_RANGE');
  }

  const dateParam = typeof date === 'string' ? date : undefined;

  const result = await reportService.getReportSummary(userId, range, dateParam);

  sendSuccess(res, result);
});

// REP103: GET /api/reports/suggestion?date=YYYY-MM-DD
export const getReportSuggestion = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const date = req.query.date;

  const dateParam = typeof date === 'string' ? date : undefined;

  const result = await reportService.getReportSuggestion(userId, dateParam);

  sendSuccess(res, result);
});
