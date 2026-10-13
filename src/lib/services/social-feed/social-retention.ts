import type { SocialLead } from './types';

/**
 * Reddit data handling for Social Radar leads. Pure functions: no network, no storage, no clock
 * except the `now` a caller passes in.
 *
 * What a stored lead may hold:
 *   - the post's id, title, permalink, channel (subreddit), created time and score;
 *   - our own output: the matched rule and keyword, intent score, pain-point label, draft reply,
 *     status and evaluation time (plus the funnel-link settings copied from the rule);
 *   - the author handle, only while the lead is open for a reply (it also leaves the draft reply).
 * Anything else, above all the post's body text, is dropped as soon as evaluation is done.
 *
 * A lead is kept for the retention window (days, a server setting), then purged. A Reddit post
 * that was deleted or removed on Reddit is dropped when a live check says so.
 */

export const DEFAULT_RETENTION_DAYS = 30;
export const MIN_RETENTION_DAYS = 1;
export const MAX_RETENTION_DAYS = 90;
export const LIVE_CHECK_BATCH_SIZE = 100;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REDDIT = 'reddit';
const AUTHOR_REMOVED = '[author removed]';

/** A lead is open for a reply until it is converted to a CRM lead or dismissed. */
export const isLeadOpenForReply = (lead: SocialLead): boolean => lead.status === 'radar';

/** A whole number of days inside the allowed range; anything else is the default. */
export const normalizeRetentionDays = (value: unknown): number => {
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  if (!isNumber) {
    return DEFAULT_RETENTION_DAYS;
  }
  return Math.min(MAX_RETENTION_DAYS, Math.max(MIN_RETENTION_DAYS, Math.floor(value)));
};

/**
 * The draft reply often names the author ("Hey u/name, ..."). Once the handle is dropped it goes
 * from the reply too, so it does not live on in that text. Only the exact handle is replaced.
 */
const withoutHandle = (text: string, handle: string): string => {
  const hasHandle = typeof handle === 'string' && typeof text === 'string' && handle.trim() !== '';
  return hasHandle ? text.split(handle).join(AUTHOR_REMOVED) : text;
};

const THREAD_NAME_PREFIX = 'Reddit thread';
const THREAD_NAME_MAX_TITLE = 60;

/**
 * What a converted Reddit lead is called in the CRM: the thread, never the person who wrote it.
 */
export const redditThreadLeadName = (title: string): string => {
  const shortTitle = typeof title === 'string' ? title.trim().slice(0, THREAD_NAME_MAX_TITLE).trim() : '';
  return shortTitle === '' ? THREAD_NAME_PREFIX : `${THREAD_NAME_PREFIX}: ${shortTitle}`;
};

/**
 * The lead reduced to the fields above. It is built field by field from an allow-list, so a field
 * nobody listed here (a future one included) never survives. A new field needs a decision here.
 */
export const minimizeSocialLead = (lead: SocialLead): SocialLead => {
  const { rawPost } = lead;
  const keepAuthor = isLeadOpenForReply(lead);

  return {
    id: lead.id,
    rawPost: {
      id: rawPost.id,
      platform: rawPost.platform,
      externalId: rawPost.externalId,
      author: keepAuthor ? rawPost.author : '',
      title: rawPost.title,
      content: '',
      url: rawPost.url,
      timestamp: rawPost.timestamp,
      ...(rawPost.score !== undefined && { score: rawPost.score }),
      ...(rawPost.subredditOrChannel !== undefined && { subredditOrChannel: rawPost.subredditOrChannel }),
    },
    matchedRuleId: lead.matchedRuleId,
    matchedKeyword: lead.matchedKeyword,
    intentScore: lead.intentScore,
    detectedPainPoint: lead.detectedPainPoint,
    suggestedPitch: keepAuthor ? lead.suggestedPitch : withoutHandle(lead.suggestedPitch, rawPost.author),
    status: lead.status,
    evaluatedAt: lead.evaluatedAt,
    ...(lead.convertedLeadId !== undefined && { convertedLeadId: lead.convertedLeadId }),
    ...(lead.appendFunnelLink !== undefined && { appendFunnelLink: lead.appendFunnelLink }),
    ...(lead.funnelBaseUrl !== undefined && { funnelBaseUrl: lead.funnelBaseUrl }),
    ...(lead.attributeFunnelLink !== undefined && { attributeFunnelLink: lead.attributeFunnelLink }),
  };
};

export const minimizeSocialLeads = (leads: readonly SocialLead[]): SocialLead[] => leads.map(minimizeSocialLead);

/**
 * When we took the lead in: the evaluation time, else the post's own time. NaN when neither
 * parses, which counts as expired because its age cannot be shown to be inside the window.
 */
const ageReferenceMs = (lead: SocialLead): number => {
  const evaluated = Date.parse(lead.evaluatedAt);
  return Number.isFinite(evaluated) ? evaluated : Date.parse(lead.rawPost.timestamp);
};

export const isSocialLeadExpired = (lead: SocialLead, now: Date, retentionDays: number): boolean => {
  const reference = ageReferenceMs(lead);
  const windowMs = normalizeRetentionDays(retentionDays) * MS_PER_DAY;
  return !Number.isFinite(reference) || now.getTime() - reference > windowMs;
};

export const purgeExpiredSocialLeads = (
  leads: readonly SocialLead[],
  now: Date,
  retentionDays: number
): SocialLead[] => leads.filter((lead) => !isSocialLeadExpired(lead, now, retentionDays));

export type LiveCheckCode = 'not_configured' | 'rate_limited' | 'unreachable' | 'failed';

export interface LiveCheckProblem {
  readonly code: LiveCheckCode;
  readonly reason: string;
  readonly retryAfterSeconds?: number;
}

/** What the server's live check answered about a list of Reddit post ids. */
export type LiveCheckOutcome =
  | { readonly status: 'ok'; readonly live: readonly string[]; readonly gone: readonly string[] }
  | ({ readonly status: 'unavailable' } & LiveCheckProblem);

/** Asks the server which of at most LIVE_CHECK_BATCH_SIZE Reddit post ids are still live. */
export type LiveCheck = (ids: string[]) => Promise<LiveCheckOutcome>;

export interface LiveFilterResult {
  /** Leads to keep: verified live Reddit posts, and every lead from a platform with no live check. */
  readonly live: SocialLead[];
  /** Reddit posts the check says were deleted or removed. Drop these. */
  readonly gone: SocialLead[];
  /** Reddit posts the check could not speak for. Not known live, not known gone. */
  readonly unverified: SocialLead[];
  /** Why the check could not run, or null when it ran for every post. */
  readonly problem: LiveCheckProblem | null;
}

const redditPostId = (lead: SocialLead): string | null => {
  const isReddit = lead.rawPost.platform === REDDIT;
  const externalId: unknown = lead.rawPost.externalId; // saved data from older versions may lack it
  const id = typeof externalId === 'string' ? externalId.trim().toLowerCase() : '';
  return isReddit && id !== '' ? id : null;
};

const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
};

const runCheck = async (check: LiveCheck, ids: string[]): Promise<LiveCheckOutcome> => {
  try {
    return await check(ids);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'unknown error';
    return { status: 'unavailable', code: 'failed', reason: detail };
  }
};

interface Verdicts {
  readonly live: Set<string>;
  readonly gone: Set<string>;
  readonly problem: LiveCheckProblem | null;
}

/** One call per batch. The first batch the server cannot answer ends the run, so a pause is honoured. */
const collectVerdicts = async (ids: readonly string[], check: LiveCheck): Promise<Verdicts> => {
  const live = new Set<string>();
  const gone = new Set<string>();

  for (const batch of chunk(ids, LIVE_CHECK_BATCH_SIZE)) {
    const outcome = await runCheck(check, batch);
    const isUnavailable = outcome.status === 'unavailable';
    if (isUnavailable) {
      const { code, reason, retryAfterSeconds } = outcome;
      return { live, gone, problem: { code, reason, ...(retryAfterSeconds !== undefined && { retryAfterSeconds }) } };
    }
    outcome.live.forEach((id) => live.add(id.toLowerCase()));
    outcome.gone.forEach((id) => gone.add(id.toLowerCase()));
  }

  return { live, gone, problem: null };
};

/**
 * Sorts leads by what the server's live check says about their Reddit posts. Never guesses: a
 * post is `gone` only if the server said so, `live` only if the server said so, and otherwise
 * `unverified`. Leads from other platforms have no live check and are kept as `live`.
 */
export const filterLiveSocialLeads = async (
  leads: readonly SocialLead[],
  check: LiveCheck
): Promise<LiveFilterResult> => {
  const ids = [...new Set(leads.map(redditPostId).filter((id): id is string => id !== null))];
  const verdicts = ids.length > 0 ? await collectVerdicts(ids, check) : { live: new Set<string>(), gone: new Set<string>(), problem: null };

  const live: SocialLead[] = [];
  const gone: SocialLead[] = [];
  const unverified: SocialLead[] = [];

  for (const lead of leads) {
    const id = redditPostId(lead);
    const isReddit = lead.rawPost.platform === REDDIT;
    if (!isReddit) {
      live.push(lead);
    } else if (id !== null && verdicts.gone.has(id)) {
      gone.push(lead);
    } else if (id !== null && verdicts.live.has(id)) {
      live.push(lead);
    } else {
      unverified.push(lead);
    }
  }

  return { live, gone, unverified, problem: verdicts.problem };
};

const UNVERIFIED_FALLBACK = 'the check did not cover this post';

/**
 * Why a reply must not go out for a lead, from the live filter run on that one lead. Null when
 * the post is confirmed live (or has no live check) and the reply may proceed.
 */
export const dispatchBlockReason = (result: LiveFilterResult): string | null => {
  const isGone = result.gone.length > 0;
  const isUnverified = result.unverified.length > 0;
  if (isGone) {
    return 'This post was deleted or removed on Reddit, so the lead was dropped and nothing was sent.';
  }
  if (isUnverified) {
    const reason = result.problem?.reason ?? UNVERIFIED_FALLBACK;
    return `Could not confirm the post is still on Reddit (${reason}). Nothing was sent; try again shortly.`;
  }
  return null;
};

export interface SocialDataRulesInput {
  readonly now: Date;
  readonly retentionDays: number;
  readonly check: LiveCheck;
}

export interface SocialDataRulesRun {
  /** Ids of leads past the retention window. */
  readonly purgedIds: ReadonlySet<string>;
  /** Ids of Reddit leads whose post was deleted or removed on Reddit. */
  readonly goneIds: ReadonlySet<string>;
  /** Reddit leads the live check could not speak for. They stay until it can. */
  readonly unverifiedCount: number;
  readonly problem: LiveCheckProblem | null;
}

const idsOf = (leads: readonly SocialLead[]): Set<string> => new Set(leads.map((lead) => lead.id));

/**
 * Which stored leads must go: first those past the retention window (no need to ask Reddit about
 * a lead that is leaving anyway), then Reddit posts the live check says are gone. It only names
 * the leads to drop; the caller removes them from its own, possibly newer, list.
 */
export const enforceSocialDataRules = async (
  leads: readonly SocialLead[],
  input: SocialDataRulesInput
): Promise<SocialDataRulesRun> => {
  const kept = purgeExpiredSocialLeads(leads, input.now, input.retentionDays);
  const keptIds = idsOf(kept);
  const purgedIds = idsOf(leads.filter((lead) => !keptIds.has(lead.id)));
  const live = await filterLiveSocialLeads(kept, input.check);

  return {
    purgedIds,
    goneIds: idsOf(live.gone),
    unverifiedCount: live.unverified.length,
    problem: live.problem,
  };
};
