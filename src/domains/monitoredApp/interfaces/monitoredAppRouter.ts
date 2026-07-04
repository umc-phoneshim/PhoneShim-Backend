import { Router } from 'express';

import * as monitoredAppController from './monitoredAppController';

const router = Router();

router.post('/', monitoredAppController.createMonitoredApp);
router.get('/', monitoredAppController.getMonitoredApps);
router.get('/:id', monitoredAppController.getMonitoredAppById);
router.patch('/:id', monitoredAppController.updateMonitoredApp);
router.delete('/:id', monitoredAppController.deleteMonitoredApp);

export default router;
