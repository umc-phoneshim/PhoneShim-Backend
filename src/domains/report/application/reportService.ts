import * as appGoalRepository from '../../appGoal/infrastructure/appGoalRepository';
import * as deviceUsageRepository from '../../deviceUsage/infrastructure/deviceUsageRepository';
import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import * as totalGoalRepository from '../../totalGoal/infrastructure/totalGoalRepository';
import { getKstDateOnly } from '../../usageLog/domain/usageLogEntity';
import * as usageLogRepository from '../../usageLog/infrastructure/usageLogRepository';
import {
  buildReasonSummaries,
  buildSuggestion,
  formatReportDate,
  parseReportRange,
  type AppUsageForSuggestion,
  type ReportSuggestion,
  type ReportSummary
} from '../domain/reportEntity';
import * as reportRepository from '../infrastructure/reportRepository';

// REP104: 기간별 사용 사유 요약(사유별, 그 안에서 앱별 사용 시간)을 계산
export async function getReportSummary(
  userId: string,
  range: string,
  date?: string
): Promise<ReportSummary> {
  const { range: validRange, from, to } = parseReportRange(range, date);

  const usageReasons = await reportRepository.findUsageReasonsInRange(userId, from, to);

  const reasons = buildReasonSummaries(
    usageReasons.map((usageReason) => ({
      monitoredAppId: usageReason.monitoredAppId,
      appName: usageReason.monitoredApp.appName,
      reason: usageReason.reason,
      timeRangeStart: usageReason.timeRangeStart,
      timeRangeEnd: usageReason.timeRangeEnd
    }))
  );

  return {
    range: validRange,
    from: formatReportDate(from),
    to: formatReportDate(to),
    reasons
  };
}

// REP103: 지정 날짜(없으면 KST 오늘)의 목표 달성 상태로 "쉼이의 제안"을 계산
export async function getReportSuggestion(
  userId: string,
  date?: string
): Promise<ReportSuggestion> {
  const targetDate = getKstDateOnly(date);

  const totalGoal = await totalGoalRepository.findByUserId(userId);

  // 전체 목표가 없으면 전체 달성 여부를 판단할 수 없으므로 목표 설정 안내(NO_GOAL)
  if (!totalGoal) {
    return buildSuggestion({ phoneTotalMinutes: 0, totalTargetMinutes: null, apps: [] });
  }

  const monitoredApps = await monitoredAppRepository.findAllByUserId(userId);
  const monitoredAppIds = monitoredApps.map((app) => app.id);

  // 폰 전체 사용량 / 주의앱 사용 로그 / 주의앱 목표는 서로 의존성이 없어 동시에 조회
  const [deviceUsages, usageSummaries, appGoals] = await Promise.all([
    deviceUsageRepository.findAllByUserIdInRange(userId, targetDate, targetDate),
    usageLogRepository.findAllByUserIdAndDate(userId, monitoredAppIds, targetDate),
    appGoalRepository.findAllByMonitoredAppIds(monitoredAppIds)
  ]);

  const phoneTotalMinutes = deviceUsages[0]?.totalUsedMinutes ?? 0;

  const usedMinutesByApp = new Map(
    usageSummaries.map((summary) => [summary.monitoredAppId, summary.usedMinutes])
  );
  const targetMinutesByApp = new Map(
    appGoals.map((goal) => [goal.monitoredAppId, goal.targetMinutes])
  );

  const apps: AppUsageForSuggestion[] = monitoredApps.map((app) => ({
    appName: app.appName,
    usedMinutes: usedMinutesByApp.get(app.id) ?? 0,
    targetMinutes: targetMinutesByApp.get(app.id) ?? null
  }));

  return buildSuggestion({
    phoneTotalMinutes,
    totalTargetMinutes: totalGoal.targetMinutes,
    apps
  });
}
