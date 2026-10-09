import { describe, it, expect } from 'vitest';
import { PLATFORM_DESCRIPTORS, RULE_PLATFORM_OPTIONS, describePlatform } from './platform-descriptors';

const LIVE_PLATFORMS = ['hacker_news', 'reddit', 'stack_exchange', 'youtube'] as const;

describe('RULE_PLATFORM_OPTIONS', () => {
  it('offers exactly the four live platforms, each once', () => {
    const ids = RULE_PLATFORM_OPTIONS.map((option) => option.id);

    expect([...ids].sort()).toEqual([...LIVE_PLATFORMS].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every option a non-empty toggle label', () => {
    const blanks = RULE_PLATFORM_OPTIONS.filter((option) => option.toggleLabel.trim().length === 0);

    expect(blanks).toEqual([]);
  });
});

describe('describePlatform', () => {
  it('gives each live platform a distinct badge variant', () => {
    const variants = LIVE_PLATFORMS.map((platform) => describePlatform(platform).badgeVariant);

    expect(new Set(variants).size).toBe(LIVE_PLATFORMS.length);
  });

  it('keeps the badge look the existing platforms already had', () => {
    expect(describePlatform('reddit').badgeVariant).toBe('danger');
    expect(describePlatform('hacker_news').badgeVariant).toBe('warning');
  });

  it('labels the new platforms readably', () => {
    expect(describePlatform('stack_exchange').badgeLabel).toBe('Stack Exchange');
    expect(describePlatform('youtube').badgeLabel).toBe('YouTube');
  });

  it('covers every platform in the descriptor map', () => {
    for (const descriptor of Object.values(PLATFORM_DESCRIPTORS)) {
      expect(descriptor.badgeLabel.trim().length).toBeGreaterThan(0);
    }
  });

  it('falls back to a readable outline badge for a platform it does not know', () => {
    expect(describePlatform('mock')).toEqual({ badgeLabel: 'mock', badgeVariant: 'outline' });
    expect(describePlatform('some_new_site').badgeLabel).toBe('some new site');
  });

  it('does not treat inherited object keys as platforms', () => {
    expect(describePlatform('constructor')).toEqual({ badgeLabel: 'constructor', badgeVariant: 'outline' });
  });
});
