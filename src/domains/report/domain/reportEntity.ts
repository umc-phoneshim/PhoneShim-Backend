import { BadRequestError } from '../../../shared/errors/appError';

import { formatDateOnly, getKstDateOnly } from '../../usageLog/domain/usageLogEntity';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportRange = 'day' | 'week' | 'month';

const REPORT_RANGES: ReportRange[] = ['day', 'week', 'month'];

// 요약 집계에 필요한 사용 사유 한 건
export type UsageReasonForReport = {
  monitoredAppId: string;
  appName: string;
  reason: string;
  timeRangeStart: Date;
  timeRangeEnd: Date;
};

// 한 사유 안에서 앱별로 나눈 사용 시간(바 그래프의 앱 색상 세그먼트)
export type ReasonAppUsage = {
  monitoredAppId: string;
  appName: string;
  minutes: number;
};

export type ReasonSummary = {
  reason: string;
  totalMinutes: number;
  apps: ReasonAppUsage[];
};

export type ReportSummary = {
  range: ReportRange;
  from: string;
  to: string;
  reasons: ReasonSummary[];
};

// range(day/week/month)와 기준 날짜로 집계할 날짜 구간(from ~ to)을 계산
// DAY=당일, WEEK=최근 7일, MONTH=최근 30일. date가 없으면 KST 오늘
export function parseReportRange(
  range: string,
  date?: string
): { range: ReportRange; from: Date; to: Date } {
  if (!REPORT_RANGES.includes(range as ReportRange)) {
    throw new BadRequestError('range must be one of: day, week, month', 'INVALID_REPORT_RANGE');
  }

  const to = getKstDateOnly(date);
  const daysBack = range === 'day' ? 0 : range === 'week' ? 6 : 29;
  const from = new Date(to.getTime() - daysBack * DAY_MS);

  return { range: range as ReportRange, from, to };
}

// 사용 사유들을 (사유 -> 앱)별 사용 시간으로 합산
// 한 시간 블록에 사유를 여러 개 골랐으면 각 사유에 그 블록 시간이 전체로 들어감
export function buildReasonSummaries(rows: UsageReasonForReport[]): ReasonSummary[] {
  const reasonMap: Record<string, Record<string, ReasonAppUsage>> = {};

  for (const row of rows) {
    const minutes = Math.round((row.timeRangeEnd.getTime() - row.timeRangeStart.getTime()) / 60000);

    if (minutes <= 0) {
      continue;
    }

    if (!reasonMap[row.reason]) {
      reasonMap[row.reason] = {};
    }
    const apps = reasonMap[row.reason];

    if (apps[row.monitoredAppId]) {
      apps[row.monitoredAppId].minutes += minutes;
    } else {
      apps[row.monitoredAppId] = {
        monitoredAppId: row.monitoredAppId,
        appName: row.appName,
        minutes
      };
    }
  }

  const summaries: ReasonSummary[] = Object.keys(reasonMap).map((reason) => {
    const apps = Object.values(reasonMap[reason]).sort((a, b) => b.minutes - a.minutes);
    const totalMinutes = apps.reduce((sum, app) => sum + app.minutes, 0);

    return { reason, totalMinutes, apps };
  });

  // 사용 시간이 많은 사유부터 정렬
  summaries.sort((a, b) => b.totalMinutes - a.totalMinutes);

  return summaries;
}

// 응답의 from/to는 YYYY-MM-DD 문자열로 반환
export function formatReportDate(date: Date): string {
  return formatDateOnly(date);
}
