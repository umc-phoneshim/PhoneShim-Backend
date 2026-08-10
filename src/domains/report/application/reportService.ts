import {
  buildReasonSummaries,
  formatReportDate,
  parseReportRange,
  type ReportSummary
} from '../domain/reportEntity';
import * as reportRepository from '../infrastructure/reportRepository';

// REP104: 기간별 사용 사유 요약(사유별, 그 안에서 앱별 사용 시간)을 계산합니다.
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
