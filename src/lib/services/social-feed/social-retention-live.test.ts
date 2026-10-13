import { describe, it, expect, vi } from 'vitest';
import type { SocialLead } from './types';
import {
  LIVE_CHECK_BATCH_SIZE,
  dispatchBlockReason,
  enforceSocialDataRules,
  filterLiveSocialLeads,
  type LiveCheck,
  type LiveCheckOutcome,
} from './social-retention';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number): string => new Date(NOW.getTime() - days * DAY_MS).toISOString();

const makeLead = (overrides: Partial<SocialLead> = {}, post: Partial<SocialLead['rawPost']> = {}): SocialLead => ({
  id: 'lead-social-1',
  rawPost: {
    id: 'reddit-abc123',
    platform: 'reddit',
    externalId: 'abc123',
    author: 'u/some.user',
    title: 'Need website help',
    content: '',
    url: 'https://www.reddit.com/r/smallbusiness/comments/abc123/x/',
    timestamp: '2026-10-09T12:00:00.000Z',
    ...post,
  },
  matchedRuleId: 'rule-1',
  matchedKeyword: 'website',
  intentScore: 68,
  detectedPainPoint: 'looking for',
  suggestedPitch: 'A reply body.',
  status: 'radar',
  evaluatedAt: '2026-10-09T12:00:00.000Z',
  ...overrides,
});

const redditLead = (externalId: string, overrides: Partial<SocialLead> = {}): SocialLead =>
  makeLead({ id: `lead-${externalId}`, ...overrides }, { id: `reddit-${externalId}`, externalId });

const okOutcome = (live: string[], gone: string[] = []): LiveCheckOutcome => ({ status: 'ok', live, gone });
const unavailable = (code: 'not_configured' | 'rate_limited' | 'unreachable' | 'failed', reason: string, retryAfterSeconds?: number): LiveCheckOutcome => ({
  status: 'unavailable',
  code,
  reason,
  ...(retryAfterSeconds !== undefined && { retryAfterSeconds }),
});

describe('filterLiveSocialLeads', () => {
  it('sorts Reddit leads into live and gone by what the server said', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111'], ['bbb222']));
    const leads = [redditLead('aaa111'), redditLead('bbb222')];

    const result = await filterLiveSocialLeads(leads, check);

    expect(result.live.map((lead) => lead.rawPost.externalId)).toEqual(['aaa111']);
    expect(result.gone.map((lead) => lead.rawPost.externalId)).toEqual(['bbb222']);
    expect(result.unverified).toEqual([]);
    expect(result.problem).toBeNull();
    expect(check).toHaveBeenCalledWith(['aaa111', 'bbb222']);
  });

  it('checks converted and dismissed Reddit leads too', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome([], ['aaa111', 'bbb222']));
    const leads = [redditLead('aaa111', { status: 'converted' }), redditLead('bbb222', { status: 'dismissed' })];

    const result = await filterLiveSocialLeads(leads, check);

    expect(result.gone).toHaveLength(2);
  });

  it('does not guess: a post the server did not mention is unverified, not live and not gone', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111']));

    const result = await filterLiveSocialLeads([redditLead('aaa111'), redditLead('ccc333')], check);

    expect(result.live.map((lead) => lead.rawPost.externalId)).toEqual(['aaa111']);
    expect(result.unverified.map((lead) => lead.rawPost.externalId)).toEqual(['ccc333']);
    expect(result.gone).toEqual([]);
  });

  it('leaves leads from other platforms alone and does not ask the server about them', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome([]));
    const hackerNews = makeLead({ id: 'hn' }, { platform: 'hacker_news', id: 'hn-1', externalId: '1' });

    const result = await filterLiveSocialLeads([hackerNews], check);

    expect(result.live).toEqual([hackerNews]);
    expect(check).not.toHaveBeenCalled();
  });

  it('asks only about the Reddit leads in a mixed list and keeps the original order', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111']));
    const hackerNews = makeLead({ id: 'hn' }, { platform: 'hacker_news', id: 'hn-1', externalId: '1' });
    const leads = [hackerNews, redditLead('aaa111'), makeLead({ id: 'yt' }, { platform: 'youtube', id: 'yt-1', externalId: 'v' })];

    const result = await filterLiveSocialLeads(leads, check);

    expect(check).toHaveBeenCalledWith(['aaa111']);
    expect(result.live.map((lead) => lead.id)).toEqual(['hn', 'lead-aaa111', 'yt']);
  });

  it('reports the problem and marks every Reddit lead unverified when the server cannot answer', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(unavailable('rate_limited', 'Reddit rate limit reached; try again in 40 seconds.', 40));
    const hackerNews = makeLead({ id: 'hn' }, { platform: 'hacker_news', id: 'hn-1', externalId: '1' });

    const result = await filterLiveSocialLeads([redditLead('aaa111'), hackerNews], check);

    expect(result.unverified.map((lead) => lead.rawPost.externalId)).toEqual(['aaa111']);
    expect(result.gone).toEqual([]);
    expect(result.live.map((lead) => lead.id)).toEqual(['hn']);
    expect(result.problem).toEqual({
      code: 'rate_limited',
      reason: 'Reddit rate limit reached; try again in 40 seconds.',
      retryAfterSeconds: 40,
    });
  });

  it('reports not configured without inventing a verdict', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(unavailable('not_configured', 'Reddit is not configured.'));

    const result = await filterLiveSocialLeads([redditLead('aaa111')], check);

    expect(result.problem).toEqual({ code: 'not_configured', reason: 'Reddit is not configured.' });
    expect(result.unverified).toHaveLength(1);
  });

  it('turns a thrown check into a failed problem instead of throwing', async () => {
    const check = vi.fn<LiveCheck>().mockRejectedValue(new Error('socket closed'));

    const result = await filterLiveSocialLeads([redditLead('aaa111')], check);

    expect(result.problem).toEqual({ code: 'failed', reason: 'socket closed' });
    expect(result.unverified).toHaveLength(1);
  });

  it('does not call the server when there is nothing to check', async () => {
    const check = vi.fn<LiveCheck>();

    const result = await filterLiveSocialLeads([], check);

    expect(result).toEqual({ live: [], gone: [], unverified: [], problem: null });
    expect(check).not.toHaveBeenCalled();
  });

  it('sends each post id once, lower-case, and sorts a lead with no post id as unverified', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111']));
    const leads = [redditLead('AAA111'), redditLead('aaa111', { id: 'second' }), redditLead('  ', { id: 'no-id' })];

    const result = await filterLiveSocialLeads(leads, check);

    expect(check).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledWith(['aaa111']);
    expect(result.live).toHaveLength(2);
    expect(result.unverified.map((lead) => lead.id)).toEqual(['no-id']);
  });

  it('asks in batches of at most 100 ids', async () => {
    const ids = Array.from({ length: 250 }, (_, index) => `p${index}`);
    const check = vi.fn<LiveCheck>().mockImplementation(async (batch) => okOutcome(batch));

    const result = await filterLiveSocialLeads(ids.map((id) => redditLead(id)), check);

    expect(LIVE_CHECK_BATCH_SIZE).toBe(100);
    expect(check.mock.calls.map(([batch]) => batch.length)).toEqual([100, 100, 50]);
    expect(result.live).toHaveLength(250);
  });

  it('stops at the first batch the server cannot answer and keeps the verdicts it already has', async () => {
    const ids = Array.from({ length: 250 }, (_, index) => `p${index}`);
    const check = vi
      .fn<LiveCheck>()
      .mockImplementationOnce(async (batch) => okOutcome(batch.slice(1), batch.slice(0, 1)))
      .mockResolvedValueOnce(unavailable('rate_limited', 'Reddit rate limit reached; try again in 30 seconds.', 30));

    const result = await filterLiveSocialLeads(ids.map((id) => redditLead(id)), check);

    expect(check).toHaveBeenCalledTimes(2);
    expect(result.gone.map((lead) => lead.rawPost.externalId)).toEqual(['p0']);
    expect(result.live).toHaveLength(99);
    expect(result.unverified).toHaveLength(150);
    expect(result.problem?.code).toBe('rate_limited');
  });
});

describe('dispatchBlockReason', () => {
  const confirmed = (lead: SocialLead) => ({ live: [lead], gone: [], unverified: [], problem: null });

  it('lets a confirmed live post through', () => {
    expect(dispatchBlockReason(confirmed(redditLead('aaa111')))).toBeNull();
  });

  it('blocks a gone post and says the lead was dropped', () => {
    const reason = dispatchBlockReason({ live: [], gone: [redditLead('aaa111')], unverified: [], problem: null });
    expect(reason).toContain('deleted or removed on Reddit');
    expect(reason).toContain('nothing was sent');
  });

  it('blocks an unverified post and repeats why the server could not say', () => {
    const reason = dispatchBlockReason({
      live: [],
      gone: [],
      unverified: [redditLead('aaa111')],
      problem: { code: 'not_configured', reason: 'Reddit is not configured.' },
    });
    expect(reason).toContain('Reddit is not configured.');
    expect(reason).toContain('Nothing was sent');
  });

  it('blocks an unverified post even when the server gave no reason', () => {
    const reason = dispatchBlockReason({ live: [], gone: [], unverified: [redditLead('aaa111')], problem: null });
    expect(reason).toContain('Could not confirm');
  });
});


describe('enforceSocialDataRules', () => {
  it('names the leads past the window and the Reddit posts Reddit says are gone', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111'], ['bbb222']));
    const leads = [
      redditLead('aaa111', { evaluatedAt: daysAgo(2) }),
      redditLead('bbb222', { evaluatedAt: daysAgo(2) }),
      redditLead('ccc333', { evaluatedAt: daysAgo(40) }),
    ];

    const run = await enforceSocialDataRules(leads, { now: NOW, retentionDays: 30, check });

    expect([...run.purgedIds]).toEqual(['lead-ccc333']);
    expect([...run.goneIds]).toEqual(['lead-bbb222']);
    expect(run.unverifiedCount).toBe(0);
    expect(run.problem).toBeNull();
  });

  it('does not ask Reddit about a lead that is leaving anyway', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(okOutcome(['aaa111']));
    const leads = [redditLead('aaa111', { evaluatedAt: daysAgo(1) }), redditLead('old999', { evaluatedAt: daysAgo(90) })];

    await enforceSocialDataRules(leads, { now: NOW, retentionDays: 30, check });

    expect(check).toHaveBeenCalledWith(['aaa111']);
  });

  it('keeps every lead and reports why when Reddit cannot be asked', async () => {
    const check = vi.fn<LiveCheck>().mockResolvedValue(unavailable('not_configured', 'Reddit is not configured.'));
    const leads = [redditLead('aaa111', { evaluatedAt: daysAgo(1) })];

    const run = await enforceSocialDataRules(leads, { now: NOW, retentionDays: 30, check });

    expect(run.goneIds.size).toBe(0);
    expect(run.purgedIds.size).toBe(0);
    expect(run.unverifiedCount).toBe(1);
    expect(run.problem).toEqual({ code: 'not_configured', reason: 'Reddit is not configured.' });
  });

  it('purges by the window even when there are no Reddit leads to check', async () => {
    const check = vi.fn<LiveCheck>();
    const hackerNews = makeLead({ id: 'hn', evaluatedAt: daysAgo(45) }, { platform: 'hacker_news', id: 'hn-1', externalId: '1' });

    const run = await enforceSocialDataRules([hackerNews], { now: NOW, retentionDays: 30, check });

    expect([...run.purgedIds]).toEqual(['hn']);
    expect(check).not.toHaveBeenCalled();
  });
});
