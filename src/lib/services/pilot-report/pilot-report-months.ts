/**
 * The months the report's month picker offers: the current month and the eleven before it, newest
 * first. The server reads a month on the site's clock; the browser's clock only chooses the default.
 */

export interface MonthOption {
  readonly value: string;
  readonly label: string;
}

const MONTH_COUNT = 12;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (value: number): string => String(value).padStart(2, '0');

export const monthValue = (year: number, monthIndex: number): string => `${year}-${pad(monthIndex + 1)}`;

export const currentMonth = (now: Date): string => monthValue(now.getFullYear(), now.getMonth());

export const monthLabel = (value: string): string => {
  const [year, month] = value.split('-');
  const name = MONTH_NAMES[Number(month) - 1];
  return name ? `${name} ${year}` : value;
};

export const recentMonths = (now: Date, count: number = MONTH_COUNT): MonthOption[] =>
  Array.from({ length: count }, (_, back) => {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const value = monthValue(date.getFullYear(), date.getMonth());
    return { value, label: monthLabel(value) };
  });
