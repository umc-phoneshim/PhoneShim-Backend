import type { NextFunction, Request, Response } from 'express';

import AppError from '../errors/AppError';

// JWT 인증 도입 전까지 x-user-id 헤더를 이용한 임시 인증.
// 추후 JWT 인증으로 교체 예정.
export default function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');

  if (!userId) {
    throw new AppError('인증 정보가 없습니다. x-user-id 헤더가 필요합니다.', 401, 'UNAUTHORIZED');
  }

  req.userId = userId;

  next();
}
