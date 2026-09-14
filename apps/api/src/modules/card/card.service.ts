import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { RESERVED_USERNAMES, UpdateCardInput } from './card.schema';
import { isValidDomain, normalizeDomain } from './domain.service';

/** Card limits per plan. Free users get 1 card, Pro users get up to 10. */
const FREE_CARD_LIMIT = 1;
const PRO_CARD_LIMIT = 10;

const PRO_THEMES = ['neon', 'sunset', 'ocean'];

/** Leaves room for a "-NNN" suffix while staying under the 30-char username limit. */
const MAX_SLUG_LENGTH = 24;

/**
 * Generates a URL-safe, globally unique username by slugifying the base name
 * and appending a numeric suffix until no collision remains. The result always
 * satisfies updateCardSchema (3–30 chars, not reserved) so later saves succeed.
 */
async function generateUniqueUsername(base: string): Promise<string> {
  let slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/, '');

  // Too-short slugs ("jo") would fail the 3-char minimum on save.
  if (slug.length < 3) slug = slug ? `${slug}-card` : 'user';

  let suffix = 0;
  // Bounded loop: practically resolves within a few iterations.
  while (suffix < 1000) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const taken =
      RESERVED_USERNAMES.includes(candidate) ||
      (await prisma.card.findUnique({ where: { username: candidate } }));
    if (!taken) return candidate;
    suffix++;
  }
  // Extremely unlikely fallback — guarantees uniqueness via timestamp.
  return `${slug.slice(0, 16)}-${Date.now()}`;
}

export class CardService {
  /** Returns every card owned by the user, creating a default one on first access. */
  static async listCards(userId: string) {
    const cards = await prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (cards.length > 0) return cards;

    // First visit: bootstrap a default card so the dashboard is never empty.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const username = await generateUniqueUsername(user.name);
    const card = await prisma.card.create({
      data: { userId, username, displayName: user.name },
    });

    return [card];
  }

  /**
   * Returns one card. When cardId is omitted the user's first card is returned
   * (creating it if the account has none yet).
   */
  static async getCard(userId: string, cardId?: string) {
    if (!cardId) {
      const cards = await CardService.listCards(userId);
      return cards[0];
    }

    const card = await prisma.card.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new AppError('Card not found', 404);
    return card;
  }

  /** Creates an additional card, enforcing the plan's card limit. */
  static async createCard(userId: string, displayName?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const limit = user.isPro ? PRO_CARD_LIMIT : FREE_CARD_LIMIT;
    const count = await prisma.card.count({ where: { userId } });

    if (count >= limit) {
      throw new AppError(
        user.isPro
          ? `You've reached the maximum of ${PRO_CARD_LIMIT} cards.`
          : `Free accounts are limited to ${FREE_CARD_LIMIT} card. Upgrade to Pro to create up to ${PRO_CARD_LIMIT}.`,
        403,
      );
    }

    const name = displayName?.trim() || user.name;
    const username = await generateUniqueUsername(name);

    return prisma.card.create({
      data: { userId, username, displayName: name },
    });
  }

  static async updateCard(userId: string, cardId: string, data: UpdateCardInput) {
    const card = await prisma.card.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new AppError('Card not found', 404);

    // Premium themes are gated behind the Pro plan.
    if (data.theme && PRO_THEMES.includes(data.theme)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.isPro) {
        throw new AppError('This theme requires a Pro plan', 403);
      }
    }

    if (data.username && data.username !== card.username) {
      const existing = await prisma.card.findUnique({ where: { username: data.username } });
      if (existing) throw new AppError('Username already taken', 409);
    }

    // A changed custom domain must be re-verified before it serves the card.
    let customDomain: string | null | undefined;
    if (data.customDomain !== undefined) {
      customDomain = data.customDomain ? normalizeDomain(data.customDomain) : null;
      if (customDomain && !isValidDomain(customDomain)) {
        throw new AppError('That does not look like a valid domain name (e.g. cards.yourbusiness.com)', 400);
      }
    }
    const domainChanged = customDomain !== undefined && customDomain !== card.customDomain;

    return prisma.card.update({
      where: { id: card.id },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
        ...(data.cardType !== undefined && { cardType: data.cardType }),
        ...(data.services !== undefined && { services: data.services }),
        ...(data.customLinks !== undefined && { customLinks: data.customLinks }),
        ...(data.businessHours !== undefined && { businessHours: data.businessHours }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        ...(data.webhookUrl !== undefined && { webhookUrl: data.webhookUrl || null }),
        ...(data.webhookEvents !== undefined && { webhookEvents: data.webhookEvents }),
        ...(data.leadFormEnabled !== undefined && { leadFormEnabled: data.leadFormEnabled }),
        ...(customDomain !== undefined && { customDomain }),
        ...(domainChanged && { domainVerified: false }),
      },
    });
  }

  /** Deletes a card. The account's last remaining card cannot be removed. */
  static async deleteCard(userId: string, cardId: string) {
    const card = await prisma.card.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new AppError('Card not found', 404);

    const count = await prisma.card.count({ where: { userId } });
    if (count <= 1) {
      throw new AppError('You must keep at least one card.', 400);
    }

    await prisma.card.delete({ where: { id: card.id } });
    return { message: 'Card deleted' };
  }

  static async updateAvatarUrl(userId: string, cardId: string, avatarUrl: string) {
    const card = await prisma.card.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new AppError('Card not found', 404);

    await prisma.card.update({ where: { id: card.id }, data: { avatarUrl } });
    return { avatarUrl };
  }
}
