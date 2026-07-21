import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { updateUserGenderAgeRequestSchema } from './userDto';
import * as userController from './userController';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getUser);
router.patch(
  '/me',
  validateRequestBody(updateUserGenderAgeRequestSchema),
  userController.updateUserGenderAge
);

export default router;
