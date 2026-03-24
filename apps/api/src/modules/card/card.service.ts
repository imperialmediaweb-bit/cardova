import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { UpdateCardInput } from './card.schema';

export class CardService {
  static async getCard(userId: string) {
    let card = await prisma.card.findUnique({ where: { userId } });

    if (!card) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      const baseUsername = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      let username = baseUsername || 'user';
      let suffix = 0;

      while (true) {
        const candidate = suffix === 0 ? username : `${username}-${suffix}`;
        const existing = await prisma.card.findUnique({ where: { username: candidate } });
        if (!existing) {
          username = candidate;
          break;
        }
        suffix++;
      }

      card = await prisma.card.create({
        data: {
          userId,
          username,
          displayName: user.name,
        },
      });
    }

    return card;
  }

  static async updateCard(userId: string, data: UpdateCardInput) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);

    if (data.username && data.username !== card.username) {
      const existing = await prisma.card.findUnique({ where: { username: data.username } });
      if (existing) throw new AppError('Username already taken', 409);
    }

    const updated = await prisma.card.update({
      where: { userId },
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
      },
    });

    return updated;
  }

  static async updateAvatarUrl(userId: string, avatarUrl: string) {
    await prisma.card.update({
      where: { userId },
      data: { avatarUrl },
    });
    return { avatarUrl };
  }
}
