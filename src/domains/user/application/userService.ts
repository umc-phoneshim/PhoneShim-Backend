import { BadRequestError, NotFoundError } from '../../../shared/errors/appError';
import * as userRepository from '../infrastructure/userRepository';
import type { UpdateUserGenderAgeRequest } from '../interfaces/userDto';

export async function getUserByUserId(userId: string) {
  if (!userId) {
    throw new BadRequestError('userId는 필수입니다.');
  }

  const user = await userRepository.getUserByUserId(userId);

  if (!user) {
    throw new NotFoundError('해당 유저를 찾을 수 없습니다.', 'USER_NOT_FOUND');
  }

  return user;
}

export async function updateUserGenderAge(userId: string, payload: UpdateUserGenderAgeRequest) {
  if (!userId) {
    throw new BadRequestError('userId는 필수입니다.');
  }

  const user = await userRepository.getUserByUserId(userId);

  if (!user) {
    throw new NotFoundError('해당 유저를 찾을 수 없습니다.', 'USER_NOT_FOUND');
  }

  const updatedUser = await userRepository.updateUserGenderAge(userId, payload);

  return updatedUser;
}
