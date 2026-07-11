import prisma from '../../../shared/database/prismaClient';

export async function getUserByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      profileImage: true,
      motivation: true
    }
  });
}
