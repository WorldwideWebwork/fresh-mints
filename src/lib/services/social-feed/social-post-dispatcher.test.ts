import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SocialLead } from './types';

// The tokens store is a Svelte rune module; vitest here has no Svelte plugin, so stand in a plain object.
const mockTokensStore = vi.hoisted(() => ({
  tokens: {
    includeFunnelPreviewLink: true,
    webhookUrl: '',
    ayrshareApiKey: '',
  },
}));

vi.mock('../../stores/social-tokens-store.svelte', () => ({
  socialTokensStore: mockTokensStore,
}));

import { SocialPostDispatcher } from './social-post-dispatcher';
import { SocialIntentAnalyzer } from './social-intent-analyzer';

const PITCH = 'A reply body.';

const makeLead = (overrides: Partial<SocialLead> = {}): SocialLead => ({
  id: 'lead-social-1',
  rawPost: {
    id: 'reddit-abc',
    platform: 'reddit',
    externalId: 'abc',
    author: 'u/some.user',
    title: 'Need website help',
    content: 'Looking for a website person.',
    url: 'https://www.reddit.com/r/smallbusiness/comments/abc/x/',
    timestamp: '2026-10-09T12:00:00.000Z',
  },
  matchedRuleId: 'rule-1',
  matchedKeyword: 'website',
  intentScore: 68,
  detectedPainPoint: 'looking for',
  suggestedPitch: PITCH,
  status: 'radar',
  evaluatedAt: '2026-10-09T12:00:00.000Z',
  ...overrides,
});

const LEGACY_LINK_LINE = '\n\n[Interactive Portfolio & Booking Demo]: https://freshmints.io/preview/u-some-user';

describe('SocialPostDispatcher.dispatchReply: funnel link', () => {
  beforeEach(() => {
    mockTokensStore.tokens.includeFunnelPreviewLink = true;
    mockTokensStore.tokens.webhookUrl = '';
    mockTokensStore.tokens.ayrshareApiKey = '';
  });

  it('appends the legacy freshmints.io preview link when the lead has no funnel fields', async () => {
    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('appends the legacy link when appendFunnelLink is explicitly true', async () => {
    const result = await SocialPostDispatcher.dispatchReply(makeLead({ appendFunnelLink: true }));

    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('appends no link when appendFunnelLink is false', async () => {
    const result = await SocialPostDispatcher.dispatchReply(makeLead({ appendFunnelLink: false }));

    expect(result.dispatchedContent).toBe(PITCH);
    expect(result.dispatchedContent).not.toContain('http');
  });

  it('appends no link when the global setting is off, even if the rule allows one', async () => {
    mockTokensStore.tokens.includeFunnelPreviewLink = false;

    const result = await SocialPostDispatcher.dispatchReply(makeLead({ appendFunnelLink: true }));

    expect(result.dispatchedContent).toBe(PITCH);
  });

  it('uses the lead funnelBaseUrl in place of the legacy base, ignoring trailing slashes', async () => {
    const lead = makeLead({ funnelBaseUrl: 'https://example.org/start//' });

    const result = await SocialPostDispatcher.dispatchReply(lead);

    expect(result.dispatchedContent).toBe(
      `${PITCH}\n\n[Interactive Portfolio & Booking Demo]: https://example.org/start/u-some-user`,
    );
  });

  it('falls back to the legacy base when funnelBaseUrl is blank', async () => {
    const result = await SocialPostDispatcher.dispatchReply(makeLead({ funnelBaseUrl: '  ' }));

    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('does not append a second link when the text already carries one', async () => {
    const withLink = 'See https://freshmints.io/preview/custom for a demo.';

    const result = await SocialPostDispatcher.dispatchReply(makeLead(), withLink);

    expect(result.dispatchedContent).toBe(withLink);
  });

  it('does not append a second link when the text already carries the custom base', async () => {
    const lead = makeLead({ funnelBaseUrl: 'https://example.org/start' });
    const withLink = 'See https://example.org/start/u-some-user for a demo.';

    const result = await SocialPostDispatcher.dispatchReply(lead, withLink);

    expect(result.dispatchedContent).toBe(withLink);
  });
});

describe('legacy saved rule through analyzer and dispatcher', () => {
  it('yields the website pitch and the legacy preview link end to end', async () => {
    const savedRule = JSON.parse(
      JSON.stringify({
        id: 'rule-web-upgrade',
        name: 'Website Redesign & Upgrades',
        keywords: ['website'],
        negativeKeywords: [],
        platforms: ['reddit'],
        minIntentScore: 50,
        isActive: true,
        autoConvertToCrm: false,
        createdAt: '2026-10-01T00:00:00.000Z',
      }),
    );
    const post = makeLead().rawPost;

    const lead = SocialIntentAnalyzer.evaluatePost(post, savedRule);
    expect(lead).not.toBeNull();
    const result = await SocialPostDispatcher.dispatchReply(lead as SocialLead);

    expect(result.dispatchedContent).toContain('Fresh Mints builds turnkey');
    expect(result.dispatchedContent?.endsWith(LEGACY_LINK_LINE)).toBe(true);
  });
});
