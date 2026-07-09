import { NotFoundError } from '../../../shared/errors/appError';

import * as appGoalRepository from '../../appGoal/infrastructure/appGoalRepository';
import type { AppGoal } from '../../appGoal/domain/appGoalEntity';
import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import type { MonitoredApp } from '../../monitoredApp/domain/monitoredAppEntity';
import {
  calculateUsageStatus,
  createUsageLogEntity,
  getKstDateOnly,
  type MonitoredAppUsageStatus,
  type RecordUsageLogPayload
} from '../domain/usageLogEntity';
import type { DailyUsageSummary } from '../domain/usageLogRepositoryInterface';
import * as usageLogRepository from '../infrastructure/usageLogRepository';

// 안드로이드가 주기적으로 "오늘 누적 사용시간/실행횟수"를 보내면 그대로 upsert합니다.
export async function recordUsageLog(payload: RecordUsageLogPayload) {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    payload.monitoredAppId,
    payload.userId
  );

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  const newUsageLog = createUsageLogEntity(payload);

  return usageLogRepository.upsertDaily(newUsageLog);
}

// MAIN104: 사용자의 주의어플 목록 + 오늘 사용 현황 + 목표 대비 상태를 반환합니다.
export async function getTodayUsageStatus(userId: string): Promise<MonitoredAppUsageStatus[]> {
  const monitoredApps = await monitoredAppRepository.findAllByUserId(userId);

  if (monitoredApps.length === 0) {
    return [];
  }

  const monitoredAppIds = monitoredApps.map((app: MonitoredApp) => app.id);
  const today = getKstDateOnly();

  const [appGoals, usageSummaries] = await Promise.all([
    appGoalRepository.findAllByMonitoredAppIds(monitoredAppIds),
    usageLogRepository.findAllByUserIdAndDate(userId, monitoredAppIds, today)
  ]);

  const appGoalMap = new Map<string, AppGoal>(
    appGoals.map((goal: AppGoal) => [goal.monitoredAppId, goal])
  );
  const usageMap = new Map<string, DailyUsageSummary>(
    usageSummaries.map((summary: DailyUsageSummary) => [summary.monitoredAppId, summary])
  );

  return monitoredApps
    .map((app: MonitoredApp): MonitoredAppUsageStatus => {
      const goal = appGoalMap.get(app.id);
      const usage = usageMap.get(app.id);

      const usedMinutes = usage?.usedMinutes ?? 0;
      const entryCount = usage?.entryCount ?? 0;
      const targetMinutes = goal?.targetMinutes ?? null;

      return {
        monitoredAppId: app.id,
        appName: app.appName,
        packageName: app.packageName,
        appIcon: app.appIcon,
        sortOrder: app.sortOrder,
        targetMinutes,
        targetCount: goal?.targetCount ?? null,
        usedMinutes,
        entryCount,
        status: calculateUsageStatus(usedMinutes, targetMinutes)
      };
    })
    .sort((a: MonitoredAppUsageStatus, b: MonitoredAppUsageStatus) => a.sortOrder - b.sortOrder);
}
