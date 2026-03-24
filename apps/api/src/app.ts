import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { cardRouter } from './modules/card/card.router';
import { aiRouter } from './modules/ai/ai.router';
import { stripeRouter } from './modules/stripe/stripe.router';
import { analyticsRouter } from './modules/analytics/analytics.router';
import { publicRouter } from './modules/public/public.router';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing — stripe webhook needs raw body, so it handles its own parsing in its router
// All other routes use JSON
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

// Static files (for locally stored avatars)
if (!env.CLOUDINARY_URL) {
  app.use('/uploads', express.static(path.join(env.STORAGE_PATH)));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/card', cardRouter);
app.use('/api/ai', aiRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/public', publicRouter);

// Error handler (must be last)
app.use(errorHandler);

export { app };
