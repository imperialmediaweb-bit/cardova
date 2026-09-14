import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct / Link',
  qr: 'QR Code',
  nfc: 'NFC Tap',
  email: 'Email Signature',
  domain: 'Custom Domain',
};

const CLICK_LABELS: Record<string, string> = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  website: 'Website',
  email: 'Email',
  phone: 'Phone',
  custom_link: 'Custom link',
  contact: 'Contact button',
  vcard: 'Save Contact',
  share: 'Share',
};

function dayKey(d: Date) {
  return d.toISOString().split('T')[0];
}

export class AnalyticsService {
  static async getViews(userId: string, cardId?: string) {
    const card = cardId
      ? await prisma.card.findFirst({ where: { id: cardId, userId } })
      : await prisma.card.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
    if (!card) throw new AppError('Card not found', 404);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [views, clicks, total, qrScansTotal, clicksTotal] = await Promise.all([
      prisma.cardView.findMany({
        where: { cardId: card.id, viewedAt: { gte: thirtyDaysAgo } },
        orderBy: { viewedAt: 'asc' },
      }),
      prisma.cardClick.findMany({
        where: { cardId: card.id, clickedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.cardView.count({ where: { cardId: card.id } }),
      prisma.cardView.count({ where: { cardId: card.id, source: 'qr' } }),
      prisma.cardClick.count({ where: { cardId: card.id } }),
    ]);

    // Views per day (last 30 days, zero-filled)
    const viewsByDayMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      viewsByDayMap.set(dayKey(date), 0);
    }
    views.forEach((view) => {
      const key = dayKey(view.viewedAt);
      viewsByDayMap.set(key, (viewsByDayMap.get(key) || 0) + 1);
    });
    const viewsByDay = Array.from(viewsByDayMap.entries()).map(([date, count]) => ({ date, count }));

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

    // Traffic sources (QR / NFC / domain / direct), last 30 days
    const sourceMap = new Map<string, number>();
    views.forEach((view) => {
      const src = view.source || 'direct';
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    });
    const sources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, label: SOURCE_LABELS[source] || source, count }))
      .sort((a, b) => b.count - a.count);

    const qrScans = {
      last30: sourceMap.get('qr') || 0,
      total: qrScansTotal,
    };

    // Link clicks, last 30 days, grouped by link type + target
    const clickMap = new Map<string, { type: string; label: string; target: string; count: number }>();
    clicks.forEach((c) => {
      const key = `${c.linkType}|${c.target}`;
      const existing = clickMap.get(key);
      if (existing) existing.count++;
      else clickMap.set(key, { type: c.linkType, label: CLICK_LABELS[c.linkType] || c.linkType, target: c.target, count: 1 });
    });
    const linkClicks = Array.from(clickMap.values()).sort((a, b) => b.count - a.count).slice(0, 20);

    return {
      views: viewsByDay,
      total,
      topReferrers,
      sources,
      qrScans,
      clicks: { last30: clicks.length, total: clicksTotal, items: linkClicks },
    };
  }
}
