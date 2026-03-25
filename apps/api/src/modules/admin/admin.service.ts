import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class AdminService {
  static async getDashboardStats() {
    const [totalUsers, proUsers, totalCards, totalViews, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPro: true } }),
      prisma.card.count(),
      prisma.cardView.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, isPro: true, createdAt: true },
      }),
    ]);

    // Revenue from payments
    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    // Users by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30 = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return {
      totalUsers,
      proUsers,
      totalCards,
      totalViews,
      totalRevenue: (revenue._sum.amount || 0) / 100, // cents to dollars
      newUsersLast30,
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  static async listUsers(page: number = 1, limit: number = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isPro: true,
          emailVerified: true,
          aiCreditsUsed: true,
          createdAt: true,
          card: {
            select: { username: true, cardType: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  }

  static async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPro: true,
        emailVerified: true,
        aiCreditsUsed: true,
        stripeCustomerId: true,
        createdAt: true,
        card: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async updateUser(userId: string, data: { role?: string; isPro?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isPro !== undefined && { isPro: data.isPro }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPro: true,
        createdAt: true,
      },
    });

    return { ...updated, createdAt: updated.createdAt.toISOString() };
  }

  static async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete admin user', 400);

    await prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted' };
  }
}
