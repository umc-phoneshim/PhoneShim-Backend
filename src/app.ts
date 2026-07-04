import express from 'express';

import alertSettingRouter from './domains/alertSetting/interfaces/alertSettingRouter';
import appGoalRouter from './domains/appGoal/interfaces/appGoalRouter';
import groupRouter from './domains/group/interfaces/groupRouter';
import monitoredAppRouter from './domains/monitoredApp/interfaces/monitoredAppRouter';
import reminderRouter from './domains/reminder/interfaces/reminderRouter';
import timerRouter from './domains/timer/interfaces/timerRouter';
import totalGoalRouter from './domains/totalGoal/interfaces/totalGoalRouter';
import errorHandler from './shared/middlewares/errorHandler';
import notFoundHandler from './shared/middlewares/notFoundHandler';

const app = express();

app.use(express.json());

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
app.use('/api/monitored-apps', monitoredAppRouter);
app.use('/api/total-goals', totalGoalRouter);
app.use('/api/app-goals', appGoalRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/alert-settings', alertSettingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;