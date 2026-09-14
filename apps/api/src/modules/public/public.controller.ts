import { Request, Response } from 'express';
import { z } from 'zod';
import { Card, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

/** Known traffic sources; anything else is recorded as "direct". */
const VIEW_SOURCES = ['direct', 'qr', 'nfc', 'email', 'domain'] as const;
type ViewSource = (typeof VIEW_SOURCES)[number];

export const CLICK_TYPES = [
  'twitter', 'linkedin', 'github', 'instagram', 'website', 'email', 'phone',
  'custom_link', 'contact', 'vcard', 'share',
] as const;

const clickSchema = z.object({
  type: z.enum(CLICK_TYPES),
  target: z.string().max(300).optional().default(''),
});

type PublicCard = Card & { user: { name: string; isPro: boolean } };

const publicInclude = { user: { select: { name: true, isPro: true } } } as const;

function serialize(card: PublicCard) {
  return {
    username: card.username,
    displayName: card.displayName,
    title: card.title,
    company: card.company,
    location: card.location,
    bio: card.bio,
    avatarUrl: card.avatarUrl,
    theme: card.theme,
    socialLinks: card.socialLinks,
    isPro: card.user.isPro,
    cardType: card.cardType,
    services: card.services,
    customLinks: card.customLinks,
    businessHours: card.businessHours,
    gallery: card.gallery,
    leadFormEnabled: card.leadFormEnabled,
    customDomain: card.domainVerified ? card.customDomain : null,
  };
}

function referrerDomain(req: Request): string {
  const referrer = (req.headers.referer || req.headers.referrer || '') as string;
  if (!referrer) return '';
  try {
    return new URL(referrer).hostname;
  } catch {
    return 'unknown';
  }
}

function recordView(req: Request, card: Card, forcedSource?: ViewSource) {
  const raw = typeof req.query.src === 'string' ? req.query.src.toLowerCase() : '';
  const source: ViewSource =
    forcedSource ?? ((VIEW_SOURCES as readonly string[]).includes(raw) ? (raw as ViewSource) : 'direct');

  // Fire and forget — never slow down or fail the public page for analytics.
  prisma.cardView
    .create({ data: { cardId: card.id, referrer: referrerDomain(req), source } })
    .catch((err) => console.error('Failed to record card view:', err.message));
}

export class PublicController {
  static async getCard(req: Request, res: Response) {
    const { username } = req.params;

    const card = await prisma.card.findUnique({ where: { username }, include: publicInclude });
    if (!card || !card.isPublished) {
      throw new AppError('Card not found', 404);
    }

    recordView(req, card);
    res.json({ success: true, data: serialize(card) });
  }

  /** Resolves a card by its verified custom domain (used when the app is opened on that host). */
  static async getCardByDomain(req: Request, res: Response) {
    const host = String(req.params.host || '').toLowerCase().replace(/^www\./, '').split(':')[0];
    if (!host) throw new AppError('Card not found', 404);

    const card = await prisma.card.findFirst({
      where: {
        domainVerified: true,
        isPublished: true,
        OR: [{ customDomain: host }, { customDomain: `www.${host}` }],
      },
      include: publicInclude,
    });
    if (!card) throw new AppError('Card not found', 404);

    recordView(req, card, 'domain');
    res.json({ success: true, data: serialize(card) });
  }

  /** Records a click on one of the card's links/buttons. */
  static async trackClick(req: Request, res: Response) {
    const { username } = req.params;
    const parsed = clickSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Invalid click payload', 400);

    const card = await prisma.card.findUnique({ where: { username }, select: { id: true, isPublished: true } });
    if (!card || !card.isPublished) throw new AppError('Card not found', 404);

    const data: Prisma.CardClickUncheckedCreateInput = {
      cardId: card.id,
      linkType: parsed.data.type,
      target: parsed.data.target.slice(0, 300),
    };
    await prisma.cardClick.create({ data });

    res.status(204).end();
  }
}
