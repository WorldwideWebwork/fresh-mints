/**
 * The pilot report as the Fresh Mints server sends it (GET xophz-freshmints/v1/pilot-report).
 *
 * A count is null, never 0, when the report cannot know it: the source behind it is missing, or the
 * platform's searches do not run on the server. The view shows null as "n/a", not as zero.
 */

export type PilotCount = number | null;

export interface PilotPlatformRow {
  readonly platform: string;
  readonly label: string;
  /** Searches that answered. Counted per run, so a post two runs both return counts twice below. */
  readonly searches: PilotCount;
  readonly postsFound: PilotCount;
  /** Distinct social leads whose reply was dispatched. */
  readonly repliesSent: PilotCount;
  /** Of those, the ones the dispatch webhook accepted; the rest were copied for pasting by hand. */
  readonly repliesViaWebhook: PilotCount;
  readonly optIns: PilotCount;
  /** Opt-ins that checked the consent box with a phone number: calls and texts allowed. */
  readonly optInsCallText: PilotCount;
  /** Consent, a valid phone and email, once per email in the month. */
  readonly billableLeads: PilotCount;
}

export interface PilotTotals extends Omit<PilotPlatformRow, 'platform' | 'label'> {
  /** Billable-looking leads left out because the same email already counted this month. */
  readonly duplicatesExcluded: PilotCount;
}

export interface PilotAgentWeek {
  /** The Monday the week starts on, YYYY-MM-DD, on the site's clock. */
  readonly weekStart: string;
  readonly delivered: number;
}

export type PilotAgents =
  | { readonly available: true; readonly total: number; readonly weeks: PilotAgentWeek[] }
  | { readonly available: false; readonly reason: string };

export interface PilotSourceStatus {
  readonly available: boolean;
  readonly reason: string;
}

export interface PilotReport {
  readonly month: string;
  readonly range: { readonly from: string; readonly to: string; readonly timezone: string };
  readonly platforms: PilotPlatformRow[];
  readonly totals: PilotTotals;
  readonly agents: PilotAgents;
  readonly sources: { readonly events: PilotSourceStatus; readonly leadMagnet: PilotSourceStatus };
}

export interface BillableExport {
  readonly month: string;
  readonly filename: string;
  readonly count: number;
  readonly duplicatesExcluded: number;
  readonly csv: string;
}

/** 'forbidden' means the signed-in user is not an administrator (HTTP 401 or 403). */
export type PilotFailure =
  | { readonly status: 'forbidden'; readonly reason: string }
  | { readonly status: 'failed'; readonly reason: string };

export type PilotReportOutcome = { readonly status: 'ok'; readonly report: PilotReport } | PilotFailure;

export type BillableExportOutcome = { readonly status: 'ok'; readonly export: BillableExport } | PilotFailure;
