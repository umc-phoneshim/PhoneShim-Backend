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

// REP103: 쉼이의 제안 —목표 달성 상태로 제안1/2/3 템플릿을 고르고 숫자만 채움
export type SuggestionType = 'TOTAL_EXCEEDED' | 'APP_EXCEEDED' | 'ACHIEVED' | 'NO_GOAL';

// buildSuggestion에 넘길 주의앱 하나의 사용/목표 정보
export type AppUsageForSuggestion = {
  appName: string;
  usedMinutes: number;
  targetMinutes: number | null; // 목표가 없으면 null
};

export type SuggestionInput = {
  phoneTotalMinutes: number; // 그날 폰 전체 스크린타임
  totalTargetMinutes: number | null;
  apps: AppUsageForSuggestion[];
};

export type ReportSuggestion = {
  suggestionType: SuggestionType;
  message: string;
  excessMinutes: number;
  appName: string | null;
};

const ACHIEVED_MESSAGE = '오늘 목표를 달성했어요! 지금처럼 꾸준히 이어가 보세요.';
const NO_GOAL_MESSAGE =
  '아직 전체 사용 목표가 없어요. 목표를 설정하면 매일 맞춤 제안을 받아볼 수 있어요.';

// 제안1 문구
function buildTotalExceededMessage(excessMinutes: number, appName: string | null): string {
  if (appName) {
    return `오늘 폰 사용 시간이 목표보다 ${excessMinutes}분 많았어요. 그 중 특히 ${appName} 사용이 많이 나타났어요. 내일은 ${appName} 사용을 줄여 전체 폰 사용 시간을 줄여봐요.`;
  }

  return `오늘 폰 사용 시간이 목표보다 ${excessMinutes}분 많았어요. 내일은 폰 사용 시간을 조금 줄여봐요.`;
}

// 제안2 문구
function buildAppExceededMessage(appName: string, excessMinutes: number): string {
  return `오늘 ${appName} 사용 시간이 목표보다 ${excessMinutes}분 많았어요. 내일은 10분만 먼저 줄여보는 건 어떨까요?`;
}

// 그날 가장 많이 쓴 주의앱 이름
function pickMostUsedAppName(apps: AppUsageForSuggestion[]): string | null {
  let topName: string | null = null;
  let topMinutes = 0;

  for (const app of apps) {
    if (app.usedMinutes > topMinutes) {
      topMinutes = app.usedMinutes;
      topName = app.appName;
    }
  }

  return topMinutes > 0 ? topName : null;
}

// 목표를 가장 많이 초과한 주의앱
function pickMostExceededApp(
  apps: AppUsageForSuggestion[]
): { appName: string; excessMinutes: number } | null {
  let result: { appName: string; excessMinutes: number } | null = null;
  let topExcess = 0;

  for (const app of apps) {
    if (app.targetMinutes === null) {
      continue;
    }

    const excess = app.usedMinutes - app.targetMinutes;

    if (excess > topExcess) {
      topExcess = excess;
      result = { appName: app.appName, excessMinutes: excess };
    }
  }

  return result;
}

// REP103: 목표 달성 상태로 제안1/2/3(또는 목표 미설정)을 골라 문구까지 채워 반환
export function buildSuggestion(input: SuggestionInput): ReportSuggestion {
  const { phoneTotalMinutes, totalTargetMinutes, apps } = input;

  // 전체 목표가 없으면 전체 달성 여부를 판단할 수 없으므로 목표 설정을 안내
  if (totalTargetMinutes === null) {
    return { suggestionType: 'NO_GOAL', message: NO_GOAL_MESSAGE, excessMinutes: 0, appName: null };
  }

  // 제안1
  if (phoneTotalMinutes > totalTargetMinutes) {
    const excessMinutes = phoneTotalMinutes - totalTargetMinutes;
    const appName = pickMostUsedAppName(apps);

    return {
      suggestionType: 'TOTAL_EXCEEDED',
      message: buildTotalExceededMessage(excessMinutes, appName),
      excessMinutes,
      appName
    };
  }

  // 제안2
  const mostExceededApp = pickMostExceededApp(apps);

  if (mostExceededApp) {
    return {
      suggestionType: 'APP_EXCEEDED',
      message: buildAppExceededMessage(mostExceededApp.appName, mostExceededApp.excessMinutes),
      excessMinutes: mostExceededApp.excessMinutes,
      appName: mostExceededApp.appName
    };
  }

  // 제안3
  return { suggestionType: 'ACHIEVED', message: ACHIEVED_MESSAGE, excessMinutes: 0, appName: null };
}
