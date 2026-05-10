import OpenAI from 'openai';
import { env } from './env';

export const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

if (!openai) {
  console.warn('⚠️  OPENAI_API_KEY not set — OpenAI disabled');
}
