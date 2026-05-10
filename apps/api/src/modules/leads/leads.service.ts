import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class LeadsService {
  // Submit lead (public - no auth needed)
  static async submitLead(username: string, data: { name: string; email: string; phone?: string; message?: string }) {
    const card = await prisma.card.findUnique({ where: { username } });
    if (!card || !card.isPublished || !card.leadFormEnabled) {
      throw new AppError('Card not found or lead form not enabled', 404);
    }
    const lead = await prisma.lead.create({
      data: { cardId: card.id, name: data.name, email: data.email, phone: data.phone || '', message: data.message || '' },
    });
    // Fire webhook if configured
    if (card.webhookUrl) {
      const events = (card.webhookEvents as string[]) || [];
      if (events.includes('lead.created')) {
        fireWebhook(card.webhookUrl, 'lead.created', { lead, cardUsername: username }).catch(() => {});
      }
    }
    return lead;
  }

  // Get leads for authenticated user
  static async getLeads(userId: string, page: number = 1, limit: number = 20) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where: { cardId: card.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.lead.count({ where: { cardId: card.id } }),
    ]);
    const unread = await prisma.lead.count({ where: { cardId: card.id, isRead: false } });
    return { leads, total, unread, pages: Math.ceil(total / limit), page };
  }

  // Mark lead as read
  static async markRead(userId: string, leadId: string) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);
    const lead = await prisma.lead.findFirst({ where: { id: leadId, cardId: card.id } });
    if (!lead) throw new AppError('Lead not found', 404);
    return prisma.lead.update({ where: { id: leadId }, data: { isRead: true } });
  }

  // Mark all as read
  static async markAllRead(userId: string) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);
    await prisma.lead.updateMany({ where: { cardId: card.id, isRead: false }, data: { isRead: true } });
    return { message: 'All leads marked as read' };
  }

  // Delete lead
  static async deleteLead(userId: string, leadId: string) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);
    const lead = await prisma.lead.findFirst({ where: { id: leadId, cardId: card.id } });
    if (!lead) throw new AppError('Lead not found', 404);
    await prisma.lead.delete({ where: { id: leadId } });
    return { message: 'Lead deleted' };
  }

  // Get lead stats
  static async getStats(userId: string) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) throw new AppError('Card not found', 404);
    const total = await prisma.lead.count({ where: { cardId: card.id } });
    const unread = await prisma.lead.count({ where: { cardId: card.id, isRead: false } });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30 = await prisma.lead.count({ where: { cardId: card.id, createdAt: { gte: thirtyDaysAgo } } });
    return { total, unread, last30 };
  }
}

// Webhook firing utility
async function fireWebhook(url: string, event: string, data: any) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cardova-Event': event },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.error(`Webhook failed for ${event}:`, e);
  }
}

export { fireWebhook };
