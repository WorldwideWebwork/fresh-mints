import { describe, it, expect } from 'vitest';
import type { Lead } from '../types/lead';
import { buildValuationBreakdown } from './valuation-breakdown';
import { buildValuationNotices, buildValuationRows, formatUsd } from './valuation-rows';

const leadWith = (profession: string, estimatedDealValue: unknown): Lead =>
  ({ profession, estimatedDealValue }) as unknown as Lead;

const noticeIds = (lead: Lead) => buildValuationNotices(lead, buildValuationBreakdown(lead)).map((n) => n.id);

describe('formatUsd', () => {
  it('formats whole dollars with cents and thousands separators', () => {
    expect(formatUsd(2650)).toBe('$2,650.00');
    expect(formatUsd(28)).toBe('$28.00');
  });

  it('keeps fractional cents and a zero amount', () => {
    expect(formatUsd(1234.5)).toBe('$1,234.50');
    expect(formatUsd(0)).toBe('$0.00');
  });

  it('shows a loss as a negative amount instead of hiding it', () => {
    expect(formatUsd(-5)).toBe('-$5.00');
  });
});

describe('buildValuationRows', () => {
  const rows = buildValuationRows(buildValuationBreakdown(leadWith('dental', 2650)));

  it('lists the deal value first, then the profession and tier it was priced on', () => {
    expect(rows.deal).toEqual([
      { label: 'Lead deal value', value: '$2,650.00', isEmphasized: true },
      { label: 'Profession', value: 'Dentists & Orthodontists' },
      { label: 'Hosting tier', value: 'w4 Silver' },
    ]);
  });

  it('walks the margin from package price down to net profit: 2650 - 300 - 840 - 28 = 1482', () => {
    expect(rows.margin.map((r) => [r.label, r.value])).toEqual([
      ['w4 Silver 2-year package', '$2,650.00'],
      ['Less: caller commission', '$300.00'],
      ['Less: 2-year hosting cost', '$840.00'],
      ['Less: 2-year domain cost', '$28.00'],
      ['Net consulting profit', '$1,482.00'],
    ]);
  });

  it('emphasises only the net profit line of the margin', () => {
    const emphasised = rows.margin.filter((r) => r.isEmphasized).map((r) => r.label);
    expect(emphasised).toEqual(['Net consulting profit']);
  });

  it('shows the wholesale monthly rate behind the hosting cost', () => {
    const hosting = rows.margin.find((r) => r.label === 'Less: 2-year hosting cost');
    expect(hosting?.hint).toBe('$35.00/mo wholesale');
  });

  it('shows the lead value, not the package price, on the deal line of a custom deal', () => {
    const custom = buildValuationRows(buildValuationBreakdown(leadWith('dental', 9000)));
    expect(custom.deal[0].value).toBe('$9,000.00');
    expect(custom.margin[0].value).toBe('$2,650.00');
  });
});

describe('buildValuationNotices', () => {
  it('has nothing to say about a lead priced exactly at its standard package', () => {
    expect(noticeIds(leadWith('dental', 2650))).toEqual([]);
  });

  it('names the profession average when the lead carries no value', () => {
    const lead = leadWith('dental', 0);
    const [notice] = buildValuationNotices(lead, buildValuationBreakdown(lead));
    expect(notice.id).toBe('value-defaulted');
    expect(notice.badge).toBe('Profession average');
    expect(notice.message).toContain('$2,650.00');
    expect(notice.message).toContain('Dentists & Orthodontists');
  });

  it('flags an unmapped profession, quoting what the lead actually recorded', () => {
    const lead = leadWith('astronaut', 1650);
    const notices = buildValuationNotices(lead, buildValuationBreakdown(lead));
    expect(notices.map((n) => n.id)).toEqual(['profession-defaulted']);
    expect(notices[0].message).toContain('astronaut');
    expect(notices[0].message).toContain('Real Estate Agents & Brokers');
  });

  it('says so when the lead has no profession at all', () => {
    const lead = leadWith(undefined as unknown as string, 1650);
    const notices = buildValuationNotices(lead, buildValuationBreakdown(lead));
    expect(notices[0].message).toContain('none recorded');
  });

  it('warns that margin is for the standard package when the deal value differs from it', () => {
    const lead = leadWith('dental', 9000);
    const notices = buildValuationNotices(lead, buildValuationBreakdown(lead));
    expect(notices.map((n) => n.id)).toEqual(['differs-from-package']);
    expect(notices[0].message).toContain('$9,000.00');
    expect(notices[0].message).toContain('$2,650.00');
    expect(notices[0].message).toContain('w4 Silver');
  });

  it('stacks every notice that applies, value first', () => {
    expect(noticeIds(leadWith('astronaut', 9000))).toEqual(['profession-defaulted', 'differs-from-package']);
    expect(noticeIds(leadWith('astronaut', 0))).toEqual(['value-defaulted', 'profession-defaulted']);
  });
});
