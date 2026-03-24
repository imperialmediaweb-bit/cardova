import Queue from 'bull';
import { env } from '../config/env';

export interface EmailJobData {
  type: 'verify' | 'reset';
  email: string;
  token: string;
}

export const emailQueue = new Queue<EmailJobData>('email', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
