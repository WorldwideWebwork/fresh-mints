import type { SocialFeedProvider, SocialMonitorRule, FeedFetchOutcome } from '../types';
import { parseFeedFetchOutcome } from '../feed-outcome-guard';

export type ServerFeedPlatform = 'reddit' | 'youtube' | 'stack_exchange';

const SOCIAL_FETCH_PATH = '/xophz-freshmints/v1/social/fetch';

const PLATFORM_LABELS: Readonly<Record<ServerFeedPlatform, string>> = {
  reddit: 'Reddit',
  youtube: 'YouTube',
  stack_exchange: 'Stack Exchange',
};

interface WpApiSettings {
  root?: string;
  nonce?: string;
}

const resolveRestConfig = (): { endpoint: string; nonce: string } => {
  const settings: WpApiSettings | undefined =
    typeof window === 'undefined' ? undefined : (window as any).wpApiSettings;
  const restRoot = settings?.root || '/wp-json/';
  const nonce = settings?.nonce || '';
  return { endpoint: `${restRoot.replace(/\/$/, '')}${SOCIAL_FETCH_PATH}`, nonce };
};

const readWordPressMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    const message = (body as { message?: unknown } | null)?.message;
    return typeof message === 'string' ? message : '';
  } catch {
    return '';
  }
};

/** Only Reddit is scoped by channel; the other platforms take no channel list. */
const resolveTargetChannels = (platform: ServerFeedPlatform, rule: SocialMonitorRule): string[] => {
  const isChannelScoped = platform === 'reddit';
  return isChannelScoped ? (rule.targetSubreddits ?? []) : [];
};

/**
 * A provider that never calls a third party from the browser. It relays the rule to the
 * Fresh Mints server route, which holds any credentials and dispatches on `platform`,
 * then validates the reply before any post reaches reactive state.
 */
export const createServerFeedProvider = (
  platform: ServerFeedPlatform,
  displayName: string,
): SocialFeedProvider => {
  const label = PLATFORM_LABELS[platform];

  const fetchPosts = async (rule: SocialMonitorRule): Promise<FeedFetchOutcome> => {
    const isApplicable = rule.platforms.includes(platform);
    const hasKeywords = rule.keywords.length > 0;
    const canRun = isApplicable && hasKeywords;

    if (!canRun) {
      return { status: 'ok', posts: [] };
    }

    const { endpoint, nonce } = resolveRestConfig();
    const targetChannels = resolveTargetChannels(platform, rule);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ platform, keywords: rule.keywords, targetChannels }),
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'unknown network error';
      return {
        status: 'blocked',
        reason: `The Fresh Mints server could not be reached for the ${label} search (${detail}).`,
      };
    }

    if (!response.ok) {
      const serverMessage = await readWordPressMessage(response);
      const suffix = serverMessage ? `: ${serverMessage}` : '.';
      return {
        status: 'failed',
        reason: `The ${label} search route returned HTTP ${response.status}${suffix}`,
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: 'failed', reason: `The ${label} search route returned a response that was not valid JSON.` };
    }

    const outcome = parseFeedFetchOutcome(payload, platform);
    if (!outcome) {
      return { status: 'failed', reason: `The ${label} search route returned a response in an unrecognized format.` };
    }

    return outcome;
  };

  return {
    id: platform,
    displayName,
    isConfigured: () => true,
    fetchPosts,
  };
};
