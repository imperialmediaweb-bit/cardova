import dns from 'node:dns/promises';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

/** Where customers must point their CNAME. */
export const CUSTOM_DOMAIN_TARGET = (process.env.CUSTOM_DOMAIN_TARGET || 'cardova.net').toLowerCase();

const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
}

export function isValidDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain) && domain !== CUSTOM_DOMAIN_TARGET && !domain.endsWith(`.${CUSTOM_DOMAIN_TARGET}`);
}

async function resolveA(host: string): Promise<string[]> {
  try {
    return await dns.resolve4(host);
  } catch {
    return [];
  }
}

/**
 * Checks that the domain points at us: either a CNAME to the target host, or
 * A records identical to the target's (some DNS providers flatten CNAMEs at the apex).
 */
export async function checkDomainDns(domain: string): Promise<{ ok: boolean; method: 'cname' | 'a' | null; detail: string }> {
  let cnames: string[] = [];
  try {
    cnames = (await dns.resolveCname(domain)).map((c) => c.toLowerCase().replace(/\.$/, ''));
  } catch {
    // No CNAME — fall through to the A-record comparison.
  }
  if (cnames.some((c) => c === CUSTOM_DOMAIN_TARGET || c.endsWith(`.${CUSTOM_DOMAIN_TARGET}`))) {
    return { ok: true, method: 'cname', detail: `CNAME → ${cnames.join(', ')}` };
  }

  const [ours, theirs] = await Promise.all([resolveA(CUSTOM_DOMAIN_TARGET), resolveA(domain)]);
  if (theirs.length && ours.length && theirs.some((ip) => ours.includes(ip))) {
    return { ok: true, method: 'a', detail: `A → ${theirs.join(', ')}` };
  }

  const found = cnames.length ? `CNAME → ${cnames.join(', ')}` : theirs.length ? `A → ${theirs.join(', ')}` : 'no DNS records found';
  return { ok: false, method: null, detail: found };
}

export class DomainService {
  static async verify(userId: string, cardId: string) {
    const card = await prisma.card.findFirst({ where: { id: cardId, userId }, include: { user: { select: { isPro: true } } } });
    if (!card) throw new AppError('Card not found', 404);
    if (!card.user.isPro) throw new AppError('Custom domains require a Pro plan', 403);
    if (!card.customDomain) throw new AppError('Add a custom domain to the card first', 400);

    const domain = normalizeDomain(card.customDomain);
    if (!isValidDomain(domain)) throw new AppError('That does not look like a valid domain name', 400);

    // One domain can only ever point at one card.
    const clash = await prisma.card.findFirst({
      where: { customDomain: domain, domainVerified: true, NOT: { id: card.id } },
      select: { id: true },
    });
    if (clash) throw new AppError('This domain is already connected to another card', 409);

    const dnsResult = await checkDomainDns(domain);

    const updated = await prisma.card.update({
      where: { id: card.id },
      data: { customDomain: domain, domainVerified: dnsResult.ok },
      select: { customDomain: true, domainVerified: true },
    });

    return {
      ...updated,
      verified: dnsResult.ok,
      method: dnsResult.method,
      detail: dnsResult.detail,
      target: CUSTOM_DOMAIN_TARGET,
      message: dnsResult.ok
        ? `Domain verified (${dnsResult.detail}). Your card is now served at https://${domain}.`
        : `DNS not pointing to ${CUSTOM_DOMAIN_TARGET} yet (${dnsResult.detail}). Add a CNAME record for ${domain} → ${CUSTOM_DOMAIN_TARGET} and try again; DNS changes can take up to 24h.`,
    };
  }
}
