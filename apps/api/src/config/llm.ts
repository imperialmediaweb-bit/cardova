import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';
import { AppError } from '../middleware/errorHandler';

export type LLMProvider = 'openai' | 'claude' | 'gemini';

interface LLMMessage {
  role: 'system' | 'user';
  content: string;
}

interface LLMOptions {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

// Initialize clients (only if API key is provided)
const openaiClient = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;
const anthropicClient = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;
const geminiClient = env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(env.GEMINI_API_KEY)
  : null;

async function callOpenAI(options: LLMOptions): Promise<string> {
  if (!openaiClient) {
    throw new AppError('OpenAI is not configured. OPENAI_API_KEY is missing.', 503);
  }
  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: options.messages,
    max_tokens: options.maxTokens || 200,
    temperature: options.temperature ?? 0.7,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new AppError('OpenAI returned empty response', 500);
  return text;
}

async function callClaude(options: LLMOptions): Promise<string> {
  if (!anthropicClient) {
    throw new AppError('Claude is not configured. ANTHROPIC_API_KEY is missing.', 503);
  }

  const systemMsg = options.messages.find((m) => m.role === 'system');
  const userMsgs = options.messages.filter((m) => m.role === 'user');

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 200,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: userMsgs.map((m) => ({ role: 'user' as const, content: m.content })),
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new AppError('Claude returned empty response', 500);
  }
  return block.text.trim();
}

async function callGemini(options: LLMOptions): Promise<string> {
  if (!geminiClient) {
    throw new AppError('Gemini is not configured. GEMINI_API_KEY is missing.', 503);
  }

  const model = geminiClient.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: options.maxTokens || 200,
      temperature: options.temperature ?? 0.7,
    },
  });

  // Combine system + user messages into a single prompt for Gemini
  const systemMsg = options.messages.find((m) => m.role === 'system');
  const userMsg = options.messages.find((m) => m.role === 'user');
  const prompt = [
    systemMsg ? `Instructions: ${systemMsg.content}` : '',
    userMsg ? userMsg.content : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent(prompt);
  const text = result.response.text()?.trim();
  if (!text) throw new AppError('Gemini returned empty response', 500);
  return text;
}

export async function generateWithLLM(
  provider: LLMProvider,
  options: LLMOptions,
): Promise<string> {
  switch (provider) {
    case 'openai':
      return callOpenAI(options);
    case 'claude':
      return callClaude(options);
    case 'gemini':
      return callGemini(options);
    default:
      throw new AppError(`Unknown LLM provider: ${provider}`, 400);
  }
}

export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (openaiClient) providers.push('openai');
  if (anthropicClient) providers.push('claude');
  if (geminiClient) providers.push('gemini');
  return providers;
}
