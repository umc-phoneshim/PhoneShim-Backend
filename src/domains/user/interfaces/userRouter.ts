import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';

import * as userController from './userController';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getUser);

export default router;
