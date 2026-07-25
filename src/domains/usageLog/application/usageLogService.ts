import { NotFoundError } from '../../../shared/errors/appError';

import * as appGoalRepository from '../../appGoal/infrastructure/appGoalRepository';
import type { AppGoal } from '../../appGoal/domain/appGoalEntity';
import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import type { MonitoredApp } from '../../monitoredApp/domain/monitoredAppEntity';
import * as totalGoalRepository from '../../totalGoal/infrastructure/totalGoalRepository';
import {
  buildAchievedDates,
  createUsageLogEntity,
  formatDateOnly,
  getKstDateOnly,
  parseMonthRange,
  type MonitoredAppUsageStatus,
  type RecordUsageLogPayload,
  type UsageCalendar,
  type UsageLogRecord
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

// API_SPEC.md: GET /api/usage-logs?date= — usage_logs 원본 행을 그대로 반환합니다.
// date가 없으면 KST 기준 오늘을 사용합니다 (공통 규칙).
export async function getUsageLogsByDate(userId: string, date?: string): Promise<UsageLogRecord[]> {
  const targetDate = getKstDateOnly(date);
  const usageLogs = await usageLogRepository.findAllByUserIdForDate(userId, targetDate);

  return usageLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    monitoredAppId: log.monitoredAppId,
    date: formatDateOnly(log.date),
    usedMinutes: log.usedMinutes,
    entryCount: log.entryCount,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  }));
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
        entryCount
      };
    })
    .sort((a: MonitoredAppUsageStatus, b: MonitoredAppUsageStatus) => a.sortOrder - b.sortOrder);
}

// REP106: 한 달 동안 목표를 달성(O)한 날짜 목록을 반환
export async function getUsageCalendar(userId: string, month: string): Promise<UsageCalendar> {
  const { start, end } = parseMonthRange(month);

  const totalGoal = await totalGoalRepository.findByUserId(userId);

  // 전체 목표가 없으면 폰 사용이 목표 이하인지 판단할 수 없으므로 달성일도 없음
  if (!totalGoal) {
    return { month, achievedDates: [] };
  }

  // monitoredApps와 logs는 서로 의존성이 없어서 동시에 조회
  const [monitoredApps, logs] = await Promise.all([
    monitoredAppRepository.findAllByUserId(userId),
    usageLogRepository.findAllByUserIdInRange(userId, start, end)
  ]);

  const monitoredAppIds = monitoredApps.map((app: MonitoredApp) => app.id);

  const appGoals = await appGoalRepository.findAllByMonitoredAppIds(monitoredAppIds);
  const appTargetMinutes = new Map<string, number>(
    appGoals.map((goal: AppGoal) => [goal.monitoredAppId, goal.targetMinutes])
  );

  const achievedDates = buildAchievedDates(logs, totalGoal.targetMinutes, appTargetMinutes);

  return { month, achievedDates };
}
