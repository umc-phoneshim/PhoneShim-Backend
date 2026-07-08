// src/domains/auth/interfaces/authController.ts
import { Router, type Request, type Response } from 'express';
import asyncHandler from '../../../shared/utils/asyncHandler';
import { socialLogin } from '../application/socialLoginService';

const router = Router();

router.post(
  '/kakao',
  asyncHandler(async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    const result = await socialLogin('KAKAO', accessToken);
    res.status(200).json({ success: true, data: result });
  })
);

router.post(
  '/google',
  asyncHandler(async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    const result = await socialLogin('GOOGLE', accessToken);
    res.status(200).json({ success: true, data: result });
  })
);

export default router;