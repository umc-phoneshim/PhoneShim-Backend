import prisma from '../../../shared/database/prismaClient';

export async function sumUsedMinutes(userId: string, date: Date): Promise<number> {
  const result = await prisma.usageLog.aggregate({
    where: { userId, date },
    _sum: { usedMinutes: true }
  });

  return result._sum.usedMinutes ?? 0;
}

export async function findTotalTargetMinutes(userId: string): Promise<number | null> {
  const totalGoal = await prisma.totalGoal.findUnique({
    where: { userId },
    select: { targetMinutes: true }
  });

  return totalGoal?.targetMinutes ?? null;
}
