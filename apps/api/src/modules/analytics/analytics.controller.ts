import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  static async getViews(req: Request, res: Response) {
    const data = await AnalyticsService.getViews(req.user!.userId);
    res.json({ success: true, data });
  }
}
