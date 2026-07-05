import { RestrictMode } from '@prisma/client';

import AppError from '../../../shared/errors/AppError';

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
  date: string | Date;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  restrictMode?: RestrictMode;
  restrictedAppIds?: string[];
};

export type UpdateReminderPayload = {
  date?: string | Date;
  title?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  restrictMode?: RestrictMode;
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

function toDate(value: string | Date, fieldName: string, code: string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName}은 올바른 날짜/시간 형식이어야 합니다.`, 400, code);
  }

  return date;
}

function validateRestrictMode(restrictMode: RestrictMode, restrictedAppIds: string[]) {
  if (!Object.values(RestrictMode).includes(restrictMode)) {
    throw new AppError('restrictMode 값이 올바르지 않습니다.', 400, 'INVALID_RESTRICT_MODE');
  }

  if (restrictMode === RestrictMode.SPECIFIC_APP && restrictedAppIds.length === 0) {
    throw new AppError(
      'restrictMode가 SPECIFIC_APP인 경우 restrictedAppIds는 최소 1개 이상이어야 합니다.',
      400,
      'INVALID_RESTRICTED_APP_IDS'
    );
  }
}

export function createReminder(payload: CreateReminderPayload): NewReminder {
  if (!payload.userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  if (!payload.title || payload.title.trim().length === 0) {
    throw new AppError('title은 필수입니다.', 400, 'INVALID_TITLE');
  }

  const date = toDate(payload.date, 'date', 'INVALID_DATE');
  const startTime = toDate(payload.startTime, 'startTime', 'INVALID_START_TIME');
  const endTime = toDate(payload.endTime, 'endTime', 'INVALID_END_TIME');

  if (startTime.getTime() >= endTime.getTime()) {
    throw new AppError('startTime은 endTime보다 이전이어야 합니다.', 400, 'INVALID_TIME_RANGE');
  }

  const restrictMode = payload.restrictMode ?? RestrictMode.NONE;
  const restrictedAppIds =
    payload.restrictMode === RestrictMode.SPECIFIC_APP ? (payload.restrictedAppIds ?? []) : [];

  validateRestrictMode(restrictMode, restrictedAppIds);

  return {
    userId: payload.userId,
    date,
    title: payload.title.trim(),
    startTime,
    endTime,
    restrictMode,
    restrictedAppIds
  };
}

export function applyReminderUpdate(
  payload: UpdateReminderPayload,
  current: Reminder
): ValidatedReminderUpdate {
  if (payload.title !== undefined && payload.title.trim().length === 0) {
    throw new AppError('title은 빈 값일 수 없습니다.', 400, 'INVALID_TITLE');
  }

  const date =
    payload.date !== undefined ? toDate(payload.date, 'date', 'INVALID_DATE') : undefined;
  const startTime =
    payload.startTime !== undefined
      ? toDate(payload.startTime, 'startTime', 'INVALID_START_TIME')
      : undefined;
  const endTime =
    payload.endTime !== undefined
      ? toDate(payload.endTime, 'endTime', 'INVALID_END_TIME')
      : undefined;

  const nextStartTime = startTime ?? current.startTime;
  const nextEndTime = endTime ?? current.endTime;

  if (nextStartTime.getTime() >= nextEndTime.getTime()) {
    throw new AppError('startTime은 endTime보다 이전이어야 합니다.', 400, 'INVALID_TIME_RANGE');
  }

  const restrictMode = payload.restrictMode ?? current.restrictMode;

  if (payload.restrictMode !== undefined || payload.restrictedAppIds !== undefined) {
    const restrictedAppIds =
      restrictMode === RestrictMode.SPECIFIC_APP ? (payload.restrictedAppIds ?? []) : [];
    validateRestrictMode(restrictMode, restrictedAppIds);

    return {
      ...(date !== undefined && { date }),
      ...(payload.title !== undefined && { title: payload.title.trim() }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      restrictMode,
      restrictedAppIds
    };
  }

  return {
    ...(date !== undefined && { date }),
    ...(payload.title !== undefined && { title: payload.title.trim() }),
    ...(startTime !== undefined && { startTime }),
    ...(endTime !== undefined && { endTime })
  };
}
