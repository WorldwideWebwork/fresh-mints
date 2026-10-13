import { describe, it, expect } from 'vitest';
import { describeWindow, formatCount, formatInvoice, hasActivity } from './pilot-report-format';
import type { PilotReport } from './types';

const emptyTotals = {
  searches: 0,
  postsFound: 0,
  repliesSent: 0,
  repliesViaWebhook: 0,
  optIns: 0,
  optInsCallText: 0,
  billableLeads: 0,
  duplicatesExcluded: 0,
};

const report = (totals: Partial<typeof emptyTotals> = {}, agents: PilotReport['agents'] = { available: false, reason: 'x' }): PilotReport => ({
  month: '2026-10',
  range: { from: '2026-10-01T00:00:00-05:00', to: '2026-11-01T00:00:00-05:00', timezone: 'America/Chicago' },
  platforms: [],
  totals: { ...emptyTotals, ...totals },
  agents,
  sources: { events: { available: true, reason: '' }, leadMagnet: { available: true, reason: '' } },
});

describe('pilot report format', () => {
  it('shows null as n/a and a real zero as 0', () => {
    expect(formatCount(null)).toBe('n/a');
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1234)).toBe('1,234');
  });

  it('prices billable leads at 75 dollars each, and n/a when unknown', () => {
    expect(formatInvoice(0)).toBe('$0');
    expect(formatInvoice(3)).toBe('$225');
    expect(formatInvoice(null)).toBe('n/a');
  });

  it('calls a month with only zeros empty', () => {
    expect(hasActivity(report())).toBe(false);
  });

  it('sees activity in posts, replies, opt-ins or delivered agents', () => {
    expect(hasActivity(report({ postsFound: 4 }))).toBe(true);
    expect(hasActivity(report({ repliesSent: 1 }))).toBe(true);
    expect(hasActivity(report({ optIns: 1 }))).toBe(true);
    expect(hasActivity(report({}, { available: true, total: 2, weeks: [] }))).toBe(true);
    expect(hasActivity(report({}, { available: true, total: 0, weeks: [] }))).toBe(false);
  });

  it('describes the window with its last day, not the exclusive end', () => {
    expect(describeWindow(report().range)).toBe('2026-10-01 to 2026-10-31 (America/Chicago)');
  });
});
