import prisma from '../../../shared/database/prismaClient';

import type { NewMonitoredApp, UpdateMonitoredAppPayload } from '../domain/monitoredAppEntity';

export async function save(monitoredApp: NewMonitoredApp) {
  return prisma.monitoredApp.create({
    data: monitoredApp
  });
}

export async function findAllByUserId(userId: string) {
  return prisma.monitoredApp.findMany({
    where: { userId },
    orderBy: { order: 'asc' }
  });
}

export async function findById(id: string) {
  return prisma.monitoredApp.findUnique({
    where: { id }
  });
}

export async function update(id: string, payload: UpdateMonitoredAppPayload) {
  return prisma.monitoredApp.update({
    where: { id },
    data: payload
  });
}

export async function deleteById(id: string) {
  await prisma.monitoredApp.delete({
    where: { id }
  });
}
