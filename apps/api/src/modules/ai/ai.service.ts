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

  static async generateServices(
    userId: string,
    businessName: string,
    industry: string,
    description: string,
    provider: LLMProvider = 'openai',
  ) {
    await AIService.checkCredits(userId);

    const result = await generateWithLLM(provider, {
      messages: [
        {
          role: 'system',
          content: `You are a business consultant helping create service listings for a digital business card. Generate 4-6 services that this business would offer. Return a JSON array of objects with: name (service name, max 60 chars), description (1 sentence, max 150 chars), price (realistic price or price range like "$50-100" or "From $199" or "Free consultation"). Return ONLY valid JSON array, no markdown.`,
        },
        {
          role: 'user',
          content: `Business: ${businessName}. Industry: ${industry}. Description: ${description}`,
        },
      ],
      maxTokens: 800,
      temperature: 0.7,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    try {
      const services = JSON.parse(result);
      return { services, provider };
    } catch {
      throw new AppError('AI returned invalid format. Please try again.', 500);
    }
  }

  static async generateBusinessContent(
    userId: string,
    businessName: string,
    industry: string,
    location: string,
    provider: LLMProvider = 'openai',
  ) {
    await AIService.checkCredits(userId);

    const result = await generateWithLLM(provider, {
      messages: [
        {
          role: 'system',
          content: `You are a business branding expert. Generate complete business card content. Return a JSON object with:
- bio: string (2-3 sentences about the business, first person plural "we", max 300 chars)
- services: array of {name, description, price} (4-6 services, realistic)
- businessHours: array of {day, open, close, closed} for Mon-Sun (realistic for the industry)
- customLinks: array of {title, url, icon} (3-4 relevant links like "Book Appointment", "Menu", "Portfolio" etc. Use placeholder URLs like https://example.com/book)

Icons for customLinks can be: link, calendar, menu, shopping-bag, camera, file-text, map, star
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Business: ${businessName}. Industry: ${industry}. Location: ${location || 'Not specified'}`,
        },
      ],
      maxTokens: 1500,
      temperature: 0.7,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    try {
      const content = JSON.parse(result);
      return { content, provider };
    } catch {
      throw new AppError('AI returned invalid format. Please try again.', 500);
    }
  }

  static getProviders() {
    return getAvailableProviders();
  }

  private static async checkCredits(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    if (!user.isPro && user.aiCreditsUsed >= FREE_AI_CREDITS) {
      throw new AppError(
        `You've used all ${FREE_AI_CREDITS} free AI credits. Upgrade to Pro for unlimited AI generation.`,
        403,
      );
    }
  }
}
