import type { ErrorRequestHandler } from 'express';

type AppError = Error & {
  statusCode?: number;
  code?: string;
};

const errorHandler: ErrorRequestHandler = (err: AppError, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error'
    }
  });
};

export default errorHandler;
