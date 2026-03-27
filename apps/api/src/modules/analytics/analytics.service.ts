import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class AnalyticsService {
  static async getViews(userId: string) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const views = await prisma.cardView.findMany({
      where: {
        cardId: card.id,
        viewedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { viewedAt: 'asc' },
    });

    // Group by day
    const viewsByDayMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const key = date.toISOString().split('T')[0];
      viewsByDayMap.set(key, 0);
    }

    views.forEach((view) => {
      const key = view.viewedAt.toISOString().split('T')[0];
      viewsByDayMap.set(key, (viewsByDayMap.get(key) || 0) + 1);
    });

    const viewsByDay = Array.from(viewsByDayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Top referrers
    const referrerMap = new Map<string, number>();
    views.forEach((view) => {
      const ref = view.referrer || 'Direct';
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    });

    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Total views (all time)
    const total = await prisma.cardView.count({ where: { cardId: card.id } });

    return { views: viewsByDay, total, topReferrers };
  }
}
