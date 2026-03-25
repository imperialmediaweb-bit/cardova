import { z } from 'zod';

const RESERVED_USERNAMES = ['api', 'admin', 'login', 'register', 'dashboard', 'settings', 'billing', 'help', 'support', 'about', 'terms', 'privacy', 'verify-email', 'reset-password', 'forgot-password'];

const serviceSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  description: z.string().max(300).optional().default(''),
  price: z.string().max(50).optional().default(''),
  icon: z.string().max(50).optional().default('briefcase'),
});

const customLinkSchema = z.object({
  id: z.string(),
  title: z.string().max(100),
  url: z.string().max(500),
  icon: z.string().max(50).optional().default('link'),
});

const businessHourSchema = z.object({
  day: z.string(),
  open: z.string().optional().default(''),
  close: z.string().optional().default(''),
  closed: z.boolean().optional().default(false),
});

const galleryItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().max(200).optional().default(''),
});

export const updateCardSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens')
    .refine((val) => !RESERVED_USERNAMES.includes(val), 'This username is reserved')
    .optional(),
  displayName: z.string().min(1, 'Display name is required').max(100).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(['minimal', 'bold', 'glass', 'neon', 'sunset', 'ocean']).optional(),
  isPublished: z.boolean().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  cardType: z.enum(['personal', 'business']).optional(),
  services: z.array(serviceSchema).max(20).optional(),
  customLinks: z.array(customLinkSchema).max(20).optional(),
  businessHours: z.array(businessHourSchema).max(7).optional(),
  gallery: z.array(galleryItemSchema).max(20).optional(),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;
