import Redis from 'ioredis';
import { env } from './env';

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : null;

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
} else {
  console.warn('⚠️  REDIS_URL not set — Redis disabled');
}
