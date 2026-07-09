import { RestrictMode } from '@prisma/client';

import { AppError, BadRequestError, NotFoundError } from '../../../shared/errors/appError';
import {
  createReminderEntity,
  createReminderUpdate,
  ensureRestrictedAppsMatchMode,
  ensureValidTimeRange,
  parseDateOnly,
  type CreateReminderPayload,
  type Reminder,
  type UpdateReminderPayload,
  type ValidatedReminderUpdate
} from '../domain/reminderEntity';
import * as reminderRepository from '../infrastructure/reminderRepository';

const reminderNotFound = () => new NotFoundError('Reminder was not found', 'REMINDER_NOT_FOUND');
const reminderTimeOverlap = () =>
  new AppError(409, 'REMINDER_TIME_OVERLAP', 'Reminder time range overlaps');

const ensureUserId = (userId: string) => {
  if (!userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }
};

const toKstDateString = (date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return formatter.format(date);
};

const ensureRestrictedAppOwnership = async (userId: string, restrictedAppIds: string[]) => {
  const ownedCount = await reminderRepository.countOwnedMonitoredApps(userId, restrictedAppIds);

  if (ownedCount !== restrictedAppIds.length) {
    throw new BadRequestError('Invalid restrictedAppIds', 'INVALID_RESTRICTED_APP_IDS');
  }
};

const ensureNoOverlap = async (
  userId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  exceptId?: string
) => {
  const hasOverlap = await reminderRepository.existsOverlappingReminder(
    userId,
    date,
    startTime,
    endTime,
    exceptId
  );

  if (hasOverlap) {
    throw reminderTimeOverlap();
  }
};

const resolveUpdate = (
  current: Reminder,
  update: ValidatedReminderUpdate
): Required<Pick<ValidatedReminderUpdate, 'date' | 'startTime' | 'endTime' | 'restrictMode' | 'restrictedAppIds'>> => {
  const restrictMode = update.restrictMode ?? current.restrictMode;
  const restrictedAppIds =
    restrictMode === RestrictMode.SPECIFIC_APP
      ? update.restrictedAppIds ?? current.restrictedAppIds
      : [];

  return {
    date: update.date ?? current.date,
    startTime: update.startTime ?? current.startTime,
    endTime: update.endTime ?? current.endTime,
    restrictMode,
    restrictedAppIds
  };
};

export async function createReminder(payload: CreateReminderPayload) {
  const reminder = createReminderEntity(payload);

  await ensureRestrictedAppOwnership(reminder.userId, reminder.restrictedAppIds);
  await ensureNoOverlap(reminder.userId, reminder.date, reminder.startTime, reminder.endTime);

  return reminderRepository.save(reminder);
}

export async function getReminders(userId: string, date?: string) {
  ensureUserId(userId);

  return reminderRepository.findAllByUserIdAndDate(userId, parseDateOnly(date ?? toKstDateString()));
}

export async function getReminderById(id: string, userId: string) {
  ensureUserId(userId);

  const reminder = await reminderRepository.findByIdAndUserId(id, userId);

  if (!reminder) {
    throw reminderNotFound();
  }

  return reminder;
}

export async function updateReminder(id: string, userId: string, payload: UpdateReminderPayload) {
  const current = await getReminderById(id, userId);
  const update = createReminderUpdate(payload);
  const resolved = resolveUpdate(current, update);

  ensureValidTimeRange(resolved.startTime, resolved.endTime);
  ensureRestrictedAppsMatchMode(resolved.restrictMode, resolved.restrictedAppIds);
  await ensureRestrictedAppOwnership(userId, resolved.restrictedAppIds);
  await ensureNoOverlap(userId, resolved.date, resolved.startTime, resolved.endTime, id);

  try {
    return await reminderRepository.update(id, userId, {
      ...update,
      restrictedAppIds: resolved.restrictedAppIds
    });
  } catch (error) {
    if (reminderRepository.isPrismaKnownError(error, reminderRepository.RECORD_NOT_FOUND_ERROR)) {
      throw reminderNotFound();
    }

    throw error;
  }
}

export async function deleteReminder(id: string, userId: string) {
  await getReminderById(id, userId);

  try {
    await reminderRepository.deleteByIdAndUserId(id, userId);
  } catch (error) {
    if (reminderRepository.isPrismaKnownError(error, reminderRepository.RECORD_NOT_FOUND_ERROR)) {
      throw reminderNotFound();
    }

    throw error;
  }
}
