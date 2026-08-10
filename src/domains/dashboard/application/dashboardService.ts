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
  // 목표 대비 사용량은 폰 전체 스크린타임 기준으로 판정합니다(주의 앱 합계 아님).
  const [usedMinutes, targetMinutes] = await Promise.all([
    dashboardRepository.findDeviceUsedMinutes(userId, date),
    dashboardRepository.findTotalTargetMinutes(userId)
  ]);

  return buildDailyUsageSummary({ date, usedMinutes, targetMinutes });
}
