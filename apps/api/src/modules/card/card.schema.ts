import { z } from 'zod';

const RESERVED_USERNAMES = ['api', 'admin', 'login', 'register', 'dashboard', 'settings', 'billing', 'help', 'support', 'about', 'terms', 'privacy', 'verify-email', 'reset-password', 'forgot-password'];

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
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;
