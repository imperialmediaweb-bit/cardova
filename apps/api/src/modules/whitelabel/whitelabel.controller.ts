import { Request, Response } from 'express';
import { z } from 'zod';
import { WhiteLabelService } from './whitelabel.service';

const createSchema = z.object({
  domain: z.string().min(1).max(200),
  brandName: z.string().min(1).max(100),
  primaryColor: z.string().max(20).optional(),
});

const updateSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().max(500).optional(),
  primaryColor: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export class WhiteLabelController {
  static async create(req: Request, res: Response) {
    const data = createSchema.parse(req.body);
    const result = await WhiteLabelService.create(req.user!.userId, data);
    res.status(201).json({ success: true, data: result });
  }

  static async getAll(req: Request, res: Response) {
    const result = await WhiteLabelService.getByOwner(req.user!.userId);
    res.json({ success: true, data: result });
  }

  static async update(req: Request, res: Response) {
    const data = updateSchema.parse(req.body);
    const result = await WhiteLabelService.update(req.user!.userId, req.params.id, data);
    res.json({ success: true, data: result });
  }

  static async delete(req: Request, res: Response) {
    const result = await WhiteLabelService.delete(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  }
}
