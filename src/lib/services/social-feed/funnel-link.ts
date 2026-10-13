import type { SocialLead, SocialPlatform } from './types';

export const LEGACY_FUNNEL_BASE = 'https://freshmints.io/preview';

/** A reply template puts this on its own line to say where the funnel link goes. */
export const FUNNEL_LINK_PLACEHOLDER = '{funnel_link}';

const LEGACY_LINK_LABEL = 'Interactive Portfolio & Booking Demo';
const ATTRIBUTED_LINK_LABEL = 'Guide';
const MISSING_AUTHOR_SLUG = 'turnkey-demo';

/**
 * What the capture page stores as the source of an opt-in. The parameter names are a contract
 * shared with the Lead Magnet capture page (#6030): utm_source, utm_medium, utm_campaign,
 * fm_thread and fm_reply.
 */
export interface FunnelAttribution {
  readonly platform: SocialPlatform;
  readonly ruleId: string;
  readonly threadUrl: string;
  readonly replyId: string;
}

export interface ReplyLinkOptions {
  /** The global "include the funnel link" preference. */
  readonly linksEnabled: boolean;
  /** The guide page URL from preferences, used for attributed leads whose rule sets no base. */
  readonly guidePageUrl: string;
}

/**
 * 'inline' and 'appended' mean a link went into the reply. 'unavailable' means the lead wanted an
 * attributed link but no usable guide page URL exists, so the reply goes out without one.
 */
export type ReplyLinkOutcome = 'inline' | 'appended' | 'none' | 'unavailable';

export interface ComposedReply {
  readonly body: string;
  readonly linkOutcome: ReplyLinkOutcome;
}

interface ResolvedLink {
  readonly base: string;
  readonly url: string;
  readonly label: string;
}

const parseWebUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    const isWebUrl = url.protocol === 'https:' || url.protocol === 'http:';
    return isWebUrl ? url : null;
  } catch {
    return null;
  }
};

/** The guide page URL as typed, or "" when it is blank or not an absolute http(s) URL. */
export const normalizeGuidePageUrl = (raw: unknown): string => {
  const isText = typeof raw === 'string';
  if (!isText) {
    return '';
  }
  const trimmed = raw.trim();
  return parseWebUrl(trimmed) ? trimmed : '';
};

/**
 * The base URL plus the five attribution parameters, URL-encoded. Parameters already on the base
 * (such as ?page_id=12) are kept. Returns null when the base is not an absolute http(s) URL.
 */
export const buildAttributedLink = (base: string, attribution: FunnelAttribution): string | null => {
  const url = parseWebUrl(base);
  if (!url) {
    return null;
  }
  url.searchParams.set('utm_source', attribution.platform);
  url.searchParams.set('utm_medium', 'social_reply');
  url.searchParams.set('utm_campaign', attribution.ruleId);
  url.searchParams.set('fm_thread', attribution.threadUrl);
  url.searchParams.set('fm_reply', attribution.replyId);
  return url.toString();
};

export const attributionFromLead = (lead: SocialLead): FunnelAttribution => ({
  platform: lead.rawPost.platform,
  ruleId: lead.matchedRuleId,
  threadUrl: lead.rawPost.url,
  replyId: lead.id,
});

const authorSlugOf = (lead: SocialLead): string => lead.rawPost.author.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

const resolveLegacyLink = (lead: SocialLead): ResolvedLink => {
  const customBase = (lead.funnelBaseUrl ?? '').trim().replace(/\/+$/, '');
  const base = customBase || LEGACY_FUNNEL_BASE;
  return {
    base,
    url: `${base}/${authorSlugOf(lead) || MISSING_AUTHOR_SLUG}`,
    label: LEGACY_LINK_LABEL,
  };
};

/** An attributed link points at one capture page, so it carries no per-prospect path. */
const resolveAttributedLink = (lead: SocialLead, guidePageUrl: string): ResolvedLink | null => {
  const base = (lead.funnelBaseUrl ?? '').trim() || guidePageUrl;
  const url = buildAttributedLink(base, attributionFromLead(lead));
  return url === null ? null : { base, url, label: ATTRIBUTED_LINK_LABEL };
};

/** A reply already carrying this base (scheme aside) needs no second link. */
const stripScheme = (url: string): string => url.replace(/^https?:\/\//i, '');

const removePlaceholderLines = (body: string): string => {
  const kept = body.split('\n').filter((line) => !line.includes(FUNNEL_LINK_PLACEHOLDER));
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
};

/**
 * Puts the funnel link into a reply.
 *
 * - A body with {funnel_link} gets the link there (or loses that line when no link applies), and
 *   never gets a trailing link, so a closing disclosure stays last.
 * - Otherwise the link is appended unless the rule turned that off or the body already has it.
 * - The global preference switches every link off.
 *
 * A lead without attributeFunnelLink keeps the legacy `<base>/<author-slug>` link exactly.
 */
export const composeReplyBody = (lead: SocialLead, body: string, options: ReplyLinkOptions): ComposedReply => {
  const hasPlaceholder = body.includes(FUNNEL_LINK_PLACEHOLDER);
  const isLinkAllowedForRule = lead.appendFunnelLink !== false;
  const wantsLink = options.linksEnabled && (hasPlaceholder || isLinkAllowedForRule);
  const resolved = lead.attributeFunnelLink === true ? resolveAttributedLink(lead, options.guidePageUrl) : resolveLegacyLink(lead);
  const link = wantsLink ? resolved : null;
  const isLinkUnavailable = wantsLink && resolved === null;
  const outcomeWithoutLink: ReplyLinkOutcome = isLinkUnavailable ? 'unavailable' : 'none';

  if (hasPlaceholder) {
    return link
      ? { body: body.split(FUNNEL_LINK_PLACEHOLDER).join(link.url), linkOutcome: 'inline' }
      : { body: removePlaceholderLines(body), linkOutcome: outcomeWithoutLink };
  }

  if (!link) {
    return { body, linkOutcome: outcomeWithoutLink };
  }
  const isAlreadyLinked = body.includes(stripScheme(link.base));
  if (isAlreadyLinked) {
    return { body, linkOutcome: 'none' };
  }
  return { body: `${body}\n\n[${link.label}]: ${link.url}`, linkOutcome: 'appended' };
};
