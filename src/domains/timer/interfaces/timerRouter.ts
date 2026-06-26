import { Router } from 'express';

import * as timerController from './timerController';

const router = Router();

router.post('/start', timerController.startTimer);
router.post('/stop', timerController.stopTimer);

export default router;
