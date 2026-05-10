import { prisma } from '../../config/prisma';

export class DirectoryService {
  static async search(query?: string, profession?: string, location?: string, page: number = 1, limit: number = 20) {
    const where: any = {
      isPublished: true,
    };

    if (query) {
      where.OR = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (profession) {
      where.title = { contains: profession, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          username: true,
          displayName: true,
          title: true,
          company: true,
          location: true,
          bio: true,
          avatarUrl: true,
          theme: true,
          cardType: true,
        },
      }),
      prisma.card.count({ where }),
    ]);

    return {
      cards,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  }
}
