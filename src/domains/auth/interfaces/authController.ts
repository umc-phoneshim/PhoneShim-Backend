// src/domains/auth/interfaces/authController.ts
import { Router, type Request, type Response } from 'express';
import asyncHandler from '../../../shared/utils/asyncHandler';
import { BadRequestError } from '../../../shared/errors/appError';
import { socialLogin } from '../application/socialLoginService';

const router = Router();

function validateAccessToken(req: Request): string {
  const { accessToken } = req.body;

  if (!accessToken || typeof accessToken !== 'string') {
    throw new BadRequestError('accessToken이 필요합니다.', 'ACCESS_TOKEN_REQUIRED');
  }

  return accessToken;
}

router.post(
  '/kakao',
  asyncHandler(async (req: Request, res: Response) => {
    const accessToken = validateAccessToken(req);
    const result = await socialLogin('KAKAO', accessToken);
    res.status(200).json({ success: true, data: result });
  })
);

router.post(
  '/google',
  asyncHandler(async (req: Request, res: Response) => {
    const accessToken = validateAccessToken(req);
    const result = await socialLogin('GOOGLE', accessToken);
    res.status(200).json({ success: true, data: result });
  })
);

export default router;