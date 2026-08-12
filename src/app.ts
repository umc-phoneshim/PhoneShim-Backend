import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import alertSettingRouter from './domains/alertSetting/interfaces/alertSettingRouter';
import authRouter from './domains/auth/interfaces/authController';
import dashboardRouter from './domains/dashboard/interfaces/dashboardRouter';
import deviceUsageRouter from './domains/deviceUsage/interfaces/deviceUsageRouter';
import appGoalRouter from './domains/appGoal/interfaces/appGoalRouter';
import monitoredAppRouter from './domains/monitoredApp/interfaces/monitoredAppRouter';
import totalGoalRouter from './domains/totalGoal/interfaces/totalGoalRouter';
import reminderRouter from './domains/reminder/interfaces/reminderRouter';
import userRouter from './domains/user/interfaces/userRouter';
import usageLogRouter from './domains/usageLog/interfaces/usageLogRouter';
import usageReasonRouter from './domains/usageReason/interfaces/usageReasonRouter';
import reportRouter from './domains/report/interfaces/reportRouter';
import usageSessionRouter from './domains/usageSession/interfaces/usageSessionRouter';
import errorHandler from './shared/middlewares/errorHandler';
import notFoundHandler from './shared/middlewares/notFoundHandler';
import { corsOptions } from './shared/config/cors';
import { swaggerSpec } from './shared/swagger/swaggerConfig';

const app = express();

app.use(cors(corsOptions));
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
app.use('/api/users', userRouter);
app.use('/api/monitored-apps', monitoredAppRouter);
app.use('/api/app-goals', appGoalRouter);
app.use('/api/total-goals', totalGoalRouter);
app.use('/api/usage-logs', usageLogRouter);
app.use('/api/usage-reasons', usageReasonRouter);
app.use('/api/usage-sessions', usageSessionRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/device-usage', deviceUsageRouter);
app.use('/api/alert-settings', alertSettingRouter);
app.use('/api/reports', reportRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
