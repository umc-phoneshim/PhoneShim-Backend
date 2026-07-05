import type { AccessTokenPayload } from '../shared/auth/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
