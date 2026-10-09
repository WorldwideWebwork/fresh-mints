import { describe, it, expect } from 'vitest';
import {
  ANNUITY_EDUCATION_PRESET,
  createRuleFromPreset,
  isPresetInstalled,
} from './rule-presets';
import type { SocialMonitorRule } from './types';

describe('ANNUITY_EDUCATION_PRESET shape', () => {
  it('has the agreed name, keywords, platform, channels and threshold', () => {
    expect(ANNUITY_EDUCATION_PRESET.name).toBe('Annuity questions (education only)');
    expect(ANNUITY_EDUCATION_PRESET.keywords).toEqual([
      'annuity',
      'annuities',
      'fixed indexed annuity',
      'MYGA',
      'retirement income',
      '401k rollover',
      'TSP rollover',
    ]);
    expect(ANNUITY_EDUCATION_PRESET.platforms).toEqual(['reddit']);
    expect(ANNUITY_EDUCATION_PRESET.targetSubreddits).toEqual([
      'retirement',
      'personalfinance',
      'fednews',
      'ThriftSavingsPlan',
    ]);
    expect(ANNUITY_EDUCATION_PRESET.minIntentScore).toBe(50);
  });

  it('turns the funnel link off and ships active', () => {
    expect(ANNUITY_EDUCATION_PRESET.appendFunnelLink).toBe(false);
    expect(ANNUITY_EDUCATION_PRESET.isActive).toBe(true);
  });

  it('has no blank keywords', () => {
    const blanks = ANNUITY_EDUCATION_PRESET.keywords.filter((k) => k.trim().length === 0);
    expect(blanks).toEqual([]);
  });
});

describe('ANNUITY_EDUCATION_PRESET template: education only', () => {
  const template = ANNUITY_EDUCATION_PRESET.pitchTemplate ?? '';
  const lowered = template.toLowerCase();

  it('exists and is under 600 characters', () => {
    expect(template.length).toBeGreaterThan(0);
    expect(template.length).toBeLessThan(600);
  });

  it('makes no guarantee, percentage, link or tax statement', () => {
    expect(lowered).not.toContain('guarantee');
    expect(template).not.toContain('%');
    expect(lowered).not.toContain('http');
    expect(lowered).not.toContain('www');
    expect(lowered).not.toContain('.com');
    expect(lowered).not.toContain('tax');
  });

  it('contains no digits, so no rate or return figure can appear', () => {
    expect(template).not.toMatch(/\d/);
  });

  it('names no rate, return, carrier or product', () => {
    expect(lowered).not.toMatch(/\b(rate|rates|return|returns|yield|carrier|product|products)\b/);
  });

  it('uses no sales language or call to action', () => {
    expect(lowered).not.toMatch(/\b(buy|sign up|dm me|contact me|call me|quote|best|save|earn|free)\b/);
  });

  it('contains no em dash', () => {
    const emDash = String.fromCharCode(0x2014);
    expect(template).not.toContain(emDash);
  });

  it('neutrally names the four annuity types', () => {
    expect(lowered).toContain('immediate');
    expect(lowered).toContain('fixed or myga');
    expect(lowered).toContain('variable');
    expect(lowered).toContain('fixed indexed');
  });

  it('notes that surrender periods and fees vary', () => {
    expect(lowered).toContain('surrender periods and fees vary');
  });

  it('says fit depends on when income is needed and whether a balance should pass to beneficiaries', () => {
    expect(lowered).toContain('when income is needed');
    expect(lowered).toContain('pass to beneficiaries');
  });

  it('greets the thread author through the placeholder and uses no other placeholder', () => {
    expect(template).toContain('{author}');
    const placeholders = template.match(/\{[^}]+\}/g) ?? [];
    expect(placeholders).toEqual(['{author}']);
  });
});

describe('createRuleFromPreset', () => {
  const fixedNow = new Date('2026-10-09T12:34:56.789Z');

  it('assigns an id and a creation timestamp', () => {
    const rule = createRuleFromPreset(ANNUITY_EDUCATION_PRESET, fixedNow);

    expect(rule.id).toBe(`rule-${fixedNow.getTime()}`);
    expect(rule.createdAt).toBe('2026-10-09T12:34:56.789Z');
  });

  it('carries every preset field across unchanged', () => {
    const rule = createRuleFromPreset(ANNUITY_EDUCATION_PRESET, fixedNow);

    expect(rule).toMatchObject(ANNUITY_EDUCATION_PRESET);
  });

  it('gives rules created at different times different ids', () => {
    const first = createRuleFromPreset(ANNUITY_EDUCATION_PRESET, new Date(1000));
    const second = createRuleFromPreset(ANNUITY_EDUCATION_PRESET, new Date(2000));

    expect(first.id).not.toBe(second.id);
  });

  it('copies the arrays so editing a created rule cannot alter the preset', () => {
    const rule = createRuleFromPreset(ANNUITY_EDUCATION_PRESET, fixedNow);

    rule.keywords.push('injected');
    rule.platforms.push('x');
    rule.targetSubreddits?.push('injected');

    expect(ANNUITY_EDUCATION_PRESET.keywords).not.toContain('injected');
    expect(ANNUITY_EDUCATION_PRESET.platforms).toEqual(['reddit']);
    expect(ANNUITY_EDUCATION_PRESET.targetSubreddits).not.toContain('injected');
  });

  it('works for a preset with no target subreddits', () => {
    const { targetSubreddits, ...withoutChannels } = ANNUITY_EDUCATION_PRESET;

    const rule = createRuleFromPreset(withoutChannels, fixedNow);

    expect(rule.targetSubreddits).toBeUndefined();
  });
});

describe('isPresetInstalled', () => {
  const unrelated: SocialMonitorRule = {
    id: 'rule-web-upgrade',
    name: 'Website Redesign & Upgrades',
    keywords: ['website'],
    negativeKeywords: [],
    platforms: ['reddit'],
    minIntentScore: 50,
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
  };

  it('is false for an empty rule list and for unrelated rules', () => {
    expect(isPresetInstalled([], ANNUITY_EDUCATION_PRESET)).toBe(false);
    expect(isPresetInstalled([unrelated], ANNUITY_EDUCATION_PRESET)).toBe(false);
  });

  it('is true once the preset has been created as a rule', () => {
    const created = createRuleFromPreset(ANNUITY_EDUCATION_PRESET);

    expect(isPresetInstalled([unrelated, created], ANNUITY_EDUCATION_PRESET)).toBe(true);
  });

  it('matches the name ignoring case and surrounding whitespace', () => {
    const renamed: SocialMonitorRule = { ...unrelated, name: '  ANNUITY QUESTIONS (education only) ' };

    expect(isPresetInstalled([renamed], ANNUITY_EDUCATION_PRESET)).toBe(true);
  });

  it('stays true when the installed copy is switched off', () => {
    const paused: SocialMonitorRule = { ...createRuleFromPreset(ANNUITY_EDUCATION_PRESET), isActive: false };

    expect(isPresetInstalled([paused], ANNUITY_EDUCATION_PRESET)).toBe(true);
  });
});
