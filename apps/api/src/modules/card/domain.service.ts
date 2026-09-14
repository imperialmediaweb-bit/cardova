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

/** Resolver answers that definitively mean "no such record" (vs. a transient failure). */
const DEFINITIVE_DNS_ERRORS = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN', 'ENOTIMP']);

/** Thrown when the resolver itself failed, so the caller must not change the stored status. */
export class DnsUnavailableError extends Error {}

function isTransient(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? '';
  return !DEFINITIVE_DNS_ERRORS.has(code);
}

async function resolveA(host: string): Promise<string[]> {
  try {
    return await dns.resolve4(host);
  } catch (err) {
    if (isTransient(err)) throw new DnsUnavailableError(`A lookup failed for ${host}`);
    return [];
  }
}

/**
 * Checks that the domain points at us: either a CNAME to the target host, or
 * A records identical to the target's (some DNS providers flatten CNAMEs at the apex).
 * Throws DnsUnavailableError on resolver failures so a live domain is never un-verified by a timeout.
 */
export async function checkDomainDns(domain: string): Promise<{ ok: boolean; method: 'cname' | 'a' | null; detail: string }> {
  let cnames: string[] = [];
  try {
    cnames = (await dns.resolveCname(domain)).map((c) => c.toLowerCase().replace(/\.$/, ''));
  } catch (err) {
    // No CNAME is a normal answer — fall through to the A-record comparison. Anything else is transient.
    if (isTransient(err)) throw new DnsUnavailableError(`CNAME lookup failed for ${domain}`);
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

    // One domain can only ever point at one card — apex and www are the same domain for lookups.
    const bare = domain.replace(/^www\./, '');
    const clash = await prisma.card.findFirst({
      where: {
        domainVerified: true,
        NOT: { id: card.id },
        OR: [{ customDomain: bare }, { customDomain: `www.${bare}` }],
      },
      select: { id: true },
    });
    if (clash) throw new AppError('This domain is already connected to another card', 409);

    let dnsResult: Awaited<ReturnType<typeof checkDomainDns>>;
    try {
      dnsResult = await checkDomainDns(domain);
    } catch (err) {
      if (err instanceof DnsUnavailableError) {
        // Keep whatever status the card already has rather than flipping it on a resolver hiccup.
        throw new AppError('DNS lookup is temporarily unavailable. Please try again in a minute.', 503);
      }
      throw err;
    }

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
