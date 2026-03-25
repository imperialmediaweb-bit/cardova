import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { cardRouter } from './modules/card/card.router';
import { aiRouter } from './modules/ai/ai.router';
import { stripeRouter } from './modules/stripe/stripe.router';
import { analyticsRouter } from './modules/analytics/analytics.router';
import { publicRouter } from './modules/public/public.router';
import { settingsRouter } from './modules/settings/settings.router';
import { adminRouter } from './modules/admin/admin.router';

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? false : undefined,
}));
app.use(cors({
  origin: env.NODE_ENV === 'production' ? true : env.CLIENT_URL,
  credentials: true,
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing — stripe webhook needs raw body, so it handles its own parsing in its router
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Static files (for locally stored avatars/gallery)
if (!env.CLOUDINARY_URL) {
  app.use('/uploads', express.static(path.join(env.STORAGE_PATH)));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/card', cardRouter);
app.use('/api/ai', aiRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/public', publicRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

// Serve frontend static files in production
if (env.NODE_ENV === 'production') {
  const webDist = path.resolve(__dirname, '../../web/dist');
  app.use(express.static(webDist));

  // SPA fallback: any non-API route serves index.html
  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

export { app };
