import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SocialLead } from './types';

// The preferences store is a Svelte rune module; vitest here has no Svelte plugin, so stand in a plain object.
const mockPreferencesStore = vi.hoisted(() => ({
  preferences: {
    includeFunnelPreviewLink: true,
  },
}));

vi.mock('../../stores/social-preferences-store.svelte', () => ({
  socialPreferencesStore: mockPreferencesStore,
}));

import { SocialPostDispatcher } from './social-post-dispatcher';
import { SocialIntentAnalyzer } from './social-intent-analyzer';

const PITCH = 'A reply body.';
const DISPATCH_URL = 'http://mycompass/wp-json/xophz-freshmints/v1/social/dispatch';

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const NOT_CONFIGURED = {
  code: 'freshmints_webhook_not_configured',
  message: 'No dispatch webhook is configured.',
  data: { status: 400 },
};

// Every dispatch asks the server to relay; with no webhook configured it answers "not configured".
const stubServer = () => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse(NOT_CONFIGURED, 400));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('window', {
    wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' },
  });
};

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
    mockPreferencesStore.preferences.includeFunnelPreviewLink = true;
    stubServer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
    mockPreferencesStore.preferences.includeFunnelPreviewLink = false;

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

describe('SocialPostDispatcher.dispatchReply: server relay', () => {
  beforeEach(() => {
    mockPreferencesStore.preferences.includeFunnelPreviewLink = true;
    stubServer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the copy-and-paste path when the server has no webhook configured', async () => {
    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.success).toBe(true);
    expect(result.message).toBe('Pitch copied and formatted with your funnel link. Paste directly into the thread.');
    expect(result.targetUrl).toBe(makeLead().rawPost.url);
    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('asks the server route to relay, with the nonce and only the lead fields', async () => {
    await SocialPostDispatcher.dispatchReply(makeLead());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(DISPATCH_URL);
    expect(init.method).toBe('POST');
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(JSON.parse(init.body)).toEqual({
      platform: 'reddit',
      threadUrl: 'https://www.reddit.com/r/smallbusiness/comments/abc/x/',
      prospect: 'u/some.user',
      intentScore: 68,
      matchedKeyword: 'website',
      replyBody: `${PITCH}${LEGACY_LINK_LINE}`,
    });
  });

  it('never calls a host other than the WordPress REST route', async () => {
    await SocialPostDispatcher.dispatchReply(makeLead());

    const hosts = fetchMock.mock.calls.map(([url]) => new URL(String(url)).host);
    expect(new Set(hosts)).toEqual(new Set(['mycompass']));
  });

  it('reports the server message when the webhook accepted the dispatch', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, message: 'Relayed.', status: 204 }));

    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.success).toBe(true);
    expect(result.message).toBe('Relayed.');
    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('fails with the server reason, keeping the reply text, when the webhook rejects it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { code: 'freshmints_webhook_rejected', message: 'The dispatch webhook responded with HTTP 500.' },
        502,
      ),
    );

    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Webhook dispatch error: The dispatch webhook responded with HTTP 500.');
    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });

  it('fails with a status line when the server error carries no message', async () => {
    fetchMock.mockResolvedValue(new Response('not json', { status: 500 }));

    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Webhook dispatch error: The server answered HTTP 500.');
  });

  it('fails when the server cannot be reached', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));

    const result = await SocialPostDispatcher.dispatchReply(makeLead());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Webhook dispatch error: Failed to fetch');
    expect(result.dispatchedContent).toBe(`${PITCH}${LEGACY_LINK_LINE}`);
  });
});

describe('legacy saved rule through analyzer and dispatcher', () => {
  beforeEach(() => {
    mockPreferencesStore.preferences.includeFunnelPreviewLink = true;
    stubServer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
