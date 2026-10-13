import type { PilotCount, PilotReport } from './types';

/** What the pilot pays per billable lead, in dollars. */
export const PILOT_RATE_PER_LEAD = 75;

export const NOT_AVAILABLE = 'n/a';

/** A count for display: the number, or "n/a" when the report could not know it. Never 0 for null. */
export const formatCount = (count: PilotCount): string => (count === null ? NOT_AVAILABLE : count.toLocaleString('en-US'));

/** The invoice amount for a billable count, or "n/a" when the count is unknown. */
export const formatInvoice = (billable: PilotCount): string =>
  billable === null ? NOT_AVAILABLE : `$${(billable * PILOT_RATE_PER_LEAD).toLocaleString('en-US')}`;

/** True when anything at all was recorded in the month, so an empty month can say so. */
export const hasActivity = (report: PilotReport): boolean => {
  const totals = report.totals;
  const counts = [totals.postsFound, totals.repliesSent, totals.optIns];
  const hasCount = counts.some((count) => count !== null && count > 0);
  const hasAgents = report.agents.available && report.agents.total > 0;
  return hasCount || hasAgents;
};

/** The days of a report's window as "Oct 1 to Oct 31" for the note under the table. */
export const describeWindow = (range: PilotReport['range']): string => {
  const from = range.from.slice(0, 10);
  const lastDay = new Date(`${range.to.slice(0, 10)}T00:00:00Z`);
  lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  return `${from} to ${lastDay.toISOString().slice(0, 10)} (${range.timezone})`;
};
