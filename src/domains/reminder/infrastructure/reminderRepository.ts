import { Prisma } from '@prisma/client';

import prisma from '../../../shared/database/prismaClient';
import {
  isPrismaKnownError,
  PRISMA_RECORD_NOT_FOUND_ERROR
} from '../../../shared/errors/prismaError';
import type { NewReminder, Reminder, ValidatedReminderUpdate } from '../domain/reminderEntity';

export const RECORD_NOT_FOUND_ERROR = PRISMA_RECORD_NOT_FOUND_ERROR;
export { isPrismaKnownError };

type PrismaReminder = Prisma.ReminderGetPayload<{
  include: {
    reminderRestrictedApps: true;
  };
}>;

function toEntity(reminder: PrismaReminder): Reminder {
  const { reminderRestrictedApps, ...reminderFields } = reminder;

  return {
    ...reminderFields,
    restrictedAppIds: reminderRestrictedApps.map((app) => app.monitoredAppId)
  };
}

export async function countOwnedMonitoredApps(userId: string, appIds: string[]) {
  if (appIds.length === 0) {
    return 0;
  }

  return prisma.monitoredApp.count({
    where: {
      userId,
      id: {
        in: appIds
      }
    }
  });
}

export async function findAllByUserIdAndDate(userId: string, date: Date) {
  const reminders = await prisma.reminder.findMany({
    where: { userId, date },
    include: { reminderRestrictedApps: true },
    orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }, { createdAt: 'asc' }]
  });

  return reminders.map(toEntity);
}

export async function findByIdAndUserId(id: string, userId: string) {
  const reminder = await prisma.reminder.findFirst({
    where: { id, userId },
    include: { reminderRestrictedApps: true }
  });

  return reminder ? toEntity(reminder) : null;
}

export async function existsOverlappingReminder(
  userId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  exceptId?: string
) {
  const count = await prisma.reminder.count({
    where: {
      userId,
      date,
      ...(exceptId ? { id: { not: exceptId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  });

  return count > 0;
}

export async function save(reminder: NewReminder) {
  const created = await prisma.reminder.create({
    data: {
      userId: reminder.userId,
      date: reminder.date,
      title: reminder.title,
      startTime: reminder.startTime,
      endTime: reminder.endTime,
      restrictMode: reminder.restrictMode,
      reminderRestrictedApps: {
        create: reminder.restrictedAppIds.map((monitoredAppId) => ({ monitoredAppId }))
      }
    },
    include: { reminderRestrictedApps: true }
  });

  return toEntity(created);
}

export async function update(id: string, userId: string, payload: ValidatedReminderUpdate) {
  const { restrictedAppIds, ...reminderFields } = payload;

  const updated = await prisma.reminder.update({
    where: { id, userId },
    data: {
      ...reminderFields,
      ...(restrictedAppIds !== undefined
        ? {
            reminderRestrictedApps: {
              deleteMany: {},
              create: restrictedAppIds.map((monitoredAppId) => ({ monitoredAppId }))
            }
          }
        : {})
    },
    include: { reminderRestrictedApps: true }
  });

  return toEntity(updated);
}

export async function deleteByIdAndUserId(id: string, userId: string) {
  await prisma.reminder.delete({
    where: { id, userId }
  });
}
