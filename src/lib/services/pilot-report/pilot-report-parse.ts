import type {
  BillableExport,
  PilotAgents,
  PilotCount,
  PilotPlatformRow,
  PilotReport,
  PilotSourceStatus,
  PilotTotals,
} from './types';

/**
 * Runtime checks for the pilot report payload. The server is the only author, but the view must not
 * render a number it did not read as a number, so anything unexpected makes the whole parse null
 * and the view shows an error instead of a half-read table.
 */

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isNullableCount = (value: unknown): value is PilotCount => value === null || isCount(value);

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const COUNT_KEYS = [
  'searches',
  'posts_found',
  'replies_sent',
  'replies_via_webhook',
  'opt_ins',
  'opt_ins_call_text',
  'billable_leads',
] as const;

const hasCounts = (body: Json): boolean => COUNT_KEYS.every((key) => isNullableCount(body[key]));

const countsFrom = (body: Json) => ({
  searches: body.searches as PilotCount,
  postsFound: body.posts_found as PilotCount,
  repliesSent: body.replies_sent as PilotCount,
  repliesViaWebhook: body.replies_via_webhook as PilotCount,
  optIns: body.opt_ins as PilotCount,
  optInsCallText: body.opt_ins_call_text as PilotCount,
  billableLeads: body.billable_leads as PilotCount,
});

const parsePlatform = (body: unknown): PilotPlatformRow | null => {
  const platform = isRecord(body) ? text(body.platform) : null;
  const label = isRecord(body) ? text(body.label) : null;
  const isReadable = isRecord(body) && platform !== null && label !== null && hasCounts(body);
  return isReadable ? { platform, label, ...countsFrom(body) } : null;
};

const parseTotals = (body: unknown): PilotTotals | null => {
  const isReadable = isRecord(body) && hasCounts(body) && isNullableCount(body.duplicates_excluded);
  return isReadable ? { ...countsFrom(body), duplicatesExcluded: body.duplicates_excluded as PilotCount } : null;
};

const parseWeeks = (value: unknown) => {
  if (!Array.isArray(value)) {
    return null;
  }
  const weeks = value.map((week) =>
    isRecord(week) && typeof week.week_start === 'string' && isCount(week.delivered)
      ? { weekStart: week.week_start, delivered: week.delivered }
      : null,
  );
  return weeks.every((week) => week !== null) ? (weeks as { weekStart: string; delivered: number }[]) : null;
};

const parseAvailableAgents = (body: Json): PilotAgents | null => {
  const weeks = parseWeeks(body.weeks);
  const isReadable = body.available === true && isCount(body.total) && weeks !== null;
  return isReadable ? { available: true, total: body.total as number, weeks } : null;
};

const parseAgents = (body: unknown): PilotAgents | null => {
  const isMissingSource = isRecord(body) && body.available === false;
  if (isMissingSource) {
    return { available: false, reason: text(body.reason) ?? '' };
  }
  return isRecord(body) ? parseAvailableAgents(body) : null;
};

const parseSource = (body: unknown): PilotSourceStatus | null => {
  const isReadable = isRecord(body) && typeof body.available === 'boolean';
  return isReadable ? { available: body.available as boolean, reason: text(body.reason) ?? '' } : null;
};

const parseRange = (body: unknown): PilotReport['range'] | null => {
  const from = isRecord(body) ? text(body.from) : null;
  const to = isRecord(body) ? text(body.to) : null;
  const timezone = isRecord(body) ? text(body.timezone) : null;
  return from !== null && to !== null && timezone !== null ? { from, to, timezone } : null;
};

const parseReport = (body: Json, sources: Json, rows: unknown[]): PilotReport | null => {
  const platforms = rows.map(parsePlatform);
  const month = text(body.month);
  const range = parseRange(body.range);
  const totals = parseTotals(body.totals);
  const agents = parseAgents(body.agents);
  const events = parseSource(sources.events);
  const leadMagnet = parseSource(sources.lead_magnet);

  const isComplete =
    month !== null &&
    range !== null &&
    totals !== null &&
    agents !== null &&
    events !== null &&
    leadMagnet !== null &&
    platforms.every((row) => row !== null);
  return isComplete
    ? { month, range, platforms: platforms as PilotPlatformRow[], totals, agents, sources: { events, leadMagnet } }
    : null;
};

export const parsePilotReport = (body: unknown): PilotReport | null => {
  const isShaped = isRecord(body) && Array.isArray(body.platforms) && isRecord(body.sources);
  return isShaped ? parseReport(body, body.sources as Json, body.platforms as unknown[]) : null;
};

export const parseBillableExport = (body: unknown): BillableExport | null => {
  if (!isRecord(body)) {
    return null;
  }
  const month = text(body.month);
  const filename = text(body.filename);
  const csv = text(body.csv);
  const isReadable =
    month !== null && filename !== null && csv !== null && isCount(body.count) && isCount(body.duplicates_excluded);
  return isReadable
    ? { month, filename, csv, count: body.count as number, duplicatesExcluded: body.duplicates_excluded as number }
    : null;
};
