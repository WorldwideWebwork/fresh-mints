import { describe, it, expect, vi } from 'vitest';
import type { SocialLead } from './types';
import {
  DEFAULT_RETENTION_DAYS,
  MAX_RETENTION_DAYS,
  MIN_RETENTION_DAYS,
  filterLiveSocialLeads,
  isLeadOpenForReply,
  isSocialLeadExpired,
  minimizeSocialLead,
  minimizeSocialLeads,
  normalizeRetentionDays,
  purgeExpiredSocialLeads,
  redditThreadLeadName,
  type LiveCheck,
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
    content: 'Looking for a website person, my budget is 2000 and my email is a@b.test.',
    url: 'https://www.reddit.com/r/smallbusiness/comments/abc123/x/',
    timestamp: '2026-10-09T12:00:00.000Z',
    score: 7,
    commentsCount: 12,
    subredditOrChannel: 'r/smallbusiness',
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

describe('isLeadOpenForReply', () => {
  it('is true only while the lead is on the radar', () => {
    expect(isLeadOpenForReply(makeLead({ status: 'radar' }))).toBe(true);
    expect(isLeadOpenForReply(makeLead({ status: 'converted' }))).toBe(false);
    expect(isLeadOpenForReply(makeLead({ status: 'dismissed' }))).toBe(false);
  });
});

describe('normalizeRetentionDays', () => {
  it('keeps a whole number inside the range', () => {
    expect(normalizeRetentionDays(30)).toBe(30);
    expect(normalizeRetentionDays(7)).toBe(7);
    expect(normalizeRetentionDays(MIN_RETENTION_DAYS)).toBe(MIN_RETENTION_DAYS);
    expect(normalizeRetentionDays(MAX_RETENTION_DAYS)).toBe(MAX_RETENTION_DAYS);
  });

  it('clamps to the range and floors fractions', () => {
    expect(normalizeRetentionDays(0)).toBe(MIN_RETENTION_DAYS);
    expect(normalizeRetentionDays(-9)).toBe(MIN_RETENTION_DAYS);
    expect(normalizeRetentionDays(5000)).toBe(MAX_RETENTION_DAYS);
    expect(normalizeRetentionDays(7.9)).toBe(7);
  });

  it('falls back to the default for anything that is not a finite number', () => {
    for (const value of [Number.NaN, Infinity, '7', null, undefined, {}, true]) {
      expect(normalizeRetentionDays(value)).toBe(DEFAULT_RETENTION_DAYS);
    }
  });
});

describe('minimizeSocialLead', () => {
  it('drops the post body and keeps only the allowed post fields', () => {
    const minimized = minimizeSocialLead(makeLead());

    expect(minimized.rawPost).toEqual({
      id: 'reddit-abc123',
      platform: 'reddit',
      externalId: 'abc123',
      author: 'u/some.user',
      title: 'Need website help',
      content: '',
      url: 'https://www.reddit.com/r/smallbusiness/comments/abc123/x/',
      timestamp: '2026-10-09T12:00:00.000Z',
      score: 7,
      subredditOrChannel: 'r/smallbusiness',
    });
    expect(JSON.stringify(minimized)).not.toContain('my budget');
    expect(minimized.rawPost).not.toHaveProperty('commentsCount');
  });

  it('keeps our own output: rule, keyword, intent score, pain point, draft reply, status, time', () => {
    const lead = makeLead({ status: 'radar', funnelBaseUrl: 'https://example.test/guide', attributeFunnelLink: true, appendFunnelLink: false });
    const minimized = minimizeSocialLead(lead);

    expect(minimized).toMatchObject({
      id: 'lead-social-1',
      matchedRuleId: 'rule-1',
      matchedKeyword: 'website',
      intentScore: 68,
      detectedPainPoint: 'looking for',
      suggestedPitch: 'A reply body.',
      status: 'radar',
      evaluatedAt: '2026-10-09T12:00:00.000Z',
      funnelBaseUrl: 'https://example.test/guide',
      attributeFunnelLink: true,
      appendFunnelLink: false,
    });
  });

  it('keeps the author handle only while the lead is open for a reply', () => {
    expect(minimizeSocialLead(makeLead({ status: 'radar' })).rawPost.author).toBe('u/some.user');
    expect(minimizeSocialLead(makeLead({ status: 'converted', convertedLeadId: 'lead-1' })).rawPost.author).toBe('');
    expect(minimizeSocialLead(makeLead({ status: 'dismissed' })).rawPost.author).toBe('');
  });

  it('takes the handle out of the draft reply when it drops the handle, and only then', () => {
    const pitch = 'Hey u/some.user, saw your post. u/some.user, a guide is ready.';
    const open = minimizeSocialLead(makeLead({ status: 'radar', suggestedPitch: pitch }));
    const closed = minimizeSocialLead(makeLead({ status: 'dismissed', suggestedPitch: pitch }));

    expect(open.suggestedPitch).toBe(pitch);
    expect(closed.suggestedPitch).toBe('Hey [author removed], saw your post. [author removed], a guide is ready.');
    expect(JSON.stringify(closed)).not.toContain('some.user');
    expect(minimizeSocialLead(closed).suggestedPitch).toBe(closed.suggestedPitch);
  });

  it('leaves the draft reply alone when there was no handle to remove', () => {
    const lead = makeLead({ status: 'converted', suggestedPitch: 'A reply body.' }, { author: '' });
    expect(minimizeSocialLead(lead).suggestedPitch).toBe('A reply body.');
  });

  it('keeps the converted CRM lead id', () => {
    const minimized = minimizeSocialLead(makeLead({ status: 'converted', convertedLeadId: 'lead-soc-9' }));
    expect(minimized.convertedLeadId).toBe('lead-soc-9');
  });

  it('keeps a score of zero and omits optional fields that were never set', () => {
    const lead = makeLead({}, { score: 0, subredditOrChannel: undefined });
    delete (lead.rawPost as { subredditOrChannel?: string }).subredditOrChannel;
    const minimized = minimizeSocialLead(lead);

    expect(minimized.rawPost.score).toBe(0);
    expect(minimized.rawPost).not.toHaveProperty('subredditOrChannel');
    expect(minimized).not.toHaveProperty('funnelBaseUrl');
    expect(minimized).not.toHaveProperty('convertedLeadId');
  });

  it('drops any field that is not on the list, on the lead and on the post', () => {
    const lead = {
      ...makeLead(),
      email: 'a@b.test',
      profile: { karma: 99 },
    } as SocialLead;
    (lead.rawPost as Record<string, unknown>).authorProfileUrl = 'https://www.reddit.com/user/some.user';
    (lead.rawPost as Record<string, unknown>).selftext = 'unlisted-selftext';
    const serialized = JSON.stringify(minimizeSocialLead(lead));

    for (const leaked of ['a@b.test', 'karma', 'authorProfileUrl', 'selftext', 'unlisted-selftext']) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it('does not change the lead it was given, and is idempotent', () => {
    const lead = makeLead();
    const snapshot = JSON.stringify(lead);
    const once = minimizeSocialLead(lead);

    expect(JSON.stringify(lead)).toBe(snapshot);
    expect(minimizeSocialLead(once)).toEqual(once);
  });

  it('minimizes every lead in a list', () => {
    const minimized = minimizeSocialLeads([makeLead(), makeLead({ id: 'lead-2', status: 'dismissed' })]);
    expect(minimized.map((lead) => lead.rawPost.content)).toEqual(['', '']);
    expect(minimized.map((lead) => lead.rawPost.author)).toEqual(['u/some.user', '']);
  });
});

describe('purgeExpiredSocialLeads', () => {
  it('keeps a lead taken in inside the window and purges one past it', () => {
    const fresh = makeLead({ id: 'fresh', evaluatedAt: daysAgo(29) });
    const stale = makeLead({ id: 'stale', evaluatedAt: daysAgo(31) });

    const kept = purgeExpiredSocialLeads([fresh, stale], NOW, 30);

    expect(kept.map((lead) => lead.id)).toEqual(['fresh']);
  });

  it('keeps a lead exactly at the window edge and purges one a millisecond older', () => {
    const edge = makeLead({ id: 'edge', evaluatedAt: daysAgo(30) });
    const past = makeLead({ id: 'past', evaluatedAt: new Date(NOW.getTime() - 30 * DAY_MS - 1).toISOString() });

    expect(isSocialLeadExpired(edge, NOW, 30)).toBe(false);
    expect(isSocialLeadExpired(past, NOW, 30)).toBe(true);
  });

  it('follows the window it is given', () => {
    const lead = makeLead({ evaluatedAt: daysAgo(10) });

    expect(purgeExpiredSocialLeads([lead], NOW, 7)).toEqual([]);
    expect(purgeExpiredSocialLeads([lead], NOW, 14)).toEqual([lead]);
  });

  it('uses the default window when the given one is not usable', () => {
    const inside = makeLead({ id: 'inside', evaluatedAt: daysAgo(29) });
    const outside = makeLead({ id: 'outside', evaluatedAt: daysAgo(31) });

    expect(purgeExpiredSocialLeads([inside, outside], NOW, Number.NaN).map((lead) => lead.id)).toEqual(['inside']);
  });

  it('measures from when we took the lead in, not from when the post was written', () => {
    const oldPostFreshLead = makeLead({ evaluatedAt: daysAgo(1) }, { timestamp: daysAgo(200) });
    expect(purgeExpiredSocialLeads([oldPostFreshLead], NOW, 30)).toEqual([oldPostFreshLead]);
  });

  it('falls back to the post time when the evaluation time is unreadable', () => {
    const readable = makeLead({ id: 'readable', evaluatedAt: 'not a date' }, { timestamp: daysAgo(5) });
    const stale = makeLead({ id: 'stale', evaluatedAt: '' }, { timestamp: daysAgo(60) });

    expect(purgeExpiredSocialLeads([readable, stale], NOW, 30).map((lead) => lead.id)).toEqual(['readable']);
  });

  it('purges a lead whose age cannot be read at all', () => {
    const unreadable = makeLead({ evaluatedAt: 'nope' }, { timestamp: 'nope' });
    expect(purgeExpiredSocialLeads([unreadable], NOW, 30)).toEqual([]);
  });

  it('purges converted and dismissed leads like any other', () => {
    const leads = [
      makeLead({ id: 'a', status: 'converted', evaluatedAt: daysAgo(40) }),
      makeLead({ id: 'b', status: 'dismissed', evaluatedAt: daysAgo(40) }),
      makeLead({ id: 'c', status: 'radar', evaluatedAt: daysAgo(40) }),
    ];
    expect(purgeExpiredSocialLeads(leads, NOW, 30)).toEqual([]);
  });

  it('returns a new array and leaves the input alone', () => {
    const leads = [makeLead({ evaluatedAt: daysAgo(1) })];
    const kept = purgeExpiredSocialLeads(leads, NOW, 30);

    expect(kept).not.toBe(leads);
    expect(leads).toHaveLength(1);
  });
});

describe('redditThreadLeadName', () => {
  it('names the thread, never a person', () => {
    expect(redditThreadLeadName('Need website help')).toBe('Reddit thread: Need website help');
  });

  it('shortens a long title and falls back to a plain label for an empty one', () => {
    const name = redditThreadLeadName(`  ${'x'.repeat(100)}  `);
    expect(name).toBe(`Reddit thread: ${'x'.repeat(60)}`);
    expect(redditThreadLeadName('   ')).toBe('Reddit thread');
  });
});

describe('minimizing saved data from older versions', () => {
  it('does not throw on a saved lead missing optional fields, and still drops the body', () => {
    const legacy = makeLead({ status: 'dismissed' });
    delete (legacy.rawPost as { externalId?: string }).externalId;
    delete (legacy.rawPost as { author?: string }).author;

    expect(() => minimizeSocialLead(legacy)).not.toThrow();
    expect(minimizeSocialLead(legacy).rawPost.content).toBe('');
  });

  it('leaves a Reddit lead with no saved post id unverified instead of throwing', async () => {
    const legacy = makeLead();
    delete (legacy.rawPost as { externalId?: string }).externalId;
    const check = vi.fn<LiveCheck>();

    const result = await filterLiveSocialLeads([legacy], check);

    expect(result.unverified).toEqual([legacy]);
    expect(check).not.toHaveBeenCalled();
  });
});

