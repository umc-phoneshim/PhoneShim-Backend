import { BadRequestError } from '../../../shared/errors/appError';

export type UsageLog = {
  id: string;
  userId: string;
  monitoredAppId: string;
  date: Date;
  usedMinutes: number;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// 안드로이드가 오늘 하루의 누적 사용시간/실행횟수를 주기적으로 통째로 보내면
// (userId, monitoredAppId, date) 기준 upsert합니다. v1은 세션 단위가 아닌
// 하루 집계 기준입니다 (ERD.md 참고).
export type RecordUsageLogPayload = {
  userId: string;
  monitoredAppId: string;
  date?: string | Date;
  usedMinutes: number;
  entryCount: number;
};

export type NewUsageLog = {
  userId: string;
  monitoredAppId: string;
  date: Date;
  usedMinutes: number;
  entryCount: number;
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// date를 별도로 넘기지 않으면 서버 기준 오늘(KST) 날짜를 사용합니다.
export function getKstDateOnly(input?: string | Date): Date {
  const base = input ? new Date(input) : new Date();

  if (Number.isNaN(base.getTime())) {
    throw new BadRequestError('date must be a valid date', 'VALIDATION_ERROR');
  }

  const kst = new Date(base.getTime() + KST_OFFSET_MS);

  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

// API_SPEC.md 공통 규칙: 날짜는 YYYY-MM-DD 문자열로 응답합니다.
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function createUsageLogEntity(payload: RecordUsageLogPayload): NewUsageLog {
  if (!payload.userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }

  if (!payload.monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  if (
    !Number.isFinite(payload.usedMinutes) ||
    !Number.isInteger(payload.usedMinutes) ||
    payload.usedMinutes < 0
  ) {
    throw new BadRequestError('usedMinutes must be a non-negative integer', 'VALIDATION_ERROR');
  }

  if (
    !Number.isFinite(payload.entryCount) ||
    !Number.isInteger(payload.entryCount) ||
    payload.entryCount < 0
  ) {
    throw new BadRequestError('entryCount must be a non-negative integer', 'VALIDATION_ERROR');
  }

  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    date: getKstDateOnly(payload.date),
    usedMinutes: payload.usedMinutes,
    entryCount: payload.entryCount
  };
}

// MAIN104 화면은 목표 대비 몇 %를 썼는지 퍼센티지로만 보여주고, 색상/상태 판단은
// 하지 않습니다(정책 임계값이 바뀔 때마다 서버 배포가 필요해지는 걸 피하기 위해
// 안드로이드 쪽에서 targetMinutes/usedMinutes로 직접 계산). 목표가 없는 경우는
// targetMinutes/targetCount가 null인 것으로 구분합니다.
export type MonitoredAppUsageStatus = {
  monitoredAppId: string;
  appName: string;
  packageName: string;
  appIcon: string | null;
  sortOrder: number;
  targetMinutes: number | null;
  targetCount: number | null;
  usedMinutes: number;
  entryCount: number;
};

// API_SPEC.md의 GET /api/usage-logs?date= 응답 형태 (usage_logs 원본 행 그대로)
export type UsageLogRecord = {
  id: string;
  userId: string;
  monitoredAppId: string;
  date: string;
  usedMinutes: number;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// REP106 캘린더 응답: 그 달에 목표를 달성(O)한 날짜 목록
export type UsageCalendar = {
  month: string;
  achievedDates: string[];
};

// "YYYY-MM"을 받아 그 달의 첫날/마지막날 반환
export function parseMonthRange(month: string): { start: Date; end: Date } {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new BadRequestError('month must be in YYYY-MM format', 'VALIDATION_ERROR');
  }

  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    throw new BadRequestError('month must be a valid month', 'VALIDATION_ERROR');
  }

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0)); // 다음 달 0일 = 이번 달 마지막 날

  return { start, end };
}

// 정책 REP-07: 그 날 폰 전체 사용(주의앱 합계)이 전체 목표 이하이고,
// 목표가 설정된 주의앱이 모두 각자 목표 이하일 때만 달성
export function buildAchievedDates(
  logs: { monitoredAppId: string; date: Date; usedMinutes: number }[],
  totalTargetMinutes: number,
  appTargetMinutes: Map<string, number>
): string[] {
  const usedByDate: Record<string, number> = {};
  const appOkByDate: Record<string, boolean> = {};

  for (const log of logs) {
    const dateKey = formatDateOnly(log.date);

    if (usedByDate[dateKey] === undefined) {
      usedByDate[dateKey] = 0;
      appOkByDate[dateKey] = true;
    }

    usedByDate[dateKey] += log.usedMinutes;

    const appTarget = appTargetMinutes.get(log.monitoredAppId);
    if (appTarget !== undefined && log.usedMinutes > appTarget) {
      appOkByDate[dateKey] = false;
    }
  }

  const achievedDates: string[] = [];

  for (const dateKey of Object.keys(usedByDate)) {
    const phoneOk = usedByDate[dateKey] <= totalTargetMinutes;
    const allAppsOk = appOkByDate[dateKey];

    if (phoneOk && allAppsOk) {
      achievedDates.push(dateKey);
    }
  }

  achievedDates.sort();

  return achievedDates;
}
