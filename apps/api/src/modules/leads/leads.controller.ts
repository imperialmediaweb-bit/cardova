import { Request, Response } from 'express';
import { z } from 'zod';
import { LeadsService } from './leads.service';

const submitLeadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional(),
  message: z.string().max(1000).optional(),
});

export class LeadsController {
  static async submitLead(req: Request, res: Response) {
    const { username } = req.params;
    const data = submitLeadSchema.parse(req.body);
    await LeadsService.submitLead(username, data);
    res.json({ success: true, message: 'Message sent successfully' });
  }

  static async getLeads(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const result = await LeadsService.getLeads(req.user!.userId, page);
    res.json({ success: true, data: result });
  }

  static async markRead(req: Request, res: Response) {
    const result = await LeadsService.markRead(req.user!.userId, req.params.leadId);
    res.json({ success: true, data: result });
  }

  static async markAllRead(req: Request, res: Response) {
    const result = await LeadsService.markAllRead(req.user!.userId);
    res.json({ success: true, data: result });
  }

  static async deleteLead(req: Request, res: Response) {
    const result = await LeadsService.deleteLead(req.user!.userId, req.params.leadId);
    res.json({ success: true, data: result });
  }

  static async getStats(req: Request, res: Response) {
    const result = await LeadsService.getStats(req.user!.userId);
    res.json({ success: true, data: result });
  }
}
