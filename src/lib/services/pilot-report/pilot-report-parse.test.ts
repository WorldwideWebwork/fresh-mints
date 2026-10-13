import { describe, it, expect } from 'vitest';
import { parseBillableExport, parsePilotReport } from './pilot-report-parse';

const platformRow = (overrides: Record<string, unknown> = {}) => ({
  platform: 'reddit',
  label: 'Reddit',
  searches: 3,
  posts_found: 120,
  replies_sent: 5,
  replies_via_webhook: 4,
  opt_ins: 4,
  opt_ins_call_text: 3,
  billable_leads: 2,
  ...overrides,
});

const report = (overrides: Record<string, unknown> = {}) => ({
  month: '2026-10',
  range: { from: '2026-10-01T00:00:00-05:00', to: '2026-11-01T00:00:00-05:00', timezone: 'America/Chicago' },
  platforms: [platformRow()],
  totals: { ...platformRow(), duplicates_excluded: 1 },
  agents: { available: true, total: 7, weeks: [{ week_start: '2026-09-28', delivered: 7 }] },
  sources: { events: { available: true }, lead_magnet: { available: true } },
  ...overrides,
});

describe('parsePilotReport', () => {
  it('reads a complete report', () => {
    const parsed = parsePilotReport(report());

    expect(parsed?.month).toBe('2026-10');
    expect(parsed?.platforms[0]).toMatchObject({ platform: 'reddit', postsFound: 120, repliesSent: 5, billableLeads: 2 });
    expect(parsed?.totals.duplicatesExcluded).toBe(1);
    expect(parsed?.agents).toEqual({ available: true, total: 7, weeks: [{ weekStart: '2026-09-28', delivered: 7 }] });
    expect(parsed?.sources.leadMagnet).toEqual({ available: true, reason: '' });
  });

  it('keeps null counts as null, not zero', () => {
    const parsed = parsePilotReport(
      report({
        platforms: [platformRow({ platform: 'hacker_news', label: 'Hacker News', searches: null, posts_found: null })],
      }),
    );

    expect(parsed?.platforms[0].postsFound).toBeNull();
    expect(parsed?.platforms[0].searches).toBeNull();
  });

  it('reads agents that are not available with the reason', () => {
    const parsed = parsePilotReport(
      report({ agents: { available: false, reason: 'The Agent Finder delivery table does not exist yet.' } }),
    );

    expect(parsed?.agents).toEqual({ available: false, reason: 'The Agent Finder delivery table does not exist yet.' });
  });

  it('reads a source that is not available with its reason', () => {
    const parsed = parsePilotReport(
      report({ sources: { events: { available: true }, lead_magnet: { available: false, reason: 'Not active.' } } }),
    );

    expect(parsed?.sources.leadMagnet).toEqual({ available: false, reason: 'Not active.' });
  });

  it.each([
    ['a count that is a string', { platforms: [platformRow({ posts_found: '120' })] }],
    ['a negative count', { platforms: [platformRow({ opt_ins: -1 })] }],
    ['a fractional count', { platforms: [platformRow({ replies_sent: 1.5 })] }],
    ['a missing count', { platforms: [platformRow({ billable_leads: undefined })] }],
    ['a platform without a label', { platforms: [platformRow({ label: 3 })] }],
    ['agents without weeks', { agents: { available: true, total: 1 } }],
    ['an agent week with a bad count', { agents: { available: true, total: 1, weeks: [{ week_start: '2026-09-28', delivered: 'x' }] } }],
    ['sources of the wrong shape', { sources: [] }],
    ['no range', { range: null }],
  ])('rejects %s', (_name, overrides) => {
    expect(parsePilotReport(report(overrides))).toBeNull();
  });

  it('rejects a body that is not an object', () => {
    expect(parsePilotReport(null)).toBeNull();
    expect(parsePilotReport('report')).toBeNull();
    expect(parsePilotReport([])).toBeNull();
  });
});

describe('parseBillableExport', () => {
  const body = { month: '2026-10', filename: 'fresh-mints-billable-leads-2026-10.csv', count: 2, duplicates_excluded: 0, csv: 'name\n' };

  it('reads the export', () => {
    expect(parseBillableExport(body)).toEqual({
      month: '2026-10',
      filename: 'fresh-mints-billable-leads-2026-10.csv',
      count: 2,
      duplicatesExcluded: 0,
      csv: 'name\n',
    });
  });

  it('rejects an export with a missing field or a bad count', () => {
    expect(parseBillableExport({ ...body, csv: undefined })).toBeNull();
    expect(parseBillableExport({ ...body, count: '2' })).toBeNull();
    expect(parseBillableExport(null)).toBeNull();
  });
});
