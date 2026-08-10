import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { updateUserGenderAgeRequestSchema, updateUserNameMotivRequestSchema } from './userDto';
import * as userController from './userController';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getUser);
router.patch(
  '/me/onboarding',
  validateRequestBody(updateUserGenderAgeRequestSchema),
  userController.updateUserGenderAge
);
router.patch(
  '/me',
  validateRequestBody(updateUserNameMotivRequestSchema),
  userController.updateUserNameMotiv
);

export default router;
