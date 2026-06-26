import express from 'express';

import groupRouter from './domains/group/interfaces/groupRouter';
import timerRouter from './domains/timer/interfaces/timerRouter';
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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
