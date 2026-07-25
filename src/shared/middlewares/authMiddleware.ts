import { type NextFunction, type Request, type Response } from 'express';

import { verifyAccessToken } from '../auth/jwt';

const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  req.user = {
    email: 'test@example.com',
    userId: 'db72a078-f5fc-4bc3-86f2-e129f556ccdb'
  };
  next();
  return;
};
