import prisma from '../../../shared/database/prismaClient';

import type { NewAppGoal, UpdateAppGoalPayload } from '../domain/appGoalEntity';

export async function save(appGoal: NewAppGoal) {
  return prisma.appGoal.create({
    data: appGoal
  });
}

export async function findByMonitoredAppId(monitoredAppId: string) {
  return prisma.appGoal.findUnique({
    where: { monitoredAppId }
  });
}

export async function findById(id: string) {
  return prisma.appGoal.findUnique({
    where: { id }
  });
}

export async function update(id: string, payload: UpdateAppGoalPayload) {
  return prisma.appGoal.update({
    where: { id },
    data: payload
  });
}

export async function deleteById(id: string) {
  await prisma.appGoal.delete({
    where: { id }
  });
}
