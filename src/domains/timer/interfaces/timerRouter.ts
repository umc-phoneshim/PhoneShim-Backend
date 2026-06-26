import { Router } from 'express';

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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user-id"
 *     responses:
 *       201:
 *         description: Timer started.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/start', timerController.startTimer);

/**
 * @openapi
 * /api/timers/stop:
 *   post:
 *     summary: Stop a study timer
 *     tags:
 *       - Timers
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timerId:
 *                 type: string
 *                 example: "timer-id"
 *     responses:
 *       200:
 *         description: Timer stopped.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/stop', timerController.stopTimer);

export default router;
