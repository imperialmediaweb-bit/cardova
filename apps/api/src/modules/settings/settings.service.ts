import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { UpdateProfileInput, ChangePasswordInput } from './settings.schema';

const SALT_ROUNDS = 12;

export class SettingsService {
  static async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new AppError('Email already in use', 409);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPro: true,
        aiCreditsUsed: true,
        createdAt: true,
      },
    });

    return { ...updated, createdAt: updated.createdAt.toISOString() };
  }

  static async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Invalidate all refresh tokens except current session
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully' };
  }

  static async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Password is incorrect', 400);

    // Delete user and all related data (cascades in Prisma)
    await prisma.user.delete({ where: { id: userId } });

    return { message: 'Account deleted successfully' };
  }

  static async getSessions(userId: string) {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId },
      select: { id: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    }));
  }

  static async revokeAllSessions(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'All sessions revoked' };
  }
}
