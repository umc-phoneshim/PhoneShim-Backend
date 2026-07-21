import express from 'express';
import swaggerUi from 'swagger-ui-express';

import alertSettingRouter from './domains/alertSetting/interfaces/alertSettingRouter';
import authRouter from './domains/auth/interfaces/authController';
import dashboardRouter from './domains/dashboard/interfaces/dashboardRouter';
import groupRouter from './domains/group/interfaces/groupRouter';
import appGoalRouter from './domains/appGoal/interfaces/appGoalRouter';
import monitoredAppRouter from './domains/monitoredApp/interfaces/monitoredAppRouter';
import reminderRouter from './domains/reminder/interfaces/reminderRouter';
import timerRouter from './domains/timer/interfaces/timerRouter';
import userRouter from './domains/user/interfaces/userRouter';
import usageLogRouter from './domains/usageLog/interfaces/usageLogRouter';
import usageReasonRouter from './domains/usageReason/interfaces/usageReasonRouter';
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

app.use('/api/auth', authRouter);
app.use('/api/timers', timerRouter);
app.use('/api/groups', groupRouter);
app.use('/api/users', userRouter);
app.use('/api/monitored-apps', monitoredAppRouter);
app.use('/api/app-goals', appGoalRouter);
app.use('/api/usage-logs', usageLogRouter);
app.use('/api/usage-reasons', usageReasonRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/alert-settings', alertSettingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;