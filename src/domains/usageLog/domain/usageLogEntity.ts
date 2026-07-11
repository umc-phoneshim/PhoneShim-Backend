import { BadRequestError } from '../../../shared/errors/appError';

export type UpsertUsageLogPayload = {
  userId: string;
  monitoredAppId: string;
  date: string;
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

function toDate(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError('date must be a valid date (YYYY-MM-DD)', 'VALIDATION_ERROR');
  }

  return date;
}

function validateCount(value: number, fieldName: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new BadRequestError(`${fieldName} must be a non-negative integer`, 'VALIDATION_ERROR');
  }

  return value;
}

export function createUsageLogEntity(payload: UpsertUsageLogPayload): NewUsageLog {
  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    date: toDate(payload.date),
    usedMinutes: validateCount(payload.usedMinutes, 'usedMinutes'),
    entryCount: validateCount(payload.entryCount, 'entryCount')
  };
}
