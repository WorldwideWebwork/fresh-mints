import { describe, it, expect } from 'vitest';
import { ANNUITY_DISCLOSURE, ANNUITY_PITCH_TEMPLATE, ANNUITY_RULE_PACK } from './annuity-rule-pack';
import { FUNNEL_LINK_PLACEHOLDER } from './funnel-link';
import { ANNUITY_EDUCATION_PRESET, createRuleFromPreset, isPresetInstalled } from './rule-presets';
import { SocialIntentAnalyzer } from './social-intent-analyzer';
import type { RawSocialPost } from './types';

const packRule = createRuleFromPreset(ANNUITY_RULE_PACK, new Date('2026-10-12T12:00:00.000Z'));

const makePost = (title: string, content: string, overrides: Partial<RawSocialPost> = {}): RawSocialPost => ({
  id: 'reddit-abc',
  platform: 'reddit',
  externalId: 'abc',
  author: 'u/pat_retired',
  title,
  content,
  url: 'https://www.reddit.com/r/retirement/comments/abc/post/',
  timestamp: '2026-10-12T12:00:00.000Z',
  subredditOrChannel: 'r/retirement',
  ...overrides,
});

const evaluate = (title: string, content: string) =>
  SocialIntentAnalyzer.evaluatePost(makePost(title, content), packRule);

describe('ANNUITY_RULE_PACK shape', () => {
  it('monitors the agreed keywords', () => {
    expect(ANNUITY_RULE_PACK.keywords).toEqual([
      'annuity',
      'annuities',
      'MYGA',
      'fixed indexed annuity',
      'CD vs annuity',
      'retirement income',
      'lump sum pension',
    ]);
  });

  it('targets Reddit, YouTube and Stack Exchange, and the four retirement subreddits', () => {
    expect(ANNUITY_RULE_PACK.platforms).toEqual(['reddit', 'youtube', 'stack_exchange']);
    expect(ANNUITY_RULE_PACK.targetSubreddits).toEqual([
      'retirement',
      'personalfinance',
      'financialplanning',
      'annuities',
    ]);
  });

  it('stays inside what the server routes accept', () => {
    const maxKeywords = 20;
    const maxKeywordLength = 100;
    const maxChannels = 10;

    expect(ANNUITY_RULE_PACK.keywords.length).toBeLessThanOrEqual(maxKeywords);
    expect(ANNUITY_RULE_PACK.keywords.every((keyword) => keyword.length <= maxKeywordLength)).toBe(true);
    expect(ANNUITY_RULE_PACK.targetSubreddits?.length).toBeLessThanOrEqual(maxChannels);
    const subredditNames = ANNUITY_RULE_PACK.targetSubreddits ?? [];
    expect(subredditNames.every((name) => /^[A-Za-z0-9_]{2,21}$/.test(name))).toBe(true);
  });

  it('has no blank or repeated keywords, and no keyword that is also a negative keyword', () => {
    const lowered = (terms: readonly string[]) => terms.map((term) => term.trim().toLowerCase());
    const keywords = lowered(ANNUITY_RULE_PACK.keywords);
    const negatives = lowered(ANNUITY_RULE_PACK.negativeKeywords);

    expect(keywords.every((term) => term.length > 0)).toBe(true);
    expect(negatives.every((term) => term.length > 0)).toBe(true);
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(new Set(negatives).size).toBe(negatives.length);
    expect(keywords.filter((term) => negatives.includes(term))).toEqual([]);
  });

  it('is an opt-in preset: its own name, never auto-converting, attributed link set inline', () => {
    expect(ANNUITY_RULE_PACK.name).not.toBe(ANNUITY_EDUCATION_PRESET.name);
    expect(ANNUITY_RULE_PACK.autoConvertToCrm).toBe(false);
    expect(ANNUITY_RULE_PACK.attributeFunnelLink).toBe(true);
    expect(ANNUITY_RULE_PACK.appendFunnelLink).toBe(false);
    expect(ANNUITY_RULE_PACK).not.toHaveProperty('funnelBaseUrl');
  });

  it('is installed independently of the education-only preset', () => {
    const packOnly = [createRuleFromPreset(ANNUITY_RULE_PACK)];
    const educationOnly = [createRuleFromPreset(ANNUITY_EDUCATION_PRESET)];

    expect(isPresetInstalled(packOnly, ANNUITY_RULE_PACK)).toBe(true);
    expect(isPresetInstalled(packOnly, ANNUITY_EDUCATION_PRESET)).toBe(false);
    expect(isPresetInstalled(educationOnly, ANNUITY_RULE_PACK)).toBe(false);
  });

  it('copies its arrays into a created rule and carries the attribution flag', () => {
    const rule = createRuleFromPreset(ANNUITY_RULE_PACK);
    rule.keywords.push('injected');
    rule.negativeKeywords.push('injected');
    rule.targetSubreddits?.push('injected');

    expect(ANNUITY_RULE_PACK.keywords).not.toContain('injected');
    expect(ANNUITY_RULE_PACK.negativeKeywords).not.toContain('injected');
    expect(ANNUITY_RULE_PACK.targetSubreddits).not.toContain('injected');
    expect(packRule.attributeFunnelLink).toBe(true);
  });
});

describe('ANNUITY_RULE_PACK matching', () => {
  it.each(ANNUITY_RULE_PACK.keywords)('surfaces a plain question that uses "%s"', (keyword) => {
    const lead = evaluate(`Question about ${keyword}`, 'I would like plain answers before I decide.');

    expect(lead).not.toBeNull();
    expect(lead?.matchedRuleId).toBe(packRule.id);
  });

  it.each([
    ['a UK pension post in pounds', 'Annuity or drawdown at 57?', 'I have £180k in my pension and want guaranteed income.'],
    ['a UK pension post naming HMRC', 'Lump sum pension and annuity tax', 'HMRC sent a form about my lump sum pension.'],
    ['a UK workplace pension post', 'Workplace pension: annuity or not?', 'My workplace pension offers an annuity at retirement.'],
    ['an ISA post', 'Annuity versus stocks and shares ISA', 'Where should retirement income come from?'],
    ['a SIPP post', 'Should my SIPP buy an annuity', 'Thinking about retirement income from my SIPP pension.'],
  ])('drops %s', (_label, title, content) => {
    expect(evaluate(title, content)).toBeNull();
  });

  it.each([
    ['an annuity formula question', 'Annuity formula gives a different answer', 'Which formula is right for this exercise?'],
    ['a present value question', 'Present value of an annuity due', 'How do I solve this textbook problem?'],
    ['a spreadsheet question', 'Annuity payments in a spreadsheet', 'Which Excel formula and PMT function should I use?'],
    ['an amortization question', 'Annuity vs amortization schedule', 'How does the loan amortization table work?'],
    ['an annuity-loan question', 'Annuity loan or linear loan', 'Which repayment type costs less over time?'],
    ['a homework question', 'Annuity homework help', 'Stuck on question three.'],
  ])('drops %s', (_label, title, content) => {
    expect(evaluate(title, content)).toBeNull();
  });

  it('drops a structured settlement post', () => {
    expect(evaluate('Selling a structured settlement annuity', 'Who buys these?')).toBeNull();
  });

  it.each([
    ['a mortgage payoff question', 'Pay off my mortgage or buy an annuity?', 'I am 63 with a paid-down house and a lump sum.'],
    ['a Mississippi retiree', 'MYGA or CD in Mississippi', 'Retired in Mississippi and comparing a MYGA with a CD.'],
    ['a post whose words hold "isa" inside them', 'Is an annuity advisable?', 'My advisor thinks a fixed indexed annuity is advisable for part of my savings.'],
    ['a US state pension option', 'State pension lump sum pension option', 'My state plan offers a lump sum pension or monthly payments.'],
    ['a US post in dollars', 'CD vs annuity for $200k', 'Looking for retirement income that lasts.'],
  ])('still surfaces %s', (_label, title, content) => {
    expect(evaluate(title, content)).not.toBeNull();
  });
});

describe('ANNUITY_PITCH_TEMPLATE', () => {
  const template = ANNUITY_PITCH_TEMPLATE;
  const lowered = template.toLowerCase();
  const [teaching, guideOffer, disclosure] = template.split('\n\n');

  it('ends exactly with the licensed-agent disclosure', () => {
    expect(ANNUITY_DISCLOSURE).toBe("Disclosure: I'm a licensed insurance agent.");
    expect(template.endsWith(ANNUITY_DISCLOSURE)).toBe(true);
    expect(template.split('\n').slice(-1)[0]).toBe(ANNUITY_DISCLOSURE);
    expect(disclosure).toBe(ANNUITY_DISCLOSURE);
  });

  it('teaches in three or four sentences first, then offers the guide, then discloses', () => {
    const sentences = (teaching ?? '').split(/(?<=[.!?])\s+/);

    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences.length).toBeLessThanOrEqual(4);
    expect(template.indexOf(teaching ?? '')).toBe(0);
    expect(guideOffer).toContain(FUNNEL_LINK_PLACEHOLDER);
    expect(template.indexOf(FUNNEL_LINK_PLACEHOLDER)).toBeGreaterThan(template.indexOf('surrender period'));
  });

  it('uses only the author and funnel link placeholders, the link alone on its own paragraph', () => {
    const placeholders = template.match(/\{[^}]+\}/g) ?? [];

    expect(placeholders).toEqual(['{author}', FUNNEL_LINK_PLACEHOLDER]);
    expect(guideOffer?.endsWith(FUNNEL_LINK_PLACEHOLDER)).toBe(true);
  });

  it('makes no guarantee, no safe-money claim and no risk claim', () => {
    expect(lowered).not.toContain('guarantee');
    expect(lowered).not.toContain('safe money');
    expect(lowered).not.toMatch(/\b(safe|safest|risk-free|no risk|secure|protected)\b/);
  });

  it('quotes no rate, return, tax claim, figure or link', () => {
    expect(template).not.toMatch(/\d/);
    expect(template).not.toContain('%');
    expect(lowered).not.toMatch(/\b(rate|rates|apy|apr|interest|return|returns|yield|yields|tax|taxes)\b/);
    expect(lowered).not.toMatch(/https?:|www\.|\.com/);
  });

  it('names no carrier or product', () => {
    const names = [
      'athene', 'nationwide', 'allianz', 'fidelity', 'lincoln', 'prudential', 'massmutual', 'mass mutual',
      'pacific life', 'jackson', 'brighthouse', 'midland', 'american equity', 'delaware life', 'symetra',
      'new york life', 'northwestern', 'guardian', 'transamerica', 'corebridge', 'forethought', 'great american',
      'myga',
    ];

    expect(names.filter((name) => lowered.includes(name))).toEqual([]);
  });

  it('uses no sales language and no em dash', () => {
    expect(lowered).not.toMatch(/\b(buy|sign up|dm me|contact me|call me|quote|best|save|earn|free|act now)\b/);
    expect(template).not.toContain(String.fromCharCode(0x2014));
  });

  it('says it is general education, not advice', () => {
    expect(lowered).toContain('general education, not advice');
  });
});

describe('ANNUITY_RULE_PACK lead', () => {
  const lead = evaluate('Is an annuity right for my retirement income?', 'I am 62 and weighing my options.');

  it('greets the thread author and keeps the funnel placeholder for the dispatcher', () => {
    expect(lead?.suggestedPitch.startsWith('Hi u/pat_retired, this is general education')).toBe(true);
    expect(lead?.suggestedPitch).not.toContain('{author}');
    expect(lead?.suggestedPitch).toContain(FUNNEL_LINK_PLACEHOLDER);
    expect(lead?.suggestedPitch.endsWith(ANNUITY_DISCLOSURE)).toBe(true);
  });

  it('copies the link settings from the rule', () => {
    expect(lead?.attributeFunnelLink).toBe(true);
    expect(lead?.appendFunnelLink).toBe(false);
    expect(lead).not.toHaveProperty('funnelBaseUrl');
  });
});
