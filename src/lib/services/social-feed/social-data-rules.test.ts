import { describe, it, expect, vi } from 'vitest';
import type { SocialLead } from './types';
import {
  applySocialDataRules,
  describeDataRulesRun,
  socialDispatchBlockReason,
  type SocialLeadHost,
} from './social-data-rules';
import type { LiveCheck, LiveCheckOutcome, SocialDataRulesRun } from './social-retention';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const daysAgo = (days: number): string => new Date(NOW.getTime() - days * 86_400_000).toISOString();

const redditLead = (externalId: string, overrides: Partial<SocialLead> = {}): SocialLead => ({
  id: `lead-${externalId}`,
  rawPost: {
    id: `reddit-${externalId}`,
    platform: 'reddit',
    externalId,
    author: 'u/some.user',
    title: 'Need website help',
    content: '',
    url: `https://www.reddit.com/r/smallbusiness/comments/${externalId}/x/`,
    timestamp: daysAgo(3),
  },
  matchedRuleId: 'rule-1',
  matchedKeyword: 'website',
  intentScore: 68,
  detectedPainPoint: 'looking for',
  suggestedPitch: 'A reply body.',
  status: 'radar',
  evaluatedAt: daysAgo(2),
  ...overrides,
});

const makeHost = (initial: SocialLead[]) => {
  let leads = initial;
  const notices: { kind: string; title: string; message: string }[] = [];
  const host: SocialLeadHost = {
    leads: () => leads,
    remove: (ids) => {
      leads = leads.filter((lead) => !ids.has(lead.id));
    },
    notify: (kind, title, message) => void notices.push({ kind, title, message }),
  };
  const add = (lead: SocialLead) => void (leads = [lead, ...leads]);
  return { host, notices, add, current: () => leads };
};

const ok = (live: string[], gone: string[] = []): LiveCheckOutcome => ({ status: 'ok', live, gone });
const deps = (check: LiveCheck, days = 30) => ({ retentionDays: async () => days, check, now: () => NOW });

describe('applySocialDataRules', () => {
  it('removes expired leads and leads Reddit says are gone, and says so', async () => {
    const { host, notices, current } = makeHost([
      redditLead('aaa111'),
      redditLead('bbb222'),
      redditLead('old999', { evaluatedAt: daysAgo(45) }),
    ]);
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok(['aaa111'], ['bbb222']));

    await applySocialDataRules(host, deps(check));

    expect(current().map((lead) => lead.id)).toEqual(['lead-aaa111']);
    expect(notices).toEqual([
      { kind: 'info', title: 'Reddit Posts Removed', message: '1 lead(s) dropped: the post was deleted or removed on Reddit.' },
    ]);
  });

  it('uses the retention window the server gave', async () => {
    const { host, current } = makeHost([redditLead('aaa111', { evaluatedAt: daysAgo(10) })]);
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok(['aaa111']));

    await applySocialDataRules(host, deps(check, 7));

    expect(current()).toEqual([]);
    expect(check).not.toHaveBeenCalled();
  });

  it('keeps the leads and says why when Reddit cannot be asked', async () => {
    const { host, notices, current } = makeHost([redditLead('aaa111')]);
    const check = vi.fn<LiveCheck>().mockResolvedValue({ status: 'unavailable', code: 'not_configured', reason: 'Reddit is not configured.' });

    await applySocialDataRules(host, deps(check));

    expect(current()).toHaveLength(1);
    expect(notices).toEqual([
      { kind: 'info', title: 'Reddit Posts Not Re-checked', message: '1 Reddit lead(s) could not be re-checked: Reddit is not configured.' },
    ]);
  });

  it('does nothing, and asks nothing, when there are no leads', async () => {
    const { host, notices } = makeHost([]);
    const retentionDays = vi.fn(async () => 30);
    const check = vi.fn<LiveCheck>();

    await applySocialDataRules(host, { retentionDays, check, now: () => NOW });

    expect(retentionDays).not.toHaveBeenCalled();
    expect(check).not.toHaveBeenCalled();
    expect(notices).toEqual([]);
  });

  it('says nothing when everything is live', async () => {
    const { host, notices, current } = makeHost([redditLead('aaa111')]);
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok(['aaa111']));

    await applySocialDataRules(host, deps(check));

    expect(current()).toHaveLength(1);
    expect(notices).toEqual([]);
  });

  it('reports a failure while applying the rules instead of throwing', async () => {
    const { host, notices } = makeHost([redditLead('aaa111')]);
    host.remove = () => {
      throw new Error('storage is full');
    };
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok([], ['aaa111']));

    await expect(applySocialDataRules(host, deps(check))).resolves.toBeUndefined();

    expect(notices).toEqual([
      { kind: 'error', title: 'Social Radar Data Rules', message: 'Could not apply the retention rules: storage is full' },
    ]);
  });

  it('keeps leads that arrive while it is waiting on the server', async () => {
    const { host, add, current } = makeHost([redditLead('aaa111')]);
    const check = vi.fn<LiveCheck>().mockImplementation(async () => {
      add(redditLead('late777'));
      return ok([], ['aaa111']);
    });

    await applySocialDataRules(host, deps(check));

    expect(current().map((lead) => lead.id)).toEqual(['lead-late777']);
  });
});

describe('describeDataRulesRun', () => {
  const run = (over: Partial<SocialDataRulesRun>): SocialDataRulesRun => ({
    purgedIds: new Set(),
    goneIds: new Set(),
    unverifiedCount: 0,
    problem: null,
    ...over,
  });

  it('is quiet for a run that dropped nothing and checked everything', () => {
    expect(describeDataRulesRun(run({ purgedIds: new Set(['a']) }))).toEqual([]);
  });

  it('says nothing about a problem when no Reddit lead went unchecked', () => {
    expect(describeDataRulesRun(run({ problem: { code: 'failed', reason: 'x' } }))).toEqual([]);
  });
});

describe('socialDispatchBlockReason', () => {
  it('lets a confirmed live post through', async () => {
    const { host } = makeHost([redditLead('aaa111')]);
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok(['aaa111']));

    expect(await socialDispatchBlockReason(host, 'lead-aaa111', check)).toBeNull();
  });

  it('blocks a gone post and drops the lead', async () => {
    const { host, current } = makeHost([redditLead('aaa111'), redditLead('bbb222')]);
    const check = vi.fn<LiveCheck>().mockResolvedValue(ok([], ['aaa111']));

    const reason = await socialDispatchBlockReason(host, 'lead-aaa111', check);

    expect(reason).toContain('deleted or removed on Reddit');
    expect(current().map((lead) => lead.id)).toEqual(['lead-bbb222']);
  });

  it('blocks when Reddit cannot be asked, keeps the lead, and says why', async () => {
    const { host, current } = makeHost([redditLead('aaa111')]);
    const check = vi.fn<LiveCheck>().mockResolvedValue({ status: 'unavailable', code: 'rate_limited', reason: 'Reddit rate limit reached; try again in 20 seconds.', retryAfterSeconds: 20 });

    const reason = await socialDispatchBlockReason(host, 'lead-aaa111', check);

    expect(reason).toContain('Reddit rate limit reached; try again in 20 seconds.');
    expect(current()).toHaveLength(1);
  });

  it('blocks a lead that is no longer there without asking Reddit', async () => {
    const { host } = makeHost([]);
    const check = vi.fn<LiveCheck>();

    const reason = await socialDispatchBlockReason(host, 'lead-zzz', check);

    expect(reason).toContain('no longer on the radar');
    expect(check).not.toHaveBeenCalled();
  });

  it('lets a lead from another platform through without asking Reddit', async () => {
    const hackerNews = redditLead('hn1', { id: 'hn' });
    hackerNews.rawPost.platform = 'hacker_news';
    const { host } = makeHost([hackerNews]);
    const check = vi.fn<LiveCheck>();

    expect(await socialDispatchBlockReason(host, 'hn', check)).toBeNull();
    expect(check).not.toHaveBeenCalled();
  });
});
