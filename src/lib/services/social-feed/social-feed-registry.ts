import type {
  SocialFeedProvider,
  SocialPlatform,
  SocialMonitorRule,
  SocialLead,
  FeedScanProblem,
  FeedScanResult,
} from './types';
import { HackerNewsProvider } from './providers/hacker-news-provider';
import { RedditPublicProvider } from './providers/reddit-public-provider';
import { createServerFeedProvider } from './providers/server-feed-provider';
import { SocialIntentAnalyzer } from './social-intent-analyzer';

export class SocialFeedRegistry {
  private static instance: SocialFeedRegistry;
  private providers = new Map<SocialPlatform, SocialFeedProvider>();

  private constructor() {
    this.registerProvider(new HackerNewsProvider());
    this.registerProvider(new RedditPublicProvider());
    this.registerProvider(createServerFeedProvider('stack_exchange', 'Stack Exchange: Personal Finance & Money'));
    this.registerProvider(createServerFeedProvider('youtube', 'YouTube Comments'));
  }

  public static getInstance(): SocialFeedRegistry {
    if (!SocialFeedRegistry.instance) {
      SocialFeedRegistry.instance = new SocialFeedRegistry();
    }
    return SocialFeedRegistry.instance;
  }

  public registerProvider(provider: SocialFeedProvider) {
    this.providers.set(provider.id, provider);
  }

  public getAvailablePlatforms(): { id: SocialPlatform; name: string }[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.displayName,
    }));
  }

  public async scanRules(rules: SocialMonitorRule[]): Promise<FeedScanResult> {
    const activeRules = rules.filter((r) => r.isActive);
    const results: SocialLead[] = [];
    const seenPostUrls = new Set<string>();
    const problemsByPlatform = new Map<SocialPlatform, FeedScanProblem>();

    for (const rule of activeRules) {
      for (const platformId of rule.platforms) {
        const provider = this.providers.get(platformId);
        const canExecute = provider && provider.isConfigured();

        if (!canExecute) {
          continue;
        }

        const outcome = await provider.fetchPosts(rule);
        const didFetch = outcome.status === 'ok';

        if (!didFetch) {
          // One entry per platform: several rules can target the same feed and
          // we do not want the same outage reported once per rule.
          problemsByPlatform.set(platformId, {
            platform: platformId,
            displayName: provider.displayName,
            status: outcome.status,
            reason: outcome.reason,
          });
          continue;
        }

        for (const post of outcome.posts) {
          const isDuplicate = seenPostUrls.has(post.url);
          if (!isDuplicate) {
            seenPostUrls.add(post.url);
            const evaluated = SocialIntentAnalyzer.evaluatePost(post, rule);
            if (evaluated) {
              results.push(evaluated);
            }
          }
        }
      }
    }

    return {
      leads: results.sort((a, b) => b.intentScore - a.intentScore),
      problems: Array.from(problemsByPlatform.values()),
    };
  }
}

export const socialFeedRegistry = SocialFeedRegistry.getInstance();
