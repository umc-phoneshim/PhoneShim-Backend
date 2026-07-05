import { Router } from 'express';

import authMiddleware from '../../../shared/middlewares/authMiddleware';

import * as totalGoalController from './totalGoalController';

const router = Router();

router.use(authMiddleware);

router.post('/', totalGoalController.createTotalGoal);
router.get('/', totalGoalController.getTotalGoal);
router.get('/:id', totalGoalController.getTotalGoalById);
router.patch('/:id', totalGoalController.updateTotalGoal);
router.delete('/:id', totalGoalController.deleteTotalGoal);

export default router;
