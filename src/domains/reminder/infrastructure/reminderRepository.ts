import prisma from '../../../shared/database/prismaClient';

import type { NewReminder, Reminder, ValidatedReminderUpdate } from '../domain/reminderEntity';

type ReminderWithRestrictedApps = {
  id: string;
  userId: string;
  date: Date;
  title: string;
  startTime: Date;
  endTime: Date;
  restrictMode: Reminder['restrictMode'];
  createdAt: Date;
  updatedAt: Date;
  reminderRestrictedApps: { monitoredAppId: string }[];
};

function toEntity(reminder: ReminderWithRestrictedApps): Reminder {
  const { reminderRestrictedApps, ...rest } = reminder;

  return {
    ...rest,
    restrictedAppIds: reminderRestrictedApps.map((entry) => entry.monitoredAppId)
  };
}

export async function save(reminder: NewReminder) {
  const { restrictedAppIds, ...reminderData } = reminder;

  const created = await prisma.reminder.create({
    data: {
      ...reminderData,
      reminderRestrictedApps: {
        create: restrictedAppIds.map((monitoredAppId) => ({ monitoredAppId }))
      }
    },
    include: { reminderRestrictedApps: true }
  });

  return toEntity(created);
}

export async function findAllByUserId(userId: string) {
  const reminders = await prisma.reminder.findMany({
    where: { userId },
    include: { reminderRestrictedApps: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return reminders.map(toEntity);
}

export async function findById(id: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id },
    include: { reminderRestrictedApps: true }
  });

  return reminder ? toEntity(reminder) : null;
}

export async function update(id: string, payload: ValidatedReminderUpdate) {
  const { restrictedAppIds, ...reminderData } = payload;

  const updated = await prisma.$transaction(async (tx) => {
    if (restrictedAppIds !== undefined) {
      await tx.reminderRestrictedApp.deleteMany({ where: { reminderId: id } });
    }

    return tx.reminder.update({
      where: { id },
      data: {
        ...reminderData,
        ...(restrictedAppIds !== undefined && {
          reminderRestrictedApps: {
            create: restrictedAppIds.map((monitoredAppId) => ({ monitoredAppId }))
          }
        })
      },
      include: { reminderRestrictedApps: true }
    });
  });

  return toEntity(updated);
}

export async function deleteById(id: string) {
  await prisma.reminder.delete({
    where: { id }
  });
}
