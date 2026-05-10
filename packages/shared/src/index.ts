// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  isPro: boolean;
  aiCreditsUsed: number;
  createdAt: string;
}

// Card types
export interface Card {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: CardTheme;
  isPublished: boolean;
  socialLinks: SocialLinks;
  createdAt: string;
}

export type CardTheme = 'minimal' | 'bold' | 'glass';

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface PublicCard {
  username: string;
  displayName: string;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: CardTheme;
  socialLinks: SocialLinks;
  isPro: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// AI types
export interface GenerateBioRequest {
  jobTitle: string;
  company: string;
  keywords: string[];
}

// Analytics types
export interface ViewsByDay {
  date: string;
  count: number;
}

export interface TopReferrer {
  referrer: string;
  count: number;
}

export interface AnalyticsData {
  totalViews: number;
  viewsByDay: ViewsByDay[];
  topReferrers: TopReferrer[];
}

// Stripe types
export type PlanType = 'MONTHLY' | 'LIFETIME';

export interface CheckoutRequest {
  planType: PlanType;
}

// Constants
export const FREE_AI_CREDITS = 3;
export const CARD_THEMES: CardTheme[] = ['minimal', 'bold', 'glass'];
export const MAX_BIO_LENGTH = 500;
export const MAX_USERNAME_LENGTH = 30;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
