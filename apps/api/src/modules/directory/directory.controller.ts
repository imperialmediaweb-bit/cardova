import { Request, Response } from 'express';
import { DirectoryService } from './directory.service';

export class DirectoryController {
  static async search(req: Request, res: Response) {
    const query = req.query.q as string | undefined;
    const profession = req.query.profession as string | undefined;
    const location = req.query.location as string | undefined;
    const page = parseInt(req.query.page as string) || 1;

    const result = await DirectoryService.search(query, profession, location, page);
    res.json({ success: true, data: result });
  }
}
