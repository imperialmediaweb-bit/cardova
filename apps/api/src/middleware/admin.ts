import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';

export const adminMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user?.userId) {
    throw new AppError('Authentication required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }

  next();
};
