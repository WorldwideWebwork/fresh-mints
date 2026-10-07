import { describe, it, expect } from 'vitest';
import type { Lead } from '../types/lead';
import { PROFESSION_CONFIGS, type ProfessionCategory } from '../types/profession';
import { W4_HOSTING_PLANS } from '../types/hosting';
import { buildValuationBreakdown, hasOwnDealValue } from './valuation-breakdown';

// Only the two fields the breakdown reads. Everything else on a Lead is irrelevant here.
const leadWith = (profession: string, estimatedDealValue: unknown): Lead =>
  ({ profession, estimatedDealValue }) as unknown as Lead;

const lead = leadWith('dental', 2650);

const PROFESSIONS = Object.keys(PROFESSION_CONFIGS) as ProfessionCategory[];

describe('buildValuationBreakdown', () => {
  it('reports the lead deal value and derives net profit from the tier', () => {
    const b = buildValuationBreakdown(lead);
    expect(b.dealValue).toBe(2650);
    expect(b.usedProfessionDefault).toBe(false);
    expect(b.netConsultingProfit).toBe(
      b.twoYearFlatPackagePrice - b.callerCommission - b.twoYearHostingCost - b.twoYearDomainCost
    );
  });

  // Worked example, pinned on purpose: dental maps to w4 Silver, and these are
  // the figures a rep would quote. A config change must be a deliberate edit here too.
  //   2650 package - 300 caller - 840 hosting (35.00/mo x 24) - 28 domain = 1482
  it('prices a dental lead on the w4 Silver tier: 2650 - 300 - 840 - 28 = 1482', () => {
    expect(buildValuationBreakdown(lead)).toEqual({
      dealValue: 2650,
      profession: 'dental',
      hostingTier: 'silver',
      twoYearFlatPackagePrice: 2650,
      callerCommission: 300,
      twoYearHostingCost: 840,
      twoYearDomainCost: 28,
      netConsultingProfit: 1482,
      usedProfessionDefault: false,
    });
  });

  // Review Focus 5
  it('falls back to the profession default when the lead carries no value', () => {
    for (const v of [0, undefined, null]) {
      const b = buildValuationBreakdown(leadWith('dental', v));
      expect(b.dealValue).toBeGreaterThan(0);
      expect(b.usedProfessionDefault).toBe(true);
    }
  });

  it('uses the profession averageWebsiteValue when the lead carries no value', () => {
    for (const key of PROFESSIONS) {
      const b = buildValuationBreakdown(leadWith(key, 0));
      expect(b.dealValue).toBe(PROFESSION_CONFIGS[key].averageWebsiteValue);
    }
  });

  it('treats a negative, non-finite or non-numeric value as missing', () => {
    for (const v of [-100, NaN, Infinity, -Infinity, '2650', {}]) {
      const b = buildValuationBreakdown(leadWith('dental', v));
      expect(b.dealValue).toBe(PROFESSION_CONFIGS.dental.averageWebsiteValue);
      expect(b.usedProfessionDefault).toBe(true);
    }
  });

  it('keeps a custom lead value and prices the tier independently of it', () => {
    const b = buildValuationBreakdown(leadWith('dental', 9000));
    expect(b.dealValue).toBe(9000);
    expect(b.usedProfessionDefault).toBe(false);
    expect(b.twoYearFlatPackagePrice).toBe(2650);
    expect(b.netConsultingProfit).toBe(1482);
  });

  it('falls back to real_estate for an unmapped profession', () => {
    const b = buildValuationBreakdown(leadWith('astronaut', 0));
    expect(b.dealValue).toBeGreaterThan(0);
    expect(b.profession).toBe('real_estate');
    expect(b.dealValue).toBe(PROFESSION_CONFIGS.real_estate.averageWebsiteValue);
  });

  it('flags the profession fallback even when the lead brought its own value', () => {
    const b = buildValuationBreakdown(leadWith('astronaut', 5000));
    expect(b.dealValue).toBe(5000);
    expect(b.profession).toBe('real_estate');
    expect(b.hostingTier).toBe(PROFESSION_CONFIGS.real_estate.hostingTier);
    expect(b.usedProfessionDefault).toBe(true);
  });

  // 'constructor' and '__proto__' resolve on a plain object lookup, so a
  // `CONFIGS[key] || default` guard would hand back a function or Object.prototype.
  it('does not resolve inherited object keys as professions', () => {
    for (const key of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      const b = buildValuationBreakdown(leadWith(key, 0));
      expect(b.profession).toBe('real_estate');
      expect(b.usedProfessionDefault).toBe(true);
    }
  });

  it('treats a missing profession as unmapped rather than throwing', () => {
    const b = buildValuationBreakdown(leadWith(undefined as unknown as string, 1650));
    expect(b.profession).toBe('real_estate');
    expect(b.usedProfessionDefault).toBe(true);
  });

  it('takes every tier figure from the live hosting plan of the profession', () => {
    for (const key of PROFESSIONS) {
      const b = buildValuationBreakdown(leadWith(key, 1));
      const plan = W4_HOSTING_PLANS[PROFESSION_CONFIGS[key].hostingTier];
      expect(b.hostingTier).toBe(plan.id);
      expect(b.twoYearFlatPackagePrice).toBe(plan.twoYearFlatPackagePrice);
      expect(b.callerCommission).toBe(plan.callerCommission);
      expect(b.twoYearHostingCost).toBe(plan.twoYearHostingCost);
      expect(b.twoYearDomainCost).toBe(plan.twoYearDomainCost);
      expect(b.netConsultingProfit).toBe(plan.netConsultingProfit);
    }
  });

  it('keeps net profit equal to package minus its three costs for every profession', () => {
    for (const key of PROFESSIONS) {
      const b = buildValuationBreakdown(leadWith(key, 1));
      const costs = b.callerCommission + b.twoYearHostingCost + b.twoYearDomainCost;
      expect(b.netConsultingProfit).toBe(b.twoYearFlatPackagePrice - costs);
    }
  });
});

// The breakdown reads stored net profit and hosting cost straight from config. These
// guard the config itself, so a hand-edited plan cannot show a rep a figure that
// disagrees with its own parts.
describe('W4_HOSTING_PLANS arithmetic', () => {
  const plans = Object.values(W4_HOSTING_PLANS);

  it('stores net profit as package price minus commission, hosting and domain', () => {
    for (const p of plans) {
      const expected = p.twoYearFlatPackagePrice - p.callerCommission - p.twoYearHostingCost - p.twoYearDomainCost;
      expect(p.netConsultingProfit, p.id).toBe(expected);
    }
  });

  it('stores two-year hosting cost as 24 months of the wholesale monthly cost', () => {
    for (const p of plans) expect(p.twoYearHostingCost, p.id).toBe(p.wholesaleMonthlyCost * 24);
  });
});

describe('hasOwnDealValue', () => {
  it('accepts a positive finite number', () => {
    expect(hasOwnDealValue(leadWith('dental', 1))).toBe(true);
    expect(hasOwnDealValue(leadWith('dental', 2650.5))).toBe(true);
  });

  it('rejects zero, negatives, non-finite numbers and non-numbers', () => {
    for (const v of [0, -1, NaN, Infinity, undefined, null, '2650']) {
      expect(hasOwnDealValue(leadWith('dental', v))).toBe(false);
    }
  });
});
