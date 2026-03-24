import { Request, Response } from 'express';
import { z } from 'zod';
import { AIService } from './ai.service';

const generateBioSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  keywords: z.array(z.string().max(50)).min(1, 'At least one keyword required').max(5),
});

export class AIController {
  static async generateBio(req: Request, res: Response) {
    const data = generateBioSchema.parse(req.body);
    const result = await AIService.generateBio(
      req.user!.userId,
      data.jobTitle,
      data.company,
      data.keywords,
    );
    res.json({ success: true, data: result });
  }
}
