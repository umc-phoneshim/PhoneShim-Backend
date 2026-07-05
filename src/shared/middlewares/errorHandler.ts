import type { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/appError';
import { sendError } from '../responses/apiResponse';

const errorHandler: ErrorRequestHandler = (err: Error, req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
};

export default errorHandler;
