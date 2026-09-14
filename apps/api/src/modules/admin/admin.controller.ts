import { Request, Response } from 'express';
import { z } from 'zod';
import { AdminService } from './admin.service';

export class AdminController {
  static async getDashboardStats(_req: Request, res: Response) {
    const stats = await AdminService.getDashboardStats();
    res.json({ success: true, data: stats });
  }

  static async listUsers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const result = await AdminService.listUsers(page, limit, search);
    res.json({ success: true, data: result });
  }

  static async getUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await AdminService.getUser(userId);
    res.json({ success: true, data: user });
  }

  static async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const data = z.object({
      role: z.enum(['user', 'admin']).optional(),
      isPro: z.boolean().optional(),
    }).parse(req.body);
    const user = await AdminService.updateUser(userId, data);
    res.json({ success: true, data: user });
  }

  static async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await AdminService.deleteUser(userId);
    res.json({ success: true, data: result });
  }
}
