import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class WhiteLabelService {
  static async create(ownerId: string, data: { domain: string; brandName: string; primaryColor?: string }) {
    const existing = await prisma.whiteLabel.findUnique({ where: { domain: data.domain } });
    if (existing) throw new AppError('Domain already registered', 409);
    return prisma.whiteLabel.create({
      data: { ...data, ownerId, primaryColor: data.primaryColor || '#6366f1' },
    });
  }

  static async getByOwner(ownerId: string) {
    return prisma.whiteLabel.findMany({ where: { ownerId } });
  }

  static async getByDomain(domain: string) {
    return prisma.whiteLabel.findUnique({ where: { domain } });
  }

  static async update(ownerId: string, id: string, data: { brandName?: string; logoUrl?: string; primaryColor?: string; isActive?: boolean }) {
    const wl = await prisma.whiteLabel.findFirst({ where: { id, ownerId } });
    if (!wl) throw new AppError('White label config not found', 404);
    return prisma.whiteLabel.update({ where: { id }, data });
  }

  static async delete(ownerId: string, id: string) {
    const wl = await prisma.whiteLabel.findFirst({ where: { id, ownerId } });
    if (!wl) throw new AppError('White label config not found', 404);
    await prisma.whiteLabel.delete({ where: { id } });
    return { message: 'White label config deleted' };
  }
}
