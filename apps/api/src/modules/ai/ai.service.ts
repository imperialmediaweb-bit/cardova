import { openai } from '../../config/openai';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

const FREE_AI_CREDITS = 3;

export class AIService {
  static async generateBio(userId: string, jobTitle: string, company: string, keywords: string[]) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (!user.isPro && user.aiCreditsUsed >= FREE_AI_CREDITS) {
      throw new AppError('No AI credits left. Upgrade to Pro for unlimited bio generation.', 403);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional bio writer. Write a 2-3 sentence first-person professional bio. Be specific, confident, and human. No buzzwords. No clichés like "passionate" or "results-driven". Return ONLY the bio text, nothing else.',
        },
        {
          role: 'user',
          content: `Job title: ${jobTitle}. Company: ${company}. Keywords: ${keywords.join(', ')}.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const bio = completion.choices[0]?.message?.content?.trim();
    if (!bio) throw new AppError('Failed to generate bio. Please try again.', 500);

    await prisma.user.update({
      where: { id: userId },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return { bio };
  }
}
