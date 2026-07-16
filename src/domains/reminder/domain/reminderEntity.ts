import { RestrictMode } from '@prisma/client';

import { BadRequestError } from '../../../shared/errors/appError';

export type Reminder = {
  id: string;
  userId: string;
  date: Date;
  title: string;
  startTime: Date;
  endTime: Date;
  restrictMode: RestrictMode;
  restrictedAppIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReminderPayload = {
  userId: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  restrictMode?: string;
  restrictedAppIds?: string[];
};

export type UpdateReminderPayload = {
  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  restrictMode?: string;
  restrictedAppIds?: string[];
};

export type NewReminder = {
  userId: string;
  date: Date;
  title: string;
  startTime: Date;
  endTime: Date;
  restrictMode: RestrictMode;
  restrictedAppIds: string[];
};

export type ValidatedReminderUpdate = {
  date?: Date;
  title?: string;
  startTime?: Date;
  endTime?: Date;
  restrictMode?: RestrictMode;
  restrictedAppIds?: string[];
};

const VALID_RESTRICT_MODES = new Set<string>(Object.values(RestrictMode));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const MIN_REMINDER_DURATION_MS = 60 * 1000;
const MAX_TITLE_LENGTH = 20;
const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const normalizeRequiredString = (value: string, fieldName: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestError(`${fieldName} is required`, 'VALIDATION_ERROR');
  }

  return normalized;
};

const normalizeReminderTitle = (value: string): string => {
  if (value.length > MAX_TITLE_LENGTH) {
    throw new BadRequestError(
      'title must be 20 characters or fewer',
      'VALIDATION_ERROR'
    );
  }

  return normalizeRequiredString(value, 'title');
};

export const parseDateOnly = (value: string): Date => {
  if (!DATE_PATTERN.test(value)) {
    throw new BadRequestError('date must be YYYY-MM-DD', 'VALIDATION_ERROR');
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestError('date must be a valid calendar date', 'VALIDATION_ERROR');
  }

  return date;
};

export const toKstDateString = (date: Date): string => {
  return KST_DATE_FORMATTER.format(date);
};

const parseIsoDateTime = (value: string, fieldName: string): Date => {
  if (!ISO_DATE_TIME_PATTERN.test(value)) {
    throw new BadRequestError(`${fieldName} must be an ISO datetime with timezone`, 'VALIDATION_ERROR');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`${fieldName} must be a valid ISO string`, 'VALIDATION_ERROR');
  }

  return date;
};

const normalizeRestrictMode = (value: string | undefined): RestrictMode => {
  if (value === undefined) {
    return RestrictMode.NONE;
  }

  if (!VALID_RESTRICT_MODES.has(value)) {
    throw new BadRequestError('Invalid restrictMode', 'INVALID_RESTRICT_MODE');
  }

  return value as RestrictMode;
};

const normalizeRestrictedAppIds = (value: string[] | undefined): string[] => {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.some((appId) => typeof appId !== 'string' || !appId.trim())) {
    throw new BadRequestError('Invalid restrictedAppIds', 'INVALID_RESTRICTED_APP_IDS');
  }

  return [...new Set(value.map((appId) => appId.trim()))];
};

export const ensureValidTimeRange = (startTime: Date, endTime: Date) => {
  if (endTime.getTime() - startTime.getTime() < MIN_REMINDER_DURATION_MS) {
    throw new BadRequestError('Invalid reminder time range', 'INVALID_TIME_RANGE');
  }
};

export const ensureTimesMatchDate = (date: Date, startTime: Date, endTime: Date) => {
  const expectedDate = date.toISOString().slice(0, 10);
  const startDate = toKstDateString(startTime);
  const endDate = toKstDateString(endTime);

  if (startDate !== expectedDate || endDate !== expectedDate) {
    throw new BadRequestError('startTime and endTime must match date', 'INVALID_TIME_RANGE');
  }
};

export const ensureRestrictedAppsMatchMode = (
  restrictMode: RestrictMode,
  restrictedAppIds: string[]
) => {
  if (restrictMode === RestrictMode.SPECIFIC_APP && restrictedAppIds.length === 0) {
    throw new BadRequestError('SPECIFIC_APP requires restrictedAppIds', 'INVALID_RESTRICTED_APP_IDS');
  }
};

export function createReminderEntity(payload: CreateReminderPayload): NewReminder {
  const date = parseDateOnly(payload.date);
  const startTime = parseIsoDateTime(payload.startTime, 'startTime');
  const endTime = parseIsoDateTime(payload.endTime, 'endTime');
  const restrictMode = normalizeRestrictMode(payload.restrictMode);
  const restrictedAppIds = normalizeRestrictedAppIds(payload.restrictedAppIds);

  ensureValidTimeRange(startTime, endTime);
  ensureTimesMatchDate(date, startTime, endTime);
  ensureRestrictedAppsMatchMode(restrictMode, restrictedAppIds);

  return {
    userId: normalizeRequiredString(payload.userId, 'userId'),
    date,
    title: normalizeReminderTitle(payload.title),
    startTime,
    endTime,
    restrictMode,
    restrictedAppIds: restrictMode === RestrictMode.SPECIFIC_APP ? restrictedAppIds : []
  };
}

export function createReminderUpdate(payload: UpdateReminderPayload): ValidatedReminderUpdate {
  const update: ValidatedReminderUpdate = {};

  if (payload.date !== undefined) {
    update.date = parseDateOnly(payload.date);
  }

  if (payload.title !== undefined) {
    update.title = normalizeReminderTitle(payload.title);
  }

  if (payload.startTime !== undefined) {
    update.startTime = parseIsoDateTime(payload.startTime, 'startTime');
  }

  if (payload.endTime !== undefined) {
    update.endTime = parseIsoDateTime(payload.endTime, 'endTime');
  }

  if (payload.restrictMode !== undefined) {
    update.restrictMode = normalizeRestrictMode(payload.restrictMode);
  }

  if (payload.restrictedAppIds !== undefined) {
    update.restrictedAppIds = normalizeRestrictedAppIds(payload.restrictedAppIds);
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestError('At least one field is required', 'VALIDATION_ERROR');
  }

  return update;
}
