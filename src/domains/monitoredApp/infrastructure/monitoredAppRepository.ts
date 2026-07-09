import { Prisma } from '@prisma/client';

import prisma from '../../../shared/database/prismaClient';

import type {
  MonitoredApp,
  NewMonitoredApp,
  ValidatedMonitoredAppUpdate
} from '../domain/monitoredAppEntity';

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
export const RECORD_NOT_FOUND_ERROR = 'P2025';
export const TRANSACTION_CONFLICT_ERROR = 'P2034';

type PrismaMonitoredApp = Awaited<ReturnType<typeof prisma.monitoredApp.findFirst>>;

function toEntity(monitoredApp: NonNullable<PrismaMonitoredApp>): MonitoredApp {
  return monitoredApp;
}

export async function findAllByUserId(userId: string) {
  const monitoredApps = await prisma.monitoredApp.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  });

  return monitoredApps.map(toEntity);
}

export async function findByIdAndUserId(id: string, userId: string) {
  const monitoredApp = await prisma.monitoredApp.findFirst({
    where: { id, userId }
  });

  return monitoredApp ? toEntity(monitoredApp) : null;
}

export async function findByPackageNameAndUserId(packageName: string, userId: string) {
  const monitoredApp = await prisma.monitoredApp.findUnique({
    where: {
      userId_packageName: {
        userId,
        packageName
      }
    }
  });

  return monitoredApp ? toEntity(monitoredApp) : null;
}

export async function saveWithinUserLimit(monitoredApp: NewMonitoredApp, maxCount: number) {
  const created = await prisma.$transaction(
    async (tx) => {
      const currentCount = await tx.monitoredApp.count({
        where: { userId: monitoredApp.userId }
      });

      if (currentCount >= maxCount) {
        return null;
      }

      return tx.monitoredApp.create({
        data: {
          userId: monitoredApp.userId,
          packageName: monitoredApp.packageName,
          appName: monitoredApp.appName,
          appIcon: monitoredApp.appIcon,
          sortOrder: monitoredApp.sortOrder ?? currentCount
        }
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );

  return created ? toEntity(created) : null;
}

export async function update(
  id: string,
  userId: string,
  payload: ValidatedMonitoredAppUpdate
) {
  const updated = await prisma.monitoredApp.update({
    where: {
      id,
      userId
    },
    data: payload
  });

  return toEntity(updated);
}

export async function deleteByIdAndUserId(id: string, userId: string) {
  await prisma.monitoredApp.delete({
    where: {
      id,
      userId
    }
  });
}

export function isPrismaKnownError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
