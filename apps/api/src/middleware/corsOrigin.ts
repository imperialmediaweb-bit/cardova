import type { CorsOptions } from 'cors';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

/**
 * CORS origin check. Always allows the app's own origin; additionally allows
 * origins whose hostname is a verified customer domain, so the public card can
 * be fetched when the web app and API are deployed on different origins.
 */
const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { allowed: boolean; expires: number }>();

async function isVerifiedCustomDomain(host: string): Promise<boolean> {
  const now = Date.now();
  const hit = cache.get(host);
  if (hit && hit.expires > now) return hit.allowed;

  const bare = host.replace(/^www\./, '');
  let allowed = false;
  try {
    const card = await prisma.card.findFirst({
      where: {
        domainVerified: true,
        isPublished: true,
        user: { isPro: true },
        OR: [{ customDomain: bare }, { customDomain: `www.${bare}` }],
      },
      select: { id: true },
    });
    allowed = !!card;
  } catch {
    allowed = false;
  }
  cache.set(host, { allowed, expires: now + CACHE_TTL_MS });
  return allowed;
}

export const corsOrigin: CorsOptions['origin'] = (origin, callback) => {
  // Same-origin / server-to-server requests carry no Origin header.
  if (!origin || origin === env.CLIENT_URL) return callback(null, true);

  let host: string;
  try {
    host = new URL(origin).hostname.toLowerCase();
  } catch {
    return callback(null, false);
  }

  isVerifiedCustomDomain(host)
    .then((allowed) => callback(null, allowed))
    .catch(() => callback(null, false));
};
