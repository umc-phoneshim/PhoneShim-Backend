import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestError } from '../src/shared/errors/appError';
import errorHandler from '../src/shared/middlewares/errorHandler';

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const createMockRequest = (): Request =>
  ({
    method: 'GET',
    originalUrl: '/api/monitored-apps'
  }) as Request;

describe('errorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('responds with the AppError status/code/message and does not log', () => {
    const res = createMockResponse();
    const err = new BadRequestError('bad input', 'VALIDATION_ERROR');

    errorHandler(err, createMockRequest(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'bad input' }
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('responds with a generic 500 and logs unexpected errors', () => {
    const res = createMockResponse();
    const err = new Error('unexpected failure');

    errorHandler(err, createMockRequest(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/monitored-apps'),
      err
    );
  });
});
