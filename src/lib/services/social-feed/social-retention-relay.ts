import {
  DEFAULT_RETENTION_DAYS,
  normalizeRetentionDays,
  type LiveCheckCode,
  type LiveCheckOutcome,
} from './social-retention';

/**
 * The two server calls behind Reddit data handling: which stored Reddit post ids are still live
 * (POST social/live-check) and how many days a lead may be kept (GET social/retention). Both are
 * administrator-only routes, called with the WordPress REST nonce.
 */

const LIVE_CHECK_PATH = '/xophz-freshmints/v1/social/live-check';
const RETENTION_PATH = '/xophz-freshmints/v1/social/retention';
const LAST_RETENTION_KEY = 'fresh_mints_social_retention_days';
const UNREADABLE_REASON = 'The server sent a live-check answer the app could not read.';
const CODES: readonly LiveCheckCode[] = ['not_configured', 'rate_limited', 'unreachable', 'failed'];

interface WpApiSettings {
  root?: string;
  nonce?: string;
}

const resolveRestConfig = (path: string): { endpoint: string; nonce: string } => {
  const settings: WpApiSettings | undefined =
    typeof window === 'undefined' ? undefined : (window as any).wpApiSettings;
  const restRoot = settings?.root || '/wp-json/';
  return { endpoint: `${restRoot.replace(/\/$/, '')}${path}`, nonce: settings?.nonce || '' };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const goneIds = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  const ids = value.map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : null));
  return ids.every((id): id is string => id !== null) ? ids : null;
};

const unreadable = (): LiveCheckOutcome => ({ status: 'unavailable', code: 'failed', reason: UNREADABLE_REASON });

const parseUnavailable = (body: Record<string, unknown>): LiveCheckOutcome => {
  const code = CODES.find((candidate) => candidate === body.code);
  const reason = typeof body.reason === 'string' ? body.reason : '';
  const retry = body.retryAfterSeconds;
  const hasRetry = typeof retry === 'number' && Number.isFinite(retry) && retry > 0;
  const isReadable = code !== undefined && reason !== '';
  if (!isReadable) {
    return unreadable();
  }
  return { status: 'unavailable', code, reason, ...(hasRetry && { retryAfterSeconds: retry }) };
};

/** Validates the server's live-check answer at runtime; anything unexpected is "unavailable". */
export const parseLiveCheckResponse = (body: unknown): LiveCheckOutcome => {
  if (!isRecord(body)) {
    return unreadable();
  }
  const isUnavailable = body.status === 'failed' || body.status === 'blocked';
  if (isUnavailable) {
    return parseUnavailable(body);
  }
  const gone = goneIds(body.gone);
  const isVerdict = body.status === 'ok' && isStringArray(body.live) && gone !== null;
  return isVerdict ? { status: 'ok', live: body.live as string[], gone: gone as string[] } : unreadable();
};

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/** Asks the server about at most 100 Reddit post ids. Never throws; a failure is an "unavailable" outcome. */
export const checkRedditPostsLive = async (ids: string[]): Promise<LiveCheckOutcome> => {
  const { endpoint, nonce } = resolveRestConfig(LIVE_CHECK_PATH);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
      body: JSON.stringify({ ids }),
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Unknown network failure';
    return { status: 'unavailable', code: 'unreachable', reason: detail };
  }

  const body = await readJson(response);
  const isRefused = !response.ok;
  if (isRefused) {
    const message = isRecord(body) && typeof body.message === 'string' ? body.message : '';
    return {
      status: 'unavailable',
      code: 'failed',
      reason: message || `The server answered HTTP ${response.status}.`,
    };
  }
  return parseLiveCheckResponse(body);
};

const rememberRetentionDays = (days: number): void => {
  try {
    localStorage.setItem(LAST_RETENTION_KEY, String(days));
  } catch {
    // chemx-allow: best-effort the stored copy only covers a later server outage; the next read stores it again
  }
};

const lastKnownRetentionDays = (): number => {
  try {
    const stored = Number(localStorage.getItem(LAST_RETENTION_KEY));
    return normalizeRetentionDays(Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_RETENTION_DAYS);
  } catch {
    return DEFAULT_RETENTION_DAYS;
  }
};

/**
 * The retention window in days from the server setting. When the server cannot be read it is the
 * last value read, else the 30-day default, so a lead is never kept longer than the default allows.
 */
export const fetchRetentionDays = async (): Promise<number> => {
  const { endpoint, nonce } = resolveRestConfig(RETENTION_PATH);

  try {
    const response = await fetch(endpoint, { headers: { 'X-WP-Nonce': nonce } });
    const body = await readJson(response);
    const days = isRecord(body) ? body.retentionDays : undefined;
    const isUsable = response.ok && typeof days === 'number' && Number.isFinite(days);
    if (!isUsable) {
      return lastKnownRetentionDays();
    }
    const normalized = normalizeRetentionDays(days);
    rememberRetentionDays(normalized);
    return normalized;
  } catch {
    return lastKnownRetentionDays();
  }
};
