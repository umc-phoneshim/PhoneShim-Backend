// src/domains/auth/interfaces/authController.ts
import { Router, type Request, type Response } from 'express';
import asyncHandler from '../../../shared/utils/asyncHandler';
import { BadRequestError } from '../../../shared/errors/appError';
import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { recoverWithdrawal } from '../application/recoverWithdrawalService';
import {
  linkAccount,
  socialLogin,
  validateProvider,
  type Provider
} from '../application/socialLoginService';
import { withdrawUser } from '../application/withdrawUserService';

const router = Router();

function validateAccessToken(req: Request): string {
  const { accessToken } = req.body;

  if (!accessToken || typeof accessToken !== 'string') {
    throw new BadRequestError('accessToken이 필요합니다.', 'ACCESS_TOKEN_REQUIRED');
  }

  return accessToken;
}

function validateIdToken(req: Request): string {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== 'string') {
    throw new BadRequestError('idToken이 필요합니다.', 'ID_TOKEN_REQUIRED');
  }

  return idToken;
}

function validateProviderToken(req: Request): { provider: Provider; token: string } {
  const provider = validateProvider(req.body.provider);
  const token = provider === 'GOOGLE' ? validateIdToken(req) : validateAccessToken(req);

  return { provider, token };
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
    const idToken = validateIdToken(req);
    const result = await socialLogin('GOOGLE', idToken);
    res.status(200).json({ success: true, data: result });
  })
);

router.delete(
  '/withdraw',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await withdrawUser(userId);
    res.status(200).json({ success: true, data: result });
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(204).send();
  })
);

router.post(
  '/link-account',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { provider, token } = validateProviderToken(req);
    const result = await linkAccount(provider, token, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  })
);

router.post(
  '/recover-withdrawal',
  asyncHandler(async (req: Request, res: Response) => {
    const { provider, token } = validateProviderToken(req);
    const result = await recoverWithdrawal(provider, token);
    res.status(200).json({ success: true, data: result });
  })
);

export default router;
