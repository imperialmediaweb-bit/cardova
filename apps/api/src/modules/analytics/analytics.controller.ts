import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  static async getViews(req: Request, res: Response) {
    const cardId = req.query.cardId as string | undefined;
    const data = await AnalyticsService.getViews(req.user!.userId, cardId);
    res.json({ success: true, data });
  }
}
