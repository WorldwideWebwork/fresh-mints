import { describe, it, expect } from 'vitest';
import { SocialIntentAnalyzer } from './social-intent-analyzer';
import type { RawSocialPost, SocialMonitorRule } from './types';

const makePost = (overrides: Partial<RawSocialPost> = {}): RawSocialPost => ({
  id: 'reddit-abc',
  platform: 'reddit',
  externalId: 'abc',
  author: 'u/dr_dana',
  title: 'Looking for a web designer for my dental practice in Tempe, Arizona',
  content: 'Our website is out of date and we need website help soon.',
  url: 'https://www.reddit.com/r/smallbusiness/comments/abc/x/',
  timestamp: '2026-10-09T12:00:00.000Z',
  score: 3,
  commentsCount: 1,
  subredditOrChannel: 'r/smallbusiness',
  ...overrides,
});

const makeRule = (overrides: Partial<SocialMonitorRule> = {}): SocialMonitorRule => ({
  id: 'rule-web-upgrade',
  name: 'Website Redesign & Upgrades',
  keywords: ['website', 'web design'],
  negativeKeywords: ['job'],
  platforms: ['reddit'],
  minIntentScore: 50,
  isActive: true,
  autoConvertToCrm: false,
  createdAt: '2026-10-09T00:00:00.000Z',
  ...overrides,
});

// The website pitch exactly as the analyzer produced it before per-rule templates existed.
const LEGACY_PITCH =
  'Hey u/dr_dana, saw your post regarding "Looking for a web designer for my dental practice in Tempe, ...". Fresh Mints builds turnkey high-speed hosted websites with zero setup fees and 24 months included cloud hosting. Here is a live sandbox preview tailored to your field.';

// A rule as saved in localStorage before pitchTemplate, appendFunnelLink and funnelBaseUrl existed.
const LEGACY_SAVED_RULE_JSON = JSON.stringify({
  id: 'rule-web-upgrade',
  name: 'Website Redesign & Upgrades',
  keywords: ['website', 'web design', 'landing page'],
  negativeKeywords: ['job', 'internship'],
  platforms: ['hacker_news', 'reddit'],
  minIntentScore: 50,
  isActive: true,
  autoConvertToCrm: false,
  createdAt: '2026-10-01T00:00:00.000Z',
});

describe('SocialIntentAnalyzer.evaluatePost: backward compatibility', () => {
  it('produces the website pitch byte for byte for a rule saved before the new fields existed', () => {
    const legacyRule: SocialMonitorRule = JSON.parse(LEGACY_SAVED_RULE_JSON);

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), legacyRule);

    expect(lead).not.toBeNull();
    expect(lead?.suggestedPitch).toBe(LEGACY_PITCH);
  });

  it('keeps the legacy pain point fallback for a rule with no template', () => {
    const post = makePost({ title: 'My site is old', content: 'Thinking about a new website' });

    const lead = SocialIntentAnalyzer.evaluatePost(post, makeRule());

    expect(lead?.detectedPainPoint).toBe('Exploring web development and hosting upgrade');
  });

  it('adds no funnel keys to a lead built from a rule that lacks them', () => {
    const legacyRule: SocialMonitorRule = JSON.parse(LEGACY_SAVED_RULE_JSON);

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), legacyRule);

    expect(lead).not.toBeNull();
    expect(lead).not.toHaveProperty('appendFunnelLink');
    expect(lead).not.toHaveProperty('funnelBaseUrl');
  });

  it('treats a whitespace-only pitchTemplate as unset and uses the website pitch', () => {
    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), makeRule({ pitchTemplate: '   \n ' }));

    expect(lead?.suggestedPitch).toBe(LEGACY_PITCH);
  });
});

describe('SocialIntentAnalyzer.evaluatePost: per-rule pitch template', () => {
  it('uses the rule template instead of the website pitch', () => {
    const rule = makeRule({ pitchTemplate: 'Plain education text with no placeholders.' });

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), rule);

    expect(lead?.suggestedPitch).toBe('Plain education text with no placeholders.');
    expect(lead?.suggestedPitch).not.toContain('Fresh Mints');
  });

  it('substitutes {author} and {title}, every occurrence, with the untruncated title', () => {
    const rule = makeRule({ pitchTemplate: 'Hi {author}. Re: {title}. Thanks, {author}.' });

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), rule);

    expect(lead?.suggestedPitch).toBe(
      'Hi u/dr_dana. Re: Looking for a web designer for my dental practice in Tempe, Arizona. Thanks, u/dr_dana.',
    );
  });

  it('leaves unknown placeholders untouched', () => {
    const rule = makeRule({ pitchTemplate: 'Hello {author} {unknown}' });

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), rule);

    expect(lead?.suggestedPitch).toBe('Hello u/dr_dana {unknown}');
  });

  it('inserts post text literally, never as a replacement pattern', () => {
    const post = makePost({ title: 'Costs $& more, see $1 and $$ website' });
    const rule = makeRule({ pitchTemplate: 'Re: {title}' });

    const lead = SocialIntentAnalyzer.evaluatePost(post, rule);

    expect(lead?.suggestedPitch).toBe('Re: Costs $& more, see $1 and $$ website');
  });

  it('does not expand a placeholder that appears inside the post title', () => {
    const post = makePost({ title: 'What does {author} mean on a website' });
    const rule = makeRule({ pitchTemplate: '{title} / {author}' });

    const lead = SocialIntentAnalyzer.evaluatePost(post, rule);

    expect(lead?.suggestedPitch).toBe('What does {author} mean on a website / u/dr_dana');
  });

  it('describes the pain point from the matched keyword when a template rule matches no intent phrase', () => {
    const post = makePost({ title: 'Question about annuity types', content: 'What is the difference?' });
    const rule = makeRule({ keywords: ['annuity'], pitchTemplate: 'Hi {author}' });

    const lead = SocialIntentAnalyzer.evaluatePost(post, rule);

    expect(lead?.detectedPainPoint).toBe('Mentions "annuity"');
  });
});

describe('SocialIntentAnalyzer.evaluatePost: funnel fields', () => {
  it('copies appendFunnelLink false from the rule onto the lead', () => {
    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), makeRule({ appendFunnelLink: false }));

    expect(lead?.appendFunnelLink).toBe(false);
  });

  it('copies funnelBaseUrl from the rule onto the lead', () => {
    const rule = makeRule({ funnelBaseUrl: 'https://example.org/start' });

    const lead = SocialIntentAnalyzer.evaluatePost(makePost(), rule);

    expect(lead?.funnelBaseUrl).toBe('https://example.org/start');
  });
});

describe('SocialIntentAnalyzer.evaluatePost: keyword gating', () => {
  it('returns null when the post matches none of the rule keywords, even with a low threshold', () => {
    const post = makePost({
      title: 'Looking for a recommendation, need agency',
      content: 'Anyone know a good plumber? Looking for someone to hire someone soon.',
    });
    const rule = makeRule({ keywords: ['annuity', 'myga'], minIntentScore: 10 });

    expect(SocialIntentAnalyzer.evaluatePost(post, rule)).toBeNull();
  });

  it('returns null when the rule has no keywords', () => {
    expect(SocialIntentAnalyzer.evaluatePost(makePost(), makeRule({ keywords: [] }))).toBeNull();
  });

  it('does not let a blank keyword match every post', () => {
    const post = makePost({ title: 'Plumber needed', content: 'Leaking pipe' });

    expect(SocialIntentAnalyzer.evaluatePost(post, makeRule({ keywords: ['', '   '] }))).toBeNull();
  });

  it('matches keywords case-insensitively and reports the rule keyword that matched', () => {
    const post = makePost({ title: 'Thoughts on a MYGA?', content: 'Shopping around.' });
    const rule = makeRule({ keywords: ['annuity', 'myga'] });

    const lead = SocialIntentAnalyzer.evaluatePost(post, rule);

    expect(lead?.matchedKeyword).toBe('myga');
  });

  it('still rejects a post containing a negative keyword', () => {
    const post = makePost({ title: 'Website job opening', content: 'We are hiring.' });

    expect(SocialIntentAnalyzer.evaluatePost(post, makeRule())).toBeNull();
  });

  it('still rejects a matching post whose score is below the rule threshold', () => {
    const post = makePost({ title: 'Question', content: 'Is a website worth it?' });

    expect(SocialIntentAnalyzer.evaluatePost(post, makeRule({ minIntentScore: 90 }))).toBeNull();
  });
});
