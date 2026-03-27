import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';

export interface AuthUser {
  userId: string;
  email: string;
  isPro: boolean;
  aiCreditsUsed: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, isPro: true, aiCreditsUsed: true, role: true },
  });

  if (!user) {
    throw new AppError('User not found', 401);
  }

  req.user = {
    userId: user.id,
    email: user.email,
    isPro: user.isPro,
    aiCreditsUsed: user.aiCreditsUsed,
    role: user.role,
  };

  next();
};
