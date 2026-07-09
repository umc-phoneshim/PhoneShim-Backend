import { BadRequestError, NotFoundError } from '../../../shared/errors/appError';

import * as userRepository from '../infrastructure/userRepository';

export async function getUserByUserId(userId: string) {
  if (!userId) {
    throw new BadRequestError('userId는 필수입니다.');
  }

  const user = await userRepository.getUserByUserId(userId);

  if (!user) {
    throw new NotFoundError('USER_NOT_FOUND', '해당 유저를 찾을 수 없습니다.');
  }

  return user;
}
