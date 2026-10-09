import type { SocialFeedProvider, SocialMonitorRule, FeedFetchOutcome } from '../types';
import { parseFeedFetchOutcome } from '../feed-outcome-guard';

const SOCIAL_FETCH_PATH = '/xophz-freshmints/v1/social/fetch';

interface WpApiSettings {
  root?: string;
  nonce?: string;
}

/** Same resolution as `fetchLiveOpenRegistryData`: WordPress-injected settings, else same-origin defaults. */
const resolveRestConfig = (): { endpoint: string; nonce: string } => {
  const settings: WpApiSettings | undefined =
    typeof window === 'undefined' ? undefined : (window as any).wpApiSettings;
  const restRoot = settings?.root || '/wp-json/';
  const nonce = settings?.nonce || '';
  return { endpoint: `${restRoot.replace(/\/$/, '')}${SOCIAL_FETCH_PATH}`, nonce };
};

/** WordPress REST errors carry `{ code, message }`; pull the message out when it is there. */
const readWordPressMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    const message = (body as { message?: unknown } | null)?.message;
    return typeof message === 'string' ? message : '';
  } catch {
    return '';
  }
};

/**
 * Reddit sends no CORS headers, so the browser cannot call it. The Fresh Mints
 * plugin relays the search server-side; this provider talks to that relay and
 * returns the relay's outcome after validating its shape.
 */
export class RedditPublicProvider implements SocialFeedProvider {
  id: 'reddit' = 'reddit';
  displayName = 'Reddit (Public JSON Feed)';

  isConfigured(): boolean {
    return true;
  }

  async fetchPosts(rule: SocialMonitorRule): Promise<FeedFetchOutcome> {
    const isApplicable = rule.platforms.includes('reddit');
    const hasKeywords = rule.keywords.length > 0;
    const canRun = isApplicable && hasKeywords;

    if (!canRun) {
      return { status: 'ok', posts: [] };
    }

    const { endpoint, nonce } = resolveRestConfig();
    const targetChannels = rule.targetSubreddits ?? [];

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ platform: 'reddit', keywords: rule.keywords, targetChannels }),
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'unknown network error';
      return {
        status: 'blocked',
        reason: `The Fresh Mints server could not be reached for the Reddit search (${detail}).`,
      };
    }

    if (!response.ok) {
      const serverMessage = await readWordPressMessage(response);
      const suffix = serverMessage ? `: ${serverMessage}` : '.';
      return {
        status: 'failed',
        reason: `The Reddit search route returned HTTP ${response.status}${suffix}`,
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: 'failed', reason: 'The Reddit search route returned a response that was not valid JSON.' };
    }

    const outcome = parseFeedFetchOutcome(payload);
    if (!outcome) {
      return { status: 'failed', reason: 'The Reddit search route returned a response in an unrecognized format.' };
    }

    return outcome;
  }
}
