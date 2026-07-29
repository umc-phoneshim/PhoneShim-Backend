import { BadRequestError, NotFoundError } from '../../../shared/errors/appError';
import * as userRepository from '../infrastructure/userRepository';
import type { UpdateUserGenderAgeRequest, UpdateUserNameMotivRequest } from '../interfaces/userDto';
import { AgeGroup, Gender } from '@prisma/client';
import { createUserNameMotivUpdate } from '../domain/userEntity';

const isValidGender = (value: string): value is Gender => {
  return Object.values(Gender).includes(value as Gender);
};
const isValidAgeGroup = (value: string): value is AgeGroup => {
  return Object.values(AgeGroup).includes(value as AgeGroup);
};

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

  if (!isValidGender(payload.gender)) {
    throw new BadRequestError('유효하지 않은 gender입니다.', 'VALIDATION_ERROR');
  }

  if (!isValidAgeGroup(payload.ageGroup)) {
    throw new BadRequestError('유효하지 않은 ageGroup입니다.', 'VALIDATION_ERROR');
  }

  const updatedUser = await userRepository.updateUserGenderAge(userId, payload);

  return updatedUser;
}

export async function updateUserNameMotiv(userId: string, payload: UpdateUserNameMotivRequest) {
  if (!userId) {
    throw new BadRequestError('userId는 필수입니다.');
  }

  const user = await userRepository.getUserByUserId(userId);

  if (!user) {
    throw new NotFoundError('해당 유저를 찾을 수 없습니다.', 'USER_NOT_FOUND');
  }

  const update = createUserNameMotivUpdate(payload);
  const updatedUser = await userRepository.updateUserNameMotiv(userId, update);

  return updatedUser;
}
