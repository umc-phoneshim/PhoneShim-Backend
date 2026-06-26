import type { RequestHandler } from 'express';

import { NotFoundError } from '../errors/appError';

const notFoundHandler: RequestHandler = (_req, _res) => {
  throw new NotFoundError();
};

export default notFoundHandler;
