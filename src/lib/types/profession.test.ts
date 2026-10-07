import { describe, it, expect } from 'vitest';
import { PROFESSION_CONFIGS, getProfessionConfig } from './profession';
import { W4_HOSTING_PLANS } from './hosting';
import type { ProfessionCategory } from './profession';

describe('PROFESSION_CONFIGS', () => {
  it('keys every config by its own id', () => {
    for (const [key, cfg] of Object.entries(PROFESSION_CONFIGS)) expect(cfg.id).toBe(key);
  });

  it('gives every profession a positive averageWebsiteValue', () => {
    for (const cfg of Object.values(PROFESSION_CONFIGS)) expect(cfg.averageWebsiteValue).toBeGreaterThan(0);
  });

  it('points every profession at a hosting tier that exists in W4_HOSTING_PLANS', () => {
    for (const cfg of Object.values(PROFESSION_CONFIGS)) expect(W4_HOSTING_PLANS[cfg.hostingTier]).toBeDefined();
  });

  it('includes nursing and beauty entries', () => {
    expect(PROFESSION_CONFIGS.nursing.id).toBe('nursing');
    expect(PROFESSION_CONFIGS.beauty.id).toBe('beauty');
  });
});

describe('getProfessionConfig', () => {
  it('returns the matching config for a known profession key', () => {
    expect(getProfessionConfig('dental')).toBe(PROFESSION_CONFIGS.dental);
    expect(getProfessionConfig('legal')).toBe(PROFESSION_CONFIGS.legal);
  });

  it('resolves every declared profession to its own config', () => {
    for (const key of Object.keys(PROFESSION_CONFIGS) as ProfessionCategory[]) {
      expect(getProfessionConfig(key)).toBe(PROFESSION_CONFIGS[key]);
    }
  });

  // Review Focus 2: callers index averageWebsiteValue straight off the result
  it('falls back to real_estate for an unknown profession key', () => {
    expect(getProfessionConfig('not_a_profession')).toBe(PROFESSION_CONFIGS.real_estate);
    expect(getProfessionConfig('').averageWebsiteValue).toBeGreaterThan(0);
  });

  it('falls back to real_estate for keys that only exist on Object.prototype', () => {
    expect(getProfessionConfig('toString')).toBe(PROFESSION_CONFIGS.real_estate);
    expect(getProfessionConfig('__proto__')).toBe(PROFESSION_CONFIGS.real_estate);
    expect(getProfessionConfig('constructor').averageWebsiteValue).toBeGreaterThan(0);
  });

  it('is case sensitive, so a differently cased key falls back', () => {
    expect(getProfessionConfig('Nursing')).toBe(PROFESSION_CONFIGS.real_estate);
  });
});
