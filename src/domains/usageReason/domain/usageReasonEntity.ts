import { BadRequestError } from '../../../shared/errors/appError';

import { getKstDateOnly } from '../../usageLog/domain/usageLogEntity';

export type UsageReason = {
  id: string;
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUsageReasonPayload = {
  userId: string;
  monitoredAppId: string;
  usageLogId?: string;
  date: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  reason: string;
};

export type NewUsageReason = {
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: Date;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: string;
};

export type UsageReasonRecord = {
  id: string;
  userId: string;
  monitoredAppId: string;
  usageLogId: string | null;
  date: string;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

const REASON_MAX_LENGTH = 100;

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

function validateReason(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new BadRequestError('reason is required', 'VALIDATION_ERROR');
  }

  if (trimmed.length > REASON_MAX_LENGTH) {
    throw new BadRequestError(
      `reason must be ${REASON_MAX_LENGTH} characters or fewer`,
      'VALIDATION_ERROR'
    );
  }

  return trimmed;
}

export function createUsageReasonEntity(payload: CreateUsageReasonPayload): NewUsageReason {
  const timeRangeStart = parseTime(payload.timeRangeStart, 'timeRangeStart');

  const timeRangeEnd = parseTime(payload.timeRangeEnd, 'timeRangeEnd');

  if (timeRangeEnd.getTime() <= timeRangeStart.getTime()) {
    throw new BadRequestError('timeRangeEnd must be after timeRangeStart', 'VALIDATION_ERROR');
  }

  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    usageLogId: payload.usageLogId ?? null,
    date: getKstDateOnly(payload.date),
    timeRangeStart,
    timeRangeEnd,
    reason: validateReason(payload.reason)
  };
}
