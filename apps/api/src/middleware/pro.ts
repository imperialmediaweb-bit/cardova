import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const proMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isPro) {
    throw new AppError('Pro subscription required', 403);
  }
  next();
};
