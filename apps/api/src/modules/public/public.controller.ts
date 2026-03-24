import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class PublicController {
  static async getCard(req: Request, res: Response) {
    const { username } = req.params;

    const card = await prisma.card.findUnique({
      where: { username },
      include: {
        user: {
          select: { name: true, isPro: true },
        },
      },
    });

    if (!card || !card.isPublished) {
      throw new AppError('Card not found', 404);
    }

    // Track view (fire and forget)
    const referrer = (req.headers.referer || req.headers.referrer || '') as string;
    let referrerDomain = '';
    try {
      if (referrer) {
        referrerDomain = new URL(referrer).hostname;
      }
    } catch {
      referrerDomain = referrer;
    }

    prisma.cardView.create({
      data: { cardId: card.id, referrer: referrerDomain },
    }).catch(() => {});

    res.json({
      success: true,
      data: {
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
      },
    });
  }
}
