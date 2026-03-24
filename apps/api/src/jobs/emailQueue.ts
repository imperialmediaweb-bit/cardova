import Queue from 'bull';
import { env } from '../config/env';

export interface EmailJobData {
  type: 'verify' | 'reset';
  email: string;
  token: string;
}

export const emailQueue = env.REDIS_URL
  ? new Queue<EmailJobData>('email', env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
  : null;

if (!emailQueue) {
  console.warn('⚠️  REDIS_URL not set — email queue disabled, emails sent synchronously');
}
