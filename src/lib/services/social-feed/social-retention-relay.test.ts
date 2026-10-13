import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRedditPostsLive, fetchRetentionDays, parseLiveCheckResponse } from './social-retention-relay';

const LIVE_CHECK_URL = 'http://mycompass/wp-json/xophz-freshmints/v1/social/live-check';
const RETENTION_URL = 'http://mycompass/wp-json/xophz-freshmints/v1/social/retention';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fetchMock = vi.fn();
const store = new Map<string, string>();

beforeEach(() => {
  fetchMock.mockReset();
  store.clear();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('window', { wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' } });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseLiveCheckResponse', () => {
  it('reads the verdicts the server sends', () => {
    const outcome = parseLiveCheckResponse({
      status: 'ok',
      live: ['aaa111'],
      gone: [{ id: 'bbb222', reason: 'deleted' }, { id: 'ccc333', reason: 'not_returned' }],
      invalid: [],
    });

    expect(outcome).toEqual({ status: 'ok', live: ['aaa111'], gone: ['bbb222', 'ccc333'] });
  });

  it('reads a failed answer with its code, reason and retry delay', () => {
    const outcome = parseLiveCheckResponse({
      status: 'failed',
      code: 'rate_limited',
      reason: 'Reddit rate limit reached; try again in 40 seconds.',
      retryAfterSeconds: 40,
    });

    expect(outcome).toEqual({
      status: 'unavailable',
      code: 'rate_limited',
      reason: 'Reddit rate limit reached; try again in 40 seconds.',
      retryAfterSeconds: 40,
    });
  });

  it('reads a blocked answer and one with no retry delay', () => {
    const outcome = parseLiveCheckResponse({ status: 'blocked', code: 'unreachable', reason: 'Reddit is unreachable from the server.' });
    expect(outcome).toEqual({ status: 'unavailable', code: 'unreachable', reason: 'Reddit is unreachable from the server.' });
    expect(outcome).not.toHaveProperty('retryAfterSeconds');
  });

  it('treats anything it cannot read as unavailable, never as live or gone', () => {
    const unreadable = [
      null,
      'ok',
      [],
      {},
      { status: 'ok' },
      { status: 'ok', live: 'aaa111', gone: [] },
      { status: 'ok', live: [1], gone: [] },
      { status: 'ok', live: [], gone: ['bbb222'] },
      { status: 'ok', live: [], gone: [{ reason: 'deleted' }] },
      { status: 'failed' },
      { status: 'failed', code: 'bogus', reason: 'x' },
      { status: 'failed', code: 'failed', reason: '' },
    ];

    for (const body of unreadable) {
      const outcome = parseLiveCheckResponse(body);
      expect(outcome.status).toBe('unavailable');
    }
  });

  it('drops a retry delay that is not a positive number', () => {
    const outcome = parseLiveCheckResponse({ status: 'failed', code: 'rate_limited', reason: 'x', retryAfterSeconds: -3 });
    expect(outcome).not.toHaveProperty('retryAfterSeconds');
  });
});

describe('checkRedditPostsLive', () => {
  it('posts the ids with the REST nonce', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', live: ['aaa111'], gone: [], invalid: [] }));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(LIVE_CHECK_URL);
    expect(init.method).toBe('POST');
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(JSON.parse(init.body)).toEqual({ ids: ['aaa111'] });
    expect(outcome).toEqual({ status: 'ok', live: ['aaa111'], gone: [] });
  });

  it('passes a server "not configured" through', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'failed', code: 'not_configured', reason: 'Reddit is not configured.' }));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(outcome).toEqual({ status: 'unavailable', code: 'not_configured', reason: 'Reddit is not configured.' });
  });

  it('reports an unreachable server instead of throwing', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(outcome).toEqual({ status: 'unavailable', code: 'unreachable', reason: 'offline' });
  });

  it('reports a refused request with the WordPress message', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.' }, 403));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(outcome).toEqual({ status: 'unavailable', code: 'failed', reason: 'Sorry, you are not allowed to do that.' });
  });

  it('reports the HTTP status when the refusal has no message', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 502 }));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(outcome).toEqual({ status: 'unavailable', code: 'failed', reason: 'The server answered HTTP 502.' });
  });

  it('treats a 200 with an unreadable body as unavailable', async () => {
    fetchMock.mockResolvedValue(new Response('not json', { status: 200 }));

    const outcome = await checkRedditPostsLive(['aaa111']);

    expect(outcome.status).toBe('unavailable');
  });
});

describe('fetchRetentionDays', () => {
  it('reads the server setting with the nonce and remembers it', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ retentionDays: 14 }));

    const days = await fetchRetentionDays();

    expect(days).toBe(14);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(RETENTION_URL);
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(store.get('fresh_mints_social_retention_days')).toBe('14');
  });

  it('clamps a value outside the allowed range', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ retentionDays: 5000 }));
    expect(await fetchRetentionDays()).toBe(90);
  });

  it('falls back to the last value it read when the server fails', async () => {
    store.set('fresh_mints_social_retention_days', '7');
    fetchMock.mockRejectedValue(new Error('offline'));

    expect(await fetchRetentionDays()).toBe(7);
  });

  it('falls back to the 30-day default with nothing remembered', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'rest_forbidden' }, 403));

    expect(await fetchRetentionDays()).toBe(30);
  });

  it('ignores an unusable answer and a remembered value that is not a number', async () => {
    store.set('fresh_mints_social_retention_days', 'soon');
    fetchMock.mockResolvedValue(jsonResponse({ retentionDays: 'thirty' }));

    expect(await fetchRetentionDays()).toBe(30);
    expect(store.get('fresh_mints_social_retention_days')).toBe('soon');
  });

  it('still answers when browser storage is missing', async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', { wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'n' } });
    fetchMock.mockResolvedValue(jsonResponse({ retentionDays: 21 }));

    expect(await fetchRetentionDays()).toBe(21);
  });
});
