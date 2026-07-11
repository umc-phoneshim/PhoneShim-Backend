import { BadRequestError } from '../../../shared/errors/appError';

import { buildDailyUsageSummary, getTodayInKst } from '../domain/dashboardEntity';
import * as dashboardRepository from '../infrastructure/dashboardRepository';

const ensureUserId = (userId: string) => {
  if (!userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }
};

export async function getDailyUsageSummary(userId: string) {
  ensureUserId(userId);

  const date = getTodayInKst();
  const [usedMinutes, targetMinutes] = await Promise.all([
    dashboardRepository.sumUsedMinutes(userId, date),
    dashboardRepository.findTotalTargetMinutes(userId)
  ]);

  return buildDailyUsageSummary({ date, usedMinutes, targetMinutes });
}
