import { Request, Response } from 'express';
import { z } from 'zod';
import { AIService } from './ai.service';

const generateBioSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  keywords: z.array(z.string().max(50)).min(1, 'At least one keyword required').max(5),
  tone: z.enum(['professional', 'friendly', 'creative']).optional().default('professional'),
});

const improveBioSchema = z.object({
  bio: z.string().min(1, 'Bio is required').max(1000),
});

export class AIController {
  static async generateBio(req: Request, res: Response) {
    const data = generateBioSchema.parse(req.body);
    const result = await AIService.generateBio(
      req.user!.userId,
      data.jobTitle,
      data.company,
      data.keywords,
      data.tone,
    );
    res.json({ success: true, data: result });
  }

  static async improveBio(req: Request, res: Response) {
    const data = improveBioSchema.parse(req.body);
    const result = await AIService.improveBio(req.user!.userId, data.bio);
    res.json({ success: true, data: result });
  }
}
