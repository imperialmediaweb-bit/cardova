import { Request, Response } from 'express';
import { z } from 'zod';
import { TeamService } from './team.service';

export class TeamController {
  static async createTeam(req: Request, res: Response) {
    const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);
    const team = await TeamService.createTeam(req.user!.userId, name);
    res.status(201).json({ success: true, data: team });
  }

  static async getTeam(req: Request, res: Response) {
    const team = await TeamService.getTeam(req.user!.userId);
    res.json({ success: true, data: team });
  }

  static async inviteMember(req: Request, res: Response) {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const result = await TeamService.inviteMember(req.user!.userId, email);
    res.json({ success: true, data: result });
  }

  static async removeMember(req: Request, res: Response) {
    const result = await TeamService.removeMember(req.user!.userId, req.params.memberId);
    res.json({ success: true, data: result });
  }

  static async updateTeam(req: Request, res: Response) {
    const data = z.object({ name: z.string().min(1).max(100).optional(), maxCards: z.number().min(1).max(100).optional() }).parse(req.body);
    const team = await TeamService.updateTeam(req.user!.userId, data);
    res.json({ success: true, data: team });
  }

  static async deleteTeam(req: Request, res: Response) {
    const result = await TeamService.deleteTeam(req.user!.userId);
    res.json({ success: true, data: result });
  }
}
