import { describe, it, expect } from 'vitest';
import { currentMonth, monthLabel, recentMonths } from './pilot-report-months';

describe('pilot report months', () => {
  it('formats the current month as YYYY-MM', () => {
    expect(currentMonth(new Date(2026, 9, 12))).toBe('2026-10');
    expect(currentMonth(new Date(2026, 0, 31))).toBe('2026-01');
  });

  it('labels a month, and leaves an unreadable value alone', () => {
    expect(monthLabel('2026-10')).toBe('October 2026');
    expect(monthLabel('nonsense')).toBe('nonsense');
  });

  it('lists twelve months newest first and crosses the year boundary', () => {
    const months = recentMonths(new Date(2026, 1, 15));

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ value: '2026-02', label: 'February 2026' });
    expect(months[2]).toEqual({ value: '2025-12', label: 'December 2025' });
    expect(months[11]).toEqual({ value: '2025-03', label: 'March 2025' });
  });

  it('starts from the first of the month so the 31st never skips a month', () => {
    const months = recentMonths(new Date(2026, 2, 31), 3);

    expect(months.map((month) => month.value)).toEqual(['2026-03', '2026-02', '2026-01']);
  });
});
