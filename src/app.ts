import express from 'express';
import swaggerUi from 'swagger-ui-express';

import groupRouter from './domains/group/interfaces/groupRouter';
import timerRouter from './domains/timer/interfaces/timerRouter';
import errorHandler from './shared/middlewares/errorHandler';
import notFoundHandler from './shared/middlewares/notFoundHandler';
import { swaggerSpec } from './shared/swagger/swaggerConfig';

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok'
    }
  });
});

app.use('/api/timers', timerRouter);
app.use('/api/groups', groupRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
