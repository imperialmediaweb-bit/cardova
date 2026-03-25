import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { CardService } from './card.service';
import { updateCardSchema } from './card.schema';
import { generateQR } from '../../utils/qr';
import { buildVCard } from '../../utils/vcf';
import { env } from '../../config/env';

export class CardController {
  static async getCard(req: Request, res: Response) {
    const card = await CardService.getCard(req.user!.userId);
    res.json({ success: true, data: card });
  }

  static async updateCard(req: Request, res: Response) {
    const data = updateCardSchema.parse(req.body);
    const card = await CardService.updateCard(req.user!.userId, data);
    res.json({ success: true, data: card });
  }

  static async uploadAvatar(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let avatarUrl: string;

    if (env.CLOUDINARY_URL) {
      const cloudinary = (await import('cloudinary')).v2;
      cloudinary.config({ url: env.CLOUDINARY_URL });

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'cardova/avatars',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
            public_id: `avatar-${req.user!.userId}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      avatarUrl = result.secure_url;
    } else {
      const uploadDir = path.join(env.STORAGE_PATH, 'avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${req.user!.userId}${ext}`;
      const filepath = path.join(uploadDir, filename);

      try {
        fs.writeFileSync(filepath, req.file.buffer);
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to save avatar file' });
      }
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    const result = await CardService.updateAvatarUrl(req.user!.userId, avatarUrl);
    res.json({ success: true, data: result });
  }

  static async uploadGalleryImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let imageUrl: string;

    if (env.CLOUDINARY_URL) {
      const cloudinary = (await import('cloudinary')).v2;
      cloudinary.config({ url: env.CLOUDINARY_URL });

      const publicId = `gallery-${req.user!.userId}-${Date.now()}`;
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'cardova/gallery',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
            public_id: publicId,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
    } else {
      const uploadDir = path.join(env.STORAGE_PATH, 'gallery');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${req.user!.userId}-${Date.now()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      try {
        fs.writeFileSync(filepath, req.file.buffer);
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to save gallery image' });
      }
      imageUrl = `/uploads/gallery/${filename}`;
    }

    res.json({ success: true, data: { url: imageUrl } });
  }

  static async getQR(req: Request, res: Response) {
    const card = await CardService.getCard(req.user!.userId);
    const qrBuffer = await generateQR(card.username);
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `inline; filename="${card.username}-qr.png"`);
    res.send(qrBuffer);
  }

  static async getVCF(req: Request, res: Response) {
    const card = await CardService.getCard(req.user!.userId);
    const vcf = buildVCard({
      displayName: card.displayName,
      title: card.title || undefined,
      company: card.company || undefined,
      location: card.location || undefined,
      bio: card.bio || undefined,
      avatarUrl: card.avatarUrl,
      socialLinks: (card.socialLinks as Record<string, string>) || {},
    });
    res.set('Content-Type', 'text/vcard');
    res.set('Content-Disposition', `attachment; filename="${card.username}.vcf"`);
    res.send(vcf);
  }
}
