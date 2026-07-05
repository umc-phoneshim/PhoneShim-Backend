import { Router } from 'express';

import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { createGroupRequestSchema } from './groupDto';
import * as groupController from './groupController';

const router = Router();

/**
 * @openapi
 * /api/groups:
 *   get:
 *     summary: List study groups
 *     tags:
 *       - Groups
 *     responses:
 *       200:
 *         description: Study group list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/', groupController.listGroups);

/**
 * @openapi
 * /api/groups:
 *   post:
 *     summary: Create a study group
 *     tags:
 *       - Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Morning study group"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Study group created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', validateRequestBody(createGroupRequestSchema), groupController.createGroup);

export default router;
