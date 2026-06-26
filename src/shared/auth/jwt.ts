import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn']
  };

  return jwt.sign(payload, env.jwt.accessSecret, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, env.jwt.accessSecret);

  if (typeof payload === 'string') {
    throw new Error('Invalid access token payload');
  }

  return {
    userId: String(payload.userId),
    email: String(payload.email)
  };
};
