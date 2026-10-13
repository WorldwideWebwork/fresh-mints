import { describe, it, expect } from 'vitest';
import {
  FUNNEL_LINK_PLACEHOLDER,
  attributionFromLead,
  buildAttributedLink,
  composeReplyBody,
  normalizeGuidePageUrl,
} from './funnel-link';
import type { SocialLead } from './types';

const GUIDE_PAGE = 'https://guide.example.org/annuity-guide/';
const THREAD_URL = 'https://www.reddit.com/r/retirement/comments/abc/my_post/?context=3';
const PITCH = 'A reply body.';
const LEGACY_LINK_LINE = '\n\n[Interactive Portfolio & Booking Demo]: https://freshmints.io/preview/u-some-user';
const ENABLED = { linksEnabled: true, guidePageUrl: GUIDE_PAGE };
const DISCLOSURE = "Disclosure: I'm a licensed insurance agent.";
const WITH_PLACEHOLDER = `Teaching text.\n\nGuide: ${FUNNEL_LINK_PLACEHOLDER}\n\n${DISCLOSURE}`;

const makeLead = (overrides: Partial<SocialLead> = {}): SocialLead => ({
  id: 'lead-social-1791864424997-482',
  rawPost: {
    id: 'reddit-abc',
    platform: 'reddit',
    externalId: 'abc',
    author: 'u/some.user',
    title: 'A question',
    content: 'Body',
    url: THREAD_URL,
    timestamp: '2026-10-12T12:00:00.000Z',
  },
  matchedRuleId: 'rule-1791864000000',
  matchedKeyword: 'annuity',
  intentScore: 50,
  detectedPainPoint: 'Mentions "annuity"',
  suggestedPitch: PITCH,
  status: 'radar',
  evaluatedAt: '2026-10-12T12:00:00.000Z',
  ...overrides,
});

const linkIn = (text: string): URL => {
  const found = text.match(/https?:\/\/\S+/);
  return new URL(found?.[0] ?? 'http://missing.invalid');
};

describe('normalizeGuidePageUrl', () => {
  it('keeps an absolute http(s) address, trimmed', () => {
    expect(normalizeGuidePageUrl(`  ${GUIDE_PAGE} `)).toBe(GUIDE_PAGE);
    expect(normalizeGuidePageUrl('http://localhost:8080/guide')).toBe('http://localhost:8080/guide');
  });

  it.each(['', '   ', '/annuity-guide/', 'guide.example.org', 'ftp://guide.example.org/', 'javascript:alert(1)'])(
    'returns an empty string for "%s"',
    (raw) => {
      expect(normalizeGuidePageUrl(raw)).toBe('');
    },
  );

  it('returns an empty string for a value that is not text', () => {
    expect(normalizeGuidePageUrl(undefined)).toBe('');
    expect(normalizeGuidePageUrl(null)).toBe('');
    expect(normalizeGuidePageUrl(42)).toBe('');
  });
});

describe('buildAttributedLink', () => {
  const attribution = {
    platform: 'reddit',
    ruleId: 'rule-1791864000000',
    threadUrl: THREAD_URL,
    replyId: 'lead-social-1791864424997-482',
  } as const;

  it('adds the five attribution parameters in contract order, thread URL encoded', () => {
    expect(buildAttributedLink(GUIDE_PAGE, attribution)).toBe(
      'https://guide.example.org/annuity-guide/?utm_source=reddit&utm_medium=social_reply' +
        '&utm_campaign=rule-1791864000000' +
        '&fm_thread=https%3A%2F%2Fwww.reddit.com%2Fr%2Fretirement%2Fcomments%2Fabc%2Fmy_post%2F%3Fcontext%3D3' +
        '&fm_reply=lead-social-1791864424997-482',
    );
  });

  it('round-trips awkward thread URLs and ids through the query string', () => {
    const awkward = 'https://www.youtube.com/watch?v=abc&lc=Ugx 123#comments';
    const link = buildAttributedLink(GUIDE_PAGE, { ...attribution, platform: 'youtube', threadUrl: awkward, replyId: 'a&b=c d' });
    const params = new URL(link ?? '').searchParams;

    expect(params.get('utm_source')).toBe('youtube');
    expect(params.get('utm_medium')).toBe('social_reply');
    expect(params.get('fm_thread')).toBe(awkward);
    expect(params.get('fm_reply')).toBe('a&b=c d');
    expect([...params.keys()]).toEqual(['utm_source', 'utm_medium', 'utm_campaign', 'fm_thread', 'fm_reply']);
    expect(link).not.toMatch(/[ #]/);
  });

  it('keeps parameters and a fragment already on the base, and replaces a repeated utm parameter', () => {
    const link = buildAttributedLink('https://guide.example.org/?page_id=12&utm_source=old#top', attribution);
    const url = new URL(link ?? '');

    expect(url.searchParams.get('page_id')).toBe('12');
    expect(url.searchParams.getAll('utm_source')).toEqual(['reddit']);
    expect(url.hash).toBe('#top');
  });

  it.each(['', 'not a url', '/annuity-guide/', 'ftp://guide.example.org/'])('returns null for the base "%s"', (base) => {
    expect(buildAttributedLink(base, attribution)).toBeNull();
  });

  it('reads the attribution from a lead', () => {
    expect(attributionFromLead(makeLead())).toEqual(attribution);
  });
});

describe('composeReplyBody: legacy links', () => {
  it('appends the plain preview link byte for byte, as before', () => {
    const composed = composeReplyBody(makeLead(), PITCH, ENABLED);

    expect(composed).toEqual({ body: `${PITCH}${LEGACY_LINK_LINE}`, linkOutcome: 'appended' });
  });

  it('adds no tracking parameters to a lead without attributeFunnelLink', () => {
    const composed = composeReplyBody(makeLead({ attributeFunnelLink: false }), PITCH, ENABLED);

    expect(composed.body).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
    expect(composed.body).not.toContain('utm_');
  });

  it('uses the rule base for the plain link, ignoring trailing slashes', () => {
    const composed = composeReplyBody(makeLead({ funnelBaseUrl: 'https://example.org/start//' }), PITCH, ENABLED);

    expect(composed.body).toBe(`${PITCH}\n\n[Interactive Portfolio & Booking Demo]: https://example.org/start/u-some-user`);
  });

  it('appends nothing when the rule or the global setting says so', () => {
    expect(composeReplyBody(makeLead({ appendFunnelLink: false }), PITCH, ENABLED)).toEqual({ body: PITCH, linkOutcome: 'none' });
    expect(composeReplyBody(makeLead(), PITCH, { ...ENABLED, linksEnabled: false })).toEqual({ body: PITCH, linkOutcome: 'none' });
  });

  it('adds no second link when the text already carries the base', () => {
    const withLink = 'See https://freshmints.io/preview/custom for a demo.';

    expect(composeReplyBody(makeLead(), withLink, ENABLED)).toEqual({ body: withLink, linkOutcome: 'none' });
  });

  it('fills a placeholder with the plain link for a lead that is not attributed', () => {
    const composed = composeReplyBody(makeLead({ appendFunnelLink: false }), WITH_PLACEHOLDER, ENABLED);

    expect(composed.body).toContain('Guide: https://freshmints.io/preview/u-some-user\n\n');
    expect(composed.linkOutcome).toBe('inline');
  });
});

describe('composeReplyBody: attributed links', () => {
  const attributed = makeLead({ attributeFunnelLink: true, appendFunnelLink: false });

  it('puts the attributed link where the placeholder is and keeps the disclosure last', () => {
    const composed = composeReplyBody(attributed, WITH_PLACEHOLDER, ENABLED);
    const link = linkIn(composed.body);

    expect(composed.linkOutcome).toBe('inline');
    expect(composed.body.endsWith(DISCLOSURE)).toBe(true);
    expect(composed.body).not.toContain('{');
    expect(link.origin + link.pathname).toBe(GUIDE_PAGE);
    expect(Object.fromEntries(link.searchParams)).toEqual({
      utm_source: 'reddit',
      utm_medium: 'social_reply',
      utm_campaign: 'rule-1791864000000',
      fm_thread: THREAD_URL,
      fm_reply: 'lead-social-1791864424997-482',
    });
  });

  it('carries no author slug, since it points at one capture page', () => {
    const composed = composeReplyBody(attributed, WITH_PLACEHOLDER, ENABLED);

    expect(composed.body).not.toContain('some-user');
  });

  it('replaces every placeholder', () => {
    const composed = composeReplyBody(attributed, `${FUNNEL_LINK_PLACEHOLDER} and ${FUNNEL_LINK_PLACEHOLDER}`, ENABLED);

    expect(composed.body).not.toContain(FUNNEL_LINK_PLACEHOLDER);
    expect(composed.body.match(/utm_source=reddit/g)).toHaveLength(2);
  });

  it('prefers the rule base over the guide page URL from settings', () => {
    const lead = makeLead({ attributeFunnelLink: true, funnelBaseUrl: 'https://rule.example.org/guide' });
    const composed = composeReplyBody(lead, WITH_PLACEHOLDER, ENABLED);

    expect(linkIn(composed.body).origin).toBe('https://rule.example.org');
  });

  it('drops the placeholder line, keeping the disclosure last, when no guide page URL is set', () => {
    const composed = composeReplyBody(attributed, WITH_PLACEHOLDER, { linksEnabled: true, guidePageUrl: '' });

    expect(composed).toEqual({ body: `Teaching text.\n\n${DISCLOSURE}`, linkOutcome: 'unavailable' });
  });

  it('treats a rule base that is not an absolute web address as no link', () => {
    const lead = makeLead({ attributeFunnelLink: true, funnelBaseUrl: '/relative/guide' });
    const composed = composeReplyBody(lead, WITH_PLACEHOLDER, ENABLED);

    expect(composed.linkOutcome).toBe('unavailable');
    expect(composed.body).not.toContain('http');
  });

  it('drops the placeholder line when links are switched off, without calling that a problem', () => {
    const composed = composeReplyBody(attributed, WITH_PLACEHOLDER, { ...ENABLED, linksEnabled: false });

    expect(composed).toEqual({ body: `Teaching text.\n\n${DISCLOSURE}`, linkOutcome: 'none' });
  });

  it('drops a placeholder that ends the text without leaving trailing blank lines', () => {
    const composed = composeReplyBody(attributed, `Text.\n\n${FUNNEL_LINK_PLACEHOLDER}`, { linksEnabled: true, guidePageUrl: '' });

    expect(composed.body).toBe('Text.');
  });

  it('never appends a trailing link after a text that has a placeholder, even when the rule allows appending', () => {
    const lead = makeLead({ attributeFunnelLink: true, appendFunnelLink: true });
    const composed = composeReplyBody(lead, WITH_PLACEHOLDER, ENABLED);

    expect(composed.body.endsWith(DISCLOSURE)).toBe(true);
    expect(composed.body.match(/utm_source/g)).toHaveLength(1);
  });

  it('appends a labelled attributed link when there is no placeholder and the rule allows appending', () => {
    const lead = makeLead({ attributeFunnelLink: true });
    const composed = composeReplyBody(lead, PITCH, ENABLED);

    expect(composed.linkOutcome).toBe('appended');
    expect(composed.body.startsWith(`${PITCH}\n\n[Guide]: ${GUIDE_PAGE}?utm_source=reddit`)).toBe(true);
  });

  it('appends nothing when there is no placeholder and the rule turned appending off', () => {
    expect(composeReplyBody(attributed, PITCH, ENABLED)).toEqual({ body: PITCH, linkOutcome: 'none' });
  });
});
