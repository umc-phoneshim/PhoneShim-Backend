import { Prisma } from '@prisma/client';

import prisma from '../../../shared/database/prismaClient';

import type { AppGoal, NewAppGoal, ValidatedAppGoalUpdate } from '../domain/appGoalEntity';

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
export const RECORD_NOT_FOUND_ERROR = 'P2025';

type PrismaAppGoal = Awaited<ReturnType<typeof prisma.appGoal.findFirst>>;

function toEntity(appGoal: NonNullable<PrismaAppGoal>): AppGoal {
  return appGoal;
}

export async function findByMonitoredAppId(monitoredAppId: string) {
  const appGoal = await prisma.appGoal.findUnique({
    where: { monitoredAppId }
  });

  return appGoal ? toEntity(appGoal) : null;
}

export async function findAllByMonitoredAppIds(monitoredAppIds: string[]) {
  if (monitoredAppIds.length === 0) {
    return [];
  }

  const appGoals = await prisma.appGoal.findMany({
    where: { monitoredAppId: { in: monitoredAppIds } }
  });

  return appGoals.map(toEntity);
}

export async function save(appGoal: NewAppGoal) {
  const created = await prisma.appGoal.create({
    data: appGoal
  });

  return toEntity(created);
}

export async function update(monitoredAppId: string, payload: ValidatedAppGoalUpdate) {
  const updated = await prisma.appGoal.update({
    where: { monitoredAppId },
    data: payload
  });

  return toEntity(updated);
}

export async function deleteByMonitoredAppId(monitoredAppId: string) {
  await prisma.appGoal.delete({
    where: { monitoredAppId }
  });
}

export function isPrismaKnownError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
