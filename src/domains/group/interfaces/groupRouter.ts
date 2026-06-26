import { Router } from 'express';

import * as groupController from './groupController';

const router = Router();

router.get('/', groupController.listGroups);
router.post('/', groupController.createGroup);

export default router;
