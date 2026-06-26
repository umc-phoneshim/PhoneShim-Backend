import { Router } from 'express';

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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Morning study group"
 *     responses:
 *       201:
 *         description: Study group created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/', groupController.createGroup);

export default router;
