import { Router } from 'express';

import authMiddleware from '../../../shared/middlewares/authMiddleware';

import * as alertSettingController from './alertSettingController';

const router = Router();

router.use(authMiddleware);

router.post('/', alertSettingController.createAlertSetting);
router.get('/', alertSettingController.getAlertSetting);
router.get('/:id', alertSettingController.getAlertSettingById);
router.patch('/:id', alertSettingController.updateAlertSetting);
router.delete('/:id', alertSettingController.deleteAlertSetting);

export default router;
