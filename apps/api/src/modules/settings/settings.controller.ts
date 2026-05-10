import { Request, Response } from 'express';
import { z } from 'zod';
import { SettingsService } from './settings.service';
import { updateProfileSchema, changePasswordSchema } from './settings.schema';

export class SettingsController {
  static async updateProfile(req: Request, res: Response) {
    const data = updateProfileSchema.parse(req.body);
    const result = await SettingsService.updateProfile(req.user!.userId, data);
    res.json({ success: true, data: result });
  }

  static async changePassword(req: Request, res: Response) {
    const data = changePasswordSchema.parse(req.body);
    const result = await SettingsService.changePassword(req.user!.userId, data);
    res.json({ success: true, data: result });
  }

  static async deleteAccount(req: Request, res: Response) {
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body);
    const result = await SettingsService.deleteAccount(req.user!.userId, password);
    res.json({ success: true, data: result });
  }

  static async getSessions(req: Request, res: Response) {
    const sessions = await SettingsService.getSessions(req.user!.userId);
    res.json({ success: true, data: sessions });
  }

  static async revokeAllSessions(req: Request, res: Response) {
    const result = await SettingsService.revokeAllSessions(req.user!.userId);
    res.json({ success: true, data: result });
  }
}
