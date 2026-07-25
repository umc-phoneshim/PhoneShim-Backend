import { Prisma } from '@prisma/client';

import prisma from '../../../shared/database/prismaClient';

import type { TotalGoal, NewTotalGoal, ValidatedTotalGoalUpdate } from '../domain/totalGoalEntity';

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
export const RECORD_NOT_FOUND_ERROR = 'P2025';

type PrismaTotalGoal = Awaited<ReturnType<typeof prisma.totalGoal.findFirst>>;

function toEntity(totalGoal: NonNullable<PrismaTotalGoal>): TotalGoal {
  return totalGoal;
}

export async function findByUserId(userId: string) {
  const totalGoal = await prisma.totalGoal.findUnique({
    where: { userId }
  });

  return totalGoal ? toEntity(totalGoal) : null;
}

export async function save(totalGoal: NewTotalGoal) {
  const created = await prisma.totalGoal.create({
    data: totalGoal
  });

  return toEntity(created);
}

export async function updateByUserId(userId: string, payload: ValidatedTotalGoalUpdate) {
  const updated = await prisma.totalGoal.update({
    where: { userId },
    data: payload
  });

  return toEntity(updated);
}

export function isPrismaKnownError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
