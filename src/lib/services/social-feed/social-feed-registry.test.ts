import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { socialFeedRegistry } from './social-feed-registry';
import type { RawSocialPost, SocialMonitorRule } from './types';

const ROUTE_URL = 'http://mycompass/wp-json/xophz-freshmints/v1/social/fetch';
const HN_HOST = 'https://hn.algolia.com/';

const routePost = (platform: 'reddit' | 'youtube' | 'stack_exchange', url: string): RawSocialPost => ({
  id: `${platform}-1`,
  platform,
  externalId: '1',
  author: 'Pat',
  title: 'Weighing an annuity',
  content: 'Looking for a plain explanation of annuity surrender periods.',
  url,
  timestamp: '2026-10-09T12:00:00.000Z',
  score: 3,
  commentsCount: 2,
  subredditOrChannel: 'channel-name',
});

const makeRule = (overrides: Partial<SocialMonitorRule> = {}): SocialMonitorRule => ({
  id: 'rule-test',
  name: 'Test rule',
  keywords: ['annuity'],
  negativeKeywords: [],
  platforms: ['reddit', 'hacker_news'],
  targetSubreddits: ['retirement', 'personalfinance'],
  minIntentScore: 50,
  isActive: true,
  createdAt: '2026-10-09T00:00:00.000Z',
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

interface RouteBody {
  platform: string;
  keywords: string[];
  targetChannels: string[];
}

describe('SocialFeedRegistry', () => {
  const fetchMock = vi.fn();

  const routeBodies = (): RouteBody[] =>
    fetchMock.mock.calls
      .filter(([url]) => url === ROUTE_URL)
      .map(([, init]) => JSON.parse(init.body) as RouteBody);

  const hackerNewsCalls = (): unknown[] =>
    fetchMock.mock.calls.filter(([url]) => String(url).startsWith(HN_HOST));

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes all four platforms with their display names', () => {
    const platforms = socialFeedRegistry.getAvailablePlatforms();

    expect(platforms).toEqual(
      expect.arrayContaining([
        { id: 'hacker_news', name: 'Hacker News (Algolia Search)' },
        { id: 'reddit', name: 'Reddit (Public JSON Feed)' },
        { id: 'youtube', name: 'YouTube Comments' },
        { id: 'stack_exchange', name: 'Stack Exchange: Personal Finance & Money' },
      ]),
    );
    expect(platforms).toHaveLength(4);
  });

  it('runs a rule saved before this change (reddit plus hacker_news) exactly as it did', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === ROUTE_URL) {
        return jsonResponse({ status: 'ok', posts: [routePost('reddit', 'https://www.reddit.com/r/retirement/1')] });
      }
      return jsonResponse({ hits: [] });
    });

    const result = await socialFeedRegistry.scanRules([makeRule()]);

    expect(routeBodies()).toEqual([
      { platform: 'reddit', keywords: ['annuity'], targetChannels: ['retirement', 'personalfinance'] },
    ]);
    expect(hackerNewsCalls()).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.problems).toEqual([]);
    expect(result.leads.map((lead) => lead.rawPost.platform)).toEqual(['reddit']);
  });

  it('keeps reporting a disabled Reddit under its own display name for a legacy rule', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === ROUTE_URL) {
        return jsonResponse({ status: 'failed', reason: 'Reddit is disabled pending commercial API terms.' });
      }
      return jsonResponse({ hits: [] });
    });

    const result = await socialFeedRegistry.scanRules([makeRule()]);

    expect(result.problems).toEqual([
      {
        platform: 'reddit',
        displayName: 'Reddit (Public JSON Feed)',
        status: 'failed',
        reason: 'Reddit is disabled pending commercial API terms.',
      },
    ]);
  });

  it('sends a youtube and stack_exchange rule to the server with no channels and never to Hacker News', async () => {
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
      const { platform } = JSON.parse(init.body) as RouteBody;
      const platformKey = platform as 'youtube' | 'stack_exchange';
      return jsonResponse({ status: 'ok', posts: [routePost(platformKey, `https://example.test/${platform}/1`)] });
    });

    const result = await socialFeedRegistry.scanRules([
      makeRule({ platforms: ['stack_exchange', 'youtube'], targetSubreddits: [] }),
    ]);

    expect(routeBodies()).toEqual([
      { platform: 'stack_exchange', keywords: ['annuity'], targetChannels: [] },
      { platform: 'youtube', keywords: ['annuity'], targetChannels: [] },
    ]);
    expect(hackerNewsCalls()).toHaveLength(0);
    expect(result.problems).toEqual([]);
    expect(result.leads.map((lead) => lead.rawPost.platform).sort()).toEqual(['stack_exchange', 'youtube']);
  });

  it('reports one failing server platform without dropping the other platform leads', async () => {
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
      const { platform } = JSON.parse(init.body) as RouteBody;
      if (platform === 'youtube') {
        return jsonResponse({ status: 'failed', reason: 'YouTube is not configured.' });
      }
      return jsonResponse({ status: 'ok', posts: [routePost('stack_exchange', 'https://example.test/se/1')] });
    });

    const result = await socialFeedRegistry.scanRules([
      makeRule({ platforms: ['stack_exchange', 'youtube'], targetSubreddits: [] }),
    ]);

    expect(result.problems).toEqual([
      {
        platform: 'youtube',
        displayName: 'YouTube Comments',
        status: 'failed',
        reason: 'YouTube is not configured.',
      },
    ]);
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0].rawPost.platform).toBe('stack_exchange');
  });
});
