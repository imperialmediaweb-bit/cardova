import { generateWithLLM, getAvailableProviders, LLMProvider } from '../../config/llm';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

const FREE_AI_CREDITS = 10;

const toneInstructions: Record<string, string> = {
  professional: 'Use a polished, confident, and professional tone.',
  friendly: 'Use a warm, approachable, and conversational tone.',
  creative: 'Use a bold, unique, and memorable tone that stands out.',
};

export class AIService {
  static async generateBio(
    userId: string,
    jobTitle: string,
    company: string,
    keywords: string[],
    tone: string = 'professional',
    provider: LLMProvider = 'openai',
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (!user.isPro && user.aiCreditsUsed >= FREE_AI_CREDITS) {
      throw new AppError(
        `You've used all ${FREE_AI_CREDITS} free AI credits. Upgrade to Pro for unlimited bio generation.`,
        403,
      );
    }

    const bio = await generateWithLLM(provider, {
      messages: [
        {
          role: 'system',
          content: `You are a professional bio writer for digital business cards. Write a 2-3 sentence first-person bio. Guidelines:
- Be specific to the person's role and industry
- Sound human and authentic, not corporate
- Avoid clichés: "passionate", "results-driven", "leveraging", "synergy", "innovative"
- ${toneInstructions[tone] || toneInstructions.professional}
- Return ONLY the bio text, nothing else`,
        },
        {
          role: 'user',
          content: `Job title: ${jobTitle}. Company: ${company}. Keywords: ${keywords.join(', ')}.`,
        },
      ],
      maxTokens: 200,
      temperature: tone === 'creative' ? 0.9 : tone === 'friendly' ? 0.8 : 0.7,
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return {
      bio,
      creditsUsed: updatedUser.aiCreditsUsed,
      creditsTotal: user.isPro ? null : FREE_AI_CREDITS,
      provider,
    };
  }

  static async improveBio(userId: string, currentBio: string, provider: LLMProvider = 'openai') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (!user.isPro) {
      throw new AppError('Upgrade to Pro to use AI bio improvement.', 403);
    }

    const bio = await generateWithLLM(provider, {
      messages: [
        {
          role: 'system',
          content: `You are a professional bio editor for digital business cards. Improve the given bio while preserving the person's voice and key information. Make it more concise, impactful, and natural-sounding. Fix grammar and awkward phrasing. Return ONLY the improved bio text, nothing else.`,
        },
        {
          role: 'user',
          content: `Improve this bio: "${currentBio}"`,
        },
      ],
      maxTokens: 200,
      temperature: 0.7,
    });

    return { bio, provider };
  }

  static getProviders() {
    return getAvailableProviders();
  }
}
