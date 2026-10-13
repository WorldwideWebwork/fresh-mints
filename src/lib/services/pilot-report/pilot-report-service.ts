import { parseBillableExport, parsePilotReport } from './pilot-report-parse';
import type { BillableExportOutcome, PilotFailure, PilotReportOutcome } from './types';

/**
 * The two administrator-only calls behind the pilot report: the month's numbers (GET pilot-report)
 * and the billable leads as CSV text (GET pilot-report/billable). Both use the WordPress REST nonce.
 * Neither throws; a problem comes back as a 'forbidden' or 'failed' outcome with a reason to show.
 */

const REPORT_PATH = '/xophz-freshmints/v1/pilot-report';
const BILLABLE_PATH = '/xophz-freshmints/v1/pilot-report/billable';
const FORBIDDEN_REASON = 'The pilot report is for WordPress administrators. Sign in with an administrator account.';
const UNREADABLE_REASON = 'The server sent a pilot report the app could not read.';

interface WpApiSettings {
  root?: string;
  nonce?: string;
}

const resolveRestConfig = (path: string, month: string): { endpoint: string; nonce: string } => {
  const settings: WpApiSettings | undefined =
    typeof window === 'undefined' ? undefined : (window as any).wpApiSettings;
  const restRoot = settings?.root || '/wp-json/';
  const separator = restRoot.includes('?') ? '&' : '?';
  const query = `${separator}month=${encodeURIComponent(month)}`;
  return { endpoint: `${restRoot.replace(/\/$/, '')}${path}${query}`, nonce: settings?.nonce || '' };
};

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const serverMessage = (body: unknown): string => {
  const message = typeof body === 'object' && body !== null ? (body as { message?: unknown }).message : undefined;
  return typeof message === 'string' ? message : '';
};

const refusal = (response: Response, body: unknown): PilotFailure => {
  const isForbidden = response.status === 401 || response.status === 403;
  if (isForbidden) {
    return { status: 'forbidden', reason: FORBIDDEN_REASON };
  }
  return { status: 'failed', reason: serverMessage(body) || `The server answered HTTP ${response.status}.` };
};

const unreachable = (err: unknown): PilotFailure => ({
  status: 'failed',
  reason: err instanceof Error ? err.message : 'Unknown network failure',
});

export const fetchPilotReport = async (month: string): Promise<PilotReportOutcome> => {
  const { endpoint, nonce } = resolveRestConfig(REPORT_PATH, month);

  let response: Response;
  try {
    response = await fetch(endpoint, { headers: { 'X-WP-Nonce': nonce } });
  } catch (err: unknown) {
    return unreachable(err);
  }

  const body = await readJson(response);
  const isRefused = !response.ok;
  if (isRefused) {
    return refusal(response, body);
  }
  const report = parsePilotReport(body);
  return report ? { status: 'ok', report } : { status: 'failed', reason: UNREADABLE_REASON };
};

export const fetchBillableExport = async (month: string): Promise<BillableExportOutcome> => {
  const { endpoint, nonce } = resolveRestConfig(BILLABLE_PATH, month);

  let response: Response;
  try {
    response = await fetch(endpoint, { headers: { 'X-WP-Nonce': nonce } });
  } catch (err: unknown) {
    return unreachable(err);
  }

  const body = await readJson(response);
  const isRefused = !response.ok;
  if (isRefused) {
    return refusal(response, body);
  }
  const billable = parseBillableExport(body);
  return billable ? { status: 'ok', export: billable } : { status: 'failed', reason: UNREADABLE_REASON };
};
