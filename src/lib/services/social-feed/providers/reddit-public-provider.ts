import type { SocialFeedProvider, SocialMonitorRule, RawSocialPost } from '../types';

interface RedditChild {
  data: {
    id: string;
    name: string;
    author: string;
    title: string;
    selftext: string;
    permalink: string;
    created_utc: number;
    score: number;
    num_comments: number;
    subreddit: string;
  };
}

export class RedditPublicProvider implements SocialFeedProvider {
  id: 'reddit' = 'reddit';
  displayName = 'Reddit (Public JSON Feed)';

  isConfigured(): boolean {
    return true;
  }

  async fetchPosts(rule: SocialMonitorRule): Promise<RawSocialPost[]> {
    const isApplicable = rule.platforms.includes('reddit');
    const hasKeywords = rule.keywords.length > 0;
    const canRun = isApplicable && hasKeywords;

    if (!canRun) {
      return [];
    }

    const query = encodeURIComponent(rule.keywords.join(' OR '));
    const targetSub = rule.targetSubreddits && rule.targetSubreddits.length > 0
      ? rule.targetSubreddits[0]
      : 'smallbusiness+entrepreneur+webdev+sales';

    const endpoint = `https://www.reddit.com/r/${targetSub}/search.json?q=${query}&sort=new&restrict_sr=on&limit=15`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const isOk = response.ok;
      if (!isOk) {
        return [];
      }

      const payload = await response.json();
      const children: RedditChild[] = payload?.data?.children || [];

      return children.map((item) => {
        const postData = item.data;
        const postTimestamp = new Date(postData.created_utc * 1000).toISOString();
        const postUrl = `https://www.reddit.com${postData.permalink}`;

        return {
          id: `reddit-${postData.id}`,
          platform: 'reddit',
          externalId: postData.id,
          author: `u/${postData.author}`,
          title: postData.title,
          content: postData.selftext || postData.title,
          url: postUrl,
          timestamp: postTimestamp,
          score: postData.score || 1,
          commentsCount: postData.num_comments || 0,
          subredditOrChannel: `r/${postData.subreddit}`,
        };
      });
    } catch {
      return [];
    }
  }
}
