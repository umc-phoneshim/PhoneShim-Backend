import type { Response } from 'express';

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200
): Response<SuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

export function sendCreated<T>(res: Response, data: T): Response<SuccessResponse<T>> {
  return sendSuccess(res, data, 201);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): Response<ErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
