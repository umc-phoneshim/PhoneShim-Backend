import { Router } from 'express';

import authMiddleware from '../../../shared/middlewares/authMiddleware';

import * as monitoredAppController from './monitoredAppController';

const router = Router();

router.use(authMiddleware);

router.post('/', monitoredAppController.createMonitoredApp);
router.get('/', monitoredAppController.getMonitoredApps);
router.get('/:id', monitoredAppController.getMonitoredAppById);
router.patch('/:id', monitoredAppController.updateMonitoredApp);
router.delete('/:id', monitoredAppController.deleteMonitoredApp);

export default router;
