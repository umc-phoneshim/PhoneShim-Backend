import { Router } from 'express';

import * as appGoalController from './appGoalController';

const router = Router();

router.post('/', appGoalController.createAppGoal);
router.get('/', appGoalController.getAppGoal);
router.get('/:id', appGoalController.getAppGoalById);
router.patch('/:id', appGoalController.updateAppGoal);
router.delete('/:id', appGoalController.deleteAppGoal);

export default router;
