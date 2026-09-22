import type { SocialFeedProvider, SocialPlatform, SocialMonitorRule, SocialLead, RawSocialPost } from './types';
import { HackerNewsProvider } from './providers/hacker-news-provider';
import { RedditPublicProvider } from './providers/reddit-public-provider';
import { SocialIntentAnalyzer } from './social-intent-analyzer';

export class SocialFeedRegistry {
  private static instance: SocialFeedRegistry;
  private providers = new Map<SocialPlatform, SocialFeedProvider>();

  private constructor() {
    this.registerProvider(new HackerNewsProvider());
    this.registerProvider(new RedditPublicProvider());
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

  public async scanRules(rules: SocialMonitorRule[]): Promise<SocialLead[]> {
    const activeRules = rules.filter((r) => r.isActive);
    const results: SocialLead[] = [];
    const seenPostUrls = new Set<string>();

    for (const rule of activeRules) {
      for (const platformId of rule.platforms) {
        const provider = this.providers.get(platformId);
        const canExecute = provider && provider.isConfigured();

        if (canExecute) {
          const rawPosts: RawSocialPost[] = await provider.fetchPosts(rule);

          for (const post of rawPosts) {
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
    }

    return results.sort((a, b) => b.intentScore - a.intentScore);
  }
}

export const socialFeedRegistry = SocialFeedRegistry.getInstance();
