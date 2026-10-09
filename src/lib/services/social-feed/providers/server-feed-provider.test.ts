import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createServerFeedProvider, type ServerFeedPlatform } from './server-feed-provider';
import { RedditPublicProvider } from './reddit-public-provider';
import type { RawSocialPost, SocialMonitorRule } from '../types';

const ROUTE_URL = 'http://mycompass/wp-json/xophz-freshmints/v1/social/fetch';

const postFor = (platform: ServerFeedPlatform): RawSocialPost => ({
  id: `${platform}-1`,
  platform,
  externalId: '1',
  author: 'Pat',
  title: 'Is an annuity worth it?',
  content: 'Weighing a fixed indexed annuity against bonds.',
  url: `https://example.test/${platform}/1`,
  timestamp: '2026-10-09T12:00:00.000Z',
  score: 2,
  commentsCount: 1,
  subredditOrChannel: 'channel-name',
});

const makeRule = (overrides: Partial<SocialMonitorRule> = {}): SocialMonitorRule => ({
  id: 'rule-test',
  name: 'Test rule',
  keywords: ['annuity', 'MYGA'],
  negativeKeywords: [],
  platforms: ['reddit', 'youtube', 'stack_exchange'],
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

const PLATFORMS: readonly { platform: ServerFeedPlatform; displayName: string; label: string }[] = [
  { platform: 'reddit', displayName: 'Reddit (Public JSON Feed)', label: 'Reddit' },
  { platform: 'youtube', displayName: 'YouTube Comments', label: 'YouTube' },
  { platform: 'stack_exchange', displayName: 'Stack Exchange: Personal Finance & Money', label: 'Stack Exchange' },
];

describe.each(PLATFORMS)('createServerFeedProvider($platform)', ({ platform, displayName, label }) => {
  const fetchMock = vi.fn();
  const provider = createServerFeedProvider(platform, displayName);

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

  it('identifies itself by platform and display name and is always configured', () => {
    expect(provider.id).toBe(platform);
    expect(provider.displayName).toBe(displayName);
    expect(provider.isConfigured()).toBe(true);
  });

  it('posts to the server route with the nonce and this platform in the body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));

    await provider.fetchPosts(makeRule());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ROUTE_URL);
    expect(init.method).toBe('POST');
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(init.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body);
    expect(body.platform).toBe(platform);
    expect(body.keywords).toEqual(['annuity', 'MYGA']);
  });

  it('maps a server ok outcome to its posts', async () => {
    const post = postFor(platform);
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [post] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'ok', posts: [post] });
  });

  it('passes a server blocked outcome through with its reason', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'blocked', reason: `${label} could not be reached.` }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'blocked', reason: `${label} could not be reached.` });
  });

  it('passes a server failed outcome through with its reason', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'failed', reason: `${label} is not configured.` }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'failed', reason: `${label} is not configured.` });
  });

  it('maps a thrown fetch to blocked and names the platform', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({
      status: 'blocked',
      reason: `The Fresh Mints server could not be reached for the ${label} search (Failed to fetch).`,
    });
  });

  it('maps an HTTP 500 to failed, naming the platform and the status', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({
      status: 'failed',
      reason: `The ${label} search route returned HTTP 500.`,
    });
  });

  it('surfaces the WordPress error message on a non-2xx response when one is present', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'rest_forbidden', message: 'Not allowed.' }, 403));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({
      status: 'failed',
      reason: `The ${label} search route returned HTTP 403: Not allowed.`,
    });
  });

  it('maps a 200 response that is not JSON to failed', async () => {
    fetchMock.mockResolvedValue(new Response('<html>not json</html>', { status: 200 }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('maps a 200 response with an unrecognized shape to failed', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ posts: [postFor(platform)] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('rejects an ok response that contains a malformed post instead of ingesting it', async () => {
    const malformed = { ...postFor(platform), url: undefined };
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [postFor(platform), malformed] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('rejects an ok response whose post claims a different platform', async () => {
    const otherPlatform = PLATFORMS.find((entry) => entry.platform !== platform)!.platform;
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [postFor(otherPlatform)] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('makes no request when the rule does not target this platform', async () => {
    const outcome = await provider.fetchPosts(makeRule({ platforms: ['hacker_news'] }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(outcome).toEqual({ status: 'ok', posts: [] });
  });

  it('makes no request when the rule has no keywords', async () => {
    const outcome = await provider.fetchPosts(makeRule({ keywords: [] }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(outcome).toEqual({ status: 'ok', posts: [] });
  });
});

describe('createServerFeedProvider target channels', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const sentChannels = (): unknown => JSON.parse(fetchMock.mock.calls[0][1].body).targetChannels;

  it('sends the rule subreddits for reddit', async () => {
    await createServerFeedProvider('reddit', 'Reddit').fetchPosts(makeRule());

    expect(sentChannels()).toEqual(['retirement', 'personalfinance']);
  });

  it('sends an empty list for reddit when the rule has no subreddits', async () => {
    await createServerFeedProvider('reddit', 'Reddit').fetchPosts(makeRule({ targetSubreddits: undefined }));

    expect(sentChannels()).toEqual([]);
  });

  it('sends an empty list for youtube even when the rule carries subreddits', async () => {
    await createServerFeedProvider('youtube', 'YouTube Comments').fetchPosts(makeRule());

    expect(sentChannels()).toEqual([]);
  });

  it('sends an empty list for stack_exchange even when the rule carries subreddits', async () => {
    await createServerFeedProvider('stack_exchange', 'Stack Exchange').fetchPosts(makeRule());

    expect(sentChannels()).toEqual([]);
  });
});

describe('RedditPublicProvider delegation', () => {
  const fetchMock = vi.fn();
  const provider = new RedditPublicProvider();

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

  it('keeps its id and display name', () => {
    expect(provider.id).toBe('reddit');
    expect(provider.displayName).toBe('Reddit (Public JSON Feed)');
    expect(provider.isConfigured()).toBe(true);
  });

  it('keeps its exact failure wording', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'failed', reason: 'The Reddit search route returned HTTP 500.' });
  });

  it('keeps its exact unreachable wording', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({
      status: 'blocked',
      reason: 'The Fresh Mints server could not be reached for the Reddit search (Failed to fetch).',
    });
  });
});
