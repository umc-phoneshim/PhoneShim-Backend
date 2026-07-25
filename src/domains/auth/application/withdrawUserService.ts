// src/domains/auth/application/withdrawUserService.ts
import prisma from '../../../shared/database/prismaClient';
import { NotFoundError, BadRequestError } from '../../../shared/errors/appError';

export async function withdrawUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
  }

  if (user.status === 'WITHDRAWAL_PENDING') {
    throw new BadRequestError('이미 탈퇴 처리 중인 계정입니다.', 'ALREADY_WITHDRAWAL_PENDING');
  }

  if (user.status === 'DELETED') {
    throw new BadRequestError('이미 삭제된 계정입니다.', 'USER_ALREADY_DELETED');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'WITHDRAWAL_PENDING',
      withdrawalRequestedAt: new Date(),
    },
  });

  return {
    status: updatedUser.status,
    withdrawalRequestedAt: updatedUser.withdrawalRequestedAt,
  };
}