import prisma from '../../../shared/database/prismaClient';
import type { UpdateUserGenderAgeRequest } from '../interfaces/userDto';

export async function getUserByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      profileImage: true,
      motivation: true,
      gender: true,
      ageGroup: true
    }
  });
}

export async function updateUserGenderAge(userId: string, payload: UpdateUserGenderAgeRequest) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      gender: payload.gender,
      ageGroup: payload.ageGroup
    }
  });
}
