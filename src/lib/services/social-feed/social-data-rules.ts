import type { SocialLead } from './types';
import {
  dispatchBlockReason,
  enforceSocialDataRules,
  filterLiveSocialLeads,
  type LiveCheck,
  type SocialDataRulesRun,
} from './social-retention';
import { checkRedditPostsLive, fetchRetentionDays } from './social-retention-relay';

/**
 * Puts the Reddit data rules to work on a store of social leads: the retention window, the live
 * check before a lead is kept or a reply goes out, and a plain message when Reddit cannot be asked.
 * The store only says where its leads are and how to remove some; the rules live in social-retention.
 */

export type SocialNoticeKind = 'info' | 'error';

export interface SocialLeadHost {
  leads(): readonly SocialLead[];
  remove(ids: ReadonlySet<string>): void;
  notify(kind: SocialNoticeKind, title: string, message: string): void;
}

export interface SocialDataRulesDeps {
  readonly retentionDays: () => Promise<number>;
  readonly check: LiveCheck;
  readonly now: () => Date;
}

const LIVE_DEPS: SocialDataRulesDeps = {
  retentionDays: fetchRetentionDays,
  check: checkRedditPostsLive,
  now: () => new Date(),
};

interface Notice {
  readonly title: string;
  readonly message: string;
}

/** What a run should tell the user: posts dropped because Reddit removed them, leads Reddit could not vouch for. */
export const describeDataRulesRun = (run: SocialDataRulesRun): Notice[] => {
  const notices: Notice[] = [];
  const goneCount = run.goneIds.size;
  const hasGone = goneCount > 0;
  if (hasGone) {
    notices.push({
      title: 'Reddit Posts Removed',
      message: `${goneCount} lead(s) dropped: the post was deleted or removed on Reddit.`,
    });
  }
  const problem = run.problem;
  const wasNotRechecked = problem !== null && run.unverifiedCount > 0;
  if (wasNotRechecked) {
    notices.push({
      title: 'Reddit Posts Not Re-checked',
      message: `${run.unverifiedCount} Reddit lead(s) could not be re-checked: ${problem.reason}`,
    });
  }
  return notices;
};

/**
 * Drops leads past the retention window and Reddit posts deleted or removed on Reddit. A lead
 * Reddit cannot be asked about stays, and the reason is shown instead of a verdict being guessed.
 */
export const applySocialDataRules = async (
  host: SocialLeadHost,
  deps: SocialDataRulesDeps = LIVE_DEPS
): Promise<void> => {
  const leads = host.leads();
  const hasNoLeads = leads.length === 0;
  if (hasNoLeads) {
    return;
  }

  try {
    const retentionDays = await deps.retentionDays();
    const run = await enforceSocialDataRules(leads, { now: deps.now(), retentionDays, check: deps.check });
    host.remove(new Set([...run.purgedIds, ...run.goneIds]));
    describeDataRulesRun(run).forEach((notice) => host.notify('info', notice.title, notice.message));
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'unknown error';
    host.notify('error', 'Social Radar Data Rules', `Could not apply the retention rules: ${detail}`);
  }
};

const MISSING_LEAD_REASON = 'This lead is no longer on the radar. Nothing was sent.';

/**
 * Run before a reply goes out. Null: the reply may go (the post is confirmed live, or the lead is
 * not from Reddit). Otherwise the reason it must not, and a post gone from Reddit drops the lead.
 */
export const socialDispatchBlockReason = async (
  host: SocialLeadHost,
  socialLeadId: string,
  check: LiveCheck = checkRedditPostsLive
): Promise<string | null> => {
  const lead = host.leads().find((candidate) => candidate.id === socialLeadId);
  if (!lead) {
    return MISSING_LEAD_REASON;
  }

  const result = await filterLiveSocialLeads([lead], check);
  host.remove(new Set(result.gone.map((gone) => gone.id)));
  return dispatchBlockReason(result);
};
