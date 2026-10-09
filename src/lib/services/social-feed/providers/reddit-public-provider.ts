import type { SocialFeedProvider, SocialMonitorRule, FeedFetchOutcome } from '../types';
import { createServerFeedProvider } from './server-feed-provider';

const REDDIT_DISPLAY_NAME = 'Reddit (Public JSON Feed)';

/** Reddit through the Fresh Mints server route; the shared relay lives in the factory. */
export class RedditPublicProvider implements SocialFeedProvider {
  id: 'reddit' = 'reddit';
  displayName = REDDIT_DISPLAY_NAME;

  private readonly relay = createServerFeedProvider('reddit', REDDIT_DISPLAY_NAME);

  isConfigured(): boolean {
    return this.relay.isConfigured();
  }

  fetchPosts(rule: SocialMonitorRule): Promise<FeedFetchOutcome> {
    return this.relay.fetchPosts(rule);
  }
}
