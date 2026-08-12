import { BadRequestError } from '../../../shared/errors/appError';

import {
  formatDateOnly,
  getKstDateOnly,
  parseMonthRange
} from '../../usageLog/domain/usageLogEntity';

// 사용 이유 팝업의 고정 객관식 선택지 (Figma REP-01: 여가/이동/습관/정보/기타).
export const USAGE_REASON_CODES = ['LEISURE', 'COMMUTE', 'HABIT', 'INFO', 'OTHER'] as const;
export type UsageReasonCode = (typeof USAGE_REASON_CODES)[number];

export type UsageReason = {
  id: string;
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: UsageReasonCode;
  createdAt: Date;
  updatedAt: Date;
};

// 한 시간 블록에 대해 고른 사용 이유 코드 목록을 받음(복수선택)
export type CreateUsageReasonPayload = {
  userId: string;
  monitoredAppId: string;
  usageLogId?: string;
  date: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  reasonCodes: string[];
};

export type NewUsageReason = {
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: UsageReasonCode;
};

export type UsageReasonRecord = {
  id: string;
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: string;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: UsageReasonCode;
  createdAt: Date;
  updatedAt: Date;
};

export type UsageReasonCalendarDay = {
  date: string;
  hasReason: boolean;
};

const HOUR_MS = 60 * 60 * 1000;
const HOURS_IN_A_DAY = 24;
const KST_OFFSET_HOURS = 9;

const REASON_INPUT_START_HOUR_KST = 22;
const REASON_INPUT_END_HOUR_KST = 10;

function kstDateTime(dateOnly: Date, hourInKst: number): Date {
  const hoursFromUtcMidnight = hourInKst - KST_OFFSET_HOURS;

  return new Date(dateOnly.getTime() + hoursFromUtcMidnight * HOUR_MS);
}

function nextDay(dateOnly: Date): Date {
  return new Date(dateOnly.getTime() + HOURS_IN_A_DAY * HOUR_MS);
}

export function isWithinReasonWindow(dateOnly: Date, now: Date): boolean {
  const windowStart = kstDateTime(dateOnly, REASON_INPUT_START_HOUR_KST);
  const windowEnd = kstDateTime(nextDay(dateOnly), REASON_INPUT_END_HOUR_KST);

  return now.getTime() >= windowStart.getTime() && now.getTime() <= windowEnd.getTime();
}

function parseTime(value: string, fieldName: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError(`${fieldName} must be a valid ISO date string`, 'VALIDATION_ERROR');
  }

  return parsed;
}

function validateReasonCodes(codes: string[]): UsageReasonCode[] {
  if (codes.length === 0) {
    throw new BadRequestError('reasonCodes must include at least one reason', 'VALIDATION_ERROR');
  }

  const validatedCodes: UsageReasonCode[] = [];

  for (const code of codes) {
    if (!USAGE_REASON_CODES.includes(code as UsageReasonCode)) {
      throw new BadRequestError(
        `reasonCodes must be one of: ${USAGE_REASON_CODES.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }

    // 같은 코드를 여러 번 보내도 한 번만 저장합니다.
    if (!validatedCodes.includes(code as UsageReasonCode)) {
      validatedCodes.push(code as UsageReasonCode);
    }
  }

  return validatedCodes;
}

// 한 시간 블록에 여러 사용 이유를 고를 수 있으므로, 고른 코드마다 저장용 엔티티를 하나씩 만듭니다.
export function createUsageReasonEntities(payload: CreateUsageReasonPayload): NewUsageReason[] {
  const timeRangeStart = parseTime(payload.timeRangeStart, 'timeRangeStart');

  const timeRangeEnd = parseTime(payload.timeRangeEnd, 'timeRangeEnd');

  if (timeRangeEnd.getTime() <= timeRangeStart.getTime()) {
    throw new BadRequestError('timeRangeEnd must be after timeRangeStart', 'VALIDATION_ERROR');
  }

  const reasonCodes = validateReasonCodes(payload.reasonCodes);
  const date = getKstDateOnly(payload.date);

  return reasonCodes.map((reason) => ({
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    usageLogId: payload.usageLogId ?? null,
    date,
    timeRangeStart,
    timeRangeEnd,
    reason
  }));
}

export function buildUsageReasonCalendar(
  month: string,
  usageReasons: { date: Date }[]
): UsageReasonCalendarDay[] {
  const { start, end } = parseMonthRange(month);
  const reasonDates = new Set(usageReasons.map((reason) => formatDateOnly(reason.date)));
  const calendar: UsageReasonCalendarDay[] = [];

  for (
    let current = new Date(start.getTime());
    current.getTime() <= end.getTime();
    current.setUTCDate(current.getUTCDate() + 1)
  ) {
    const date = formatDateOnly(current);
    calendar.push({
      date,
      hasReason: reasonDates.has(date)
    });
  }

  return calendar;
}
