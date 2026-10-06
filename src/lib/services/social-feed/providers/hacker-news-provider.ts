import type { SocialFeedProvider, SocialMonitorRule, RawSocialPost, FeedFetchOutcome } from '../types';

interface HnHit {
  objectID: string;
  author: string;
  title?: string;
  story_title?: string;
  comment_text?: string;
  story_text?: string;
  url?: string;
  created_at: string;
  points?: number;
  num_comments?: number;
}

export class HackerNewsProvider implements SocialFeedProvider {
  id: 'hacker_news' = 'hacker_news';
  displayName = 'Hacker News (Algolia Search)';

  isConfigured(): boolean {
    return true;
  }

  async fetchPosts(rule: SocialMonitorRule): Promise<FeedFetchOutcome> {
    const isApplicable = rule.platforms.includes('hacker_news');
    if (!isApplicable || rule.keywords.length === 0) {
      return { status: 'ok', posts: [] };
    }

    const query = encodeURIComponent(rule.keywords.join(' '));
    const endpoint = `https://hn.algolia.com/api/v1/search_by_date?tags=(story,comment)&query=${query}&hitsPerPage=20`;

    try {
      const response = await fetch(endpoint);
      const isResponseOk = response.ok;
      if (!isResponseOk) {
        return {
          status: 'failed',
          reason: `Algolia HN search refused the request (HTTP ${response.status} ${response.statusText}).`,
        };
      }

      const data = await response.json();
      const hits: HnHit[] = Array.isArray(data.hits) ? data.hits : [];

      const posts: RawSocialPost[] = hits.map((hit) => {
        const itemTitle = hit.title || hit.story_title || 'Hacker News Discussion';
        const rawContent = hit.comment_text || hit.story_text || itemTitle;
        const cleanContent = rawContent.replace(/<[^>]*>?/gm, '');
        const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;

        return {
          id: `hn-${hit.objectID}`,
          platform: 'hacker_news',
          externalId: hit.objectID,
          author: hit.author || 'anonymous',
          title: itemTitle,
          content: cleanContent,
          url: itemUrl,
          timestamp: hit.created_at || new Date().toISOString(),
          score: hit.points || 1,
          commentsCount: hit.num_comments || 0,
        };
      });

      return { status: 'ok', posts };
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'unknown network error';
      return {
        status: 'blocked',
        reason: `Algolia HN search is unreachable (${detail}).`,
      };
    }
  }
}
