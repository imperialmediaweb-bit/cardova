import { Request, Response, NextFunction } from 'express';
import express from 'express';

export const rawBodyMiddleware = express.raw({ type: 'application/json' });

export const captureRawBody = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, _res, next);
  }
};
