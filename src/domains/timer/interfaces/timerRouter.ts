import { Router } from 'express';

import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { startTimerRequestSchema, stopTimerRequestSchema } from './timerDto';
import * as timerController from './timerController';

const router = Router();

/**
 * @openapi
 * /api/timers/start:
 *   post:
 *     summary: Start a study timer
 *     tags:
 *       - Timers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user-id"
 *             required:
 *               - userId
 *     responses:
 *       201:
 *         description: Timer started.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/start', validateRequestBody(startTimerRequestSchema), timerController.startTimer);

/**
 * @openapi
 * /api/timers/stop:
 *   post:
 *     summary: Stop a study timer
 *     tags:
 *       - Timers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timerId:
 *                 type: string
 *                 example: "timer-id"
 *             required:
 *               - timerId
 *     responses:
 *       200:
 *         description: Timer stopped.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/stop', validateRequestBody(stopTimerRequestSchema), timerController.stopTimer);

export default router;
