import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedditPublicProvider } from './reddit-public-provider';
import type { RawSocialPost, SocialMonitorRule } from '../types';

const serverPost: RawSocialPost = {
  id: 'reddit-abc',
  platform: 'reddit',
  externalId: 'abc',
  author: 'u/someone',
  title: 'Need website for my practice',
  content: 'Looking for a recommendation.',
  url: 'https://www.reddit.com/r/smallbusiness/comments/abc/x/',
  timestamp: '2026-10-09T12:00:00.000Z',
  score: 3,
  commentsCount: 1,
  subredditOrChannel: 'r/smallbusiness',
};

const makeRule = (overrides: Partial<SocialMonitorRule> = {}): SocialMonitorRule => ({
  id: 'rule-test',
  name: 'Test rule',
  keywords: ['need website', 'landing page'],
  negativeKeywords: [],
  platforms: ['reddit'],
  targetSubreddits: ['smallbusiness', 'entrepreneur'],
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

describe('RedditPublicProvider', () => {
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

  it('posts to the server fetch route with the nonce and JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));

    await provider.fetchPosts(makeRule());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://mycompass/wp-json/xophz-freshmints/v1/social/fetch');
    expect(init.method).toBe('POST');
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({
      platform: 'reddit',
      keywords: ['need website', 'landing page'],
      targetChannels: ['smallbusiness', 'entrepreneur'],
    });
  });

  it('forwards every target channel, not only the first', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));
    const channels = ['retirement', 'personalfinance', 'fednews', 'ThriftSavingsPlan'];

    await provider.fetchPosts(makeRule({ targetSubreddits: channels }));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.targetChannels).toEqual(channels);
  });

  it('sends an empty channel list when the rule has none, leaving the default to the server', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));

    await provider.fetchPosts(makeRule({ targetSubreddits: undefined }));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.targetChannels).toEqual([]);
  });

  it('falls back to /wp-json/ and an empty nonce when wpApiSettings is absent', async () => {
    vi.stubGlobal('window', {});
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [] }));

    await provider.fetchPosts(makeRule());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/wp-json/xophz-freshmints/v1/social/fetch');
    expect(init.headers['X-WP-Nonce']).toBe('');
  });

  it('maps a server ok outcome to its posts', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [serverPost] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'ok', posts: [serverPost] });
  });

  it('passes a server failed outcome through with its reason', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: 'failed', reason: 'Reddit is disabled pending commercial API terms.' }),
    );

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({
      status: 'failed',
      reason: 'Reddit is disabled pending commercial API terms.',
    });
  });

  it('passes a server blocked outcome through with its reason', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'blocked', reason: 'Server could not reach Reddit.' }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome).toEqual({ status: 'blocked', reason: 'Server could not reach Reddit.' });
  });

  it('maps a thrown fetch to blocked', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('blocked');
    if (outcome.status === 'blocked') {
      expect(outcome.reason).toContain('Failed to fetch');
    }
  });

  it('maps an HTTP 500 to failed and names the status', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500, statusText: 'Internal Server Error' }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
    if (outcome.status === 'failed') {
      expect(outcome.reason).toContain('500');
    }
  });

  it('surfaces the WordPress error message on a non-2xx response when one is present', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.' }, 403),
    );

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
    if (outcome.status === 'failed') {
      expect(outcome.reason).toContain('403');
      expect(outcome.reason).toContain('Sorry, you are not allowed to do that.');
    }
  });

  it('maps a 200 response that is not JSON to failed', async () => {
    fetchMock.mockResolvedValue(new Response('<html>not json</html>', { status: 200 }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('maps a 200 response with an unrecognized shape to failed', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ posts: [serverPost] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('maps an ok response containing a malformed post to failed rather than ingesting it', async () => {
    const malformed = { ...serverPost, url: undefined };
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', posts: [serverPost, malformed] }));

    const outcome = await provider.fetchPosts(makeRule());

    expect(outcome.status).toBe('failed');
  });

  it('makes no request when the rule does not target reddit', async () => {
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
