import { Router } from 'express';

import * as alertSettingController from './alertSettingController';

const router = Router();

router.post('/', alertSettingController.createAlertSetting);
router.get('/', alertSettingController.getAlertSetting);
router.get('/:id', alertSettingController.getAlertSettingById);
router.patch('/:id', alertSettingController.updateAlertSetting);
router.delete('/:id', alertSettingController.deleteAlertSetting);

export default router;
