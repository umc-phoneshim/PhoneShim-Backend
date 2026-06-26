import type { RequestHandler } from 'express';

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Requested resource was not found'
    }
  });
};

export default notFoundHandler;
