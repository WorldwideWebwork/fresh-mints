export type SocialPlatform = 'hacker_news' | 'reddit' | 'bluesky' | 'x';

export type SocialLeadStatus = 'radar' | 'converted' | 'dismissed';

export interface SocialMonitorRule {
  id: string;
  name: string;
  keywords: string[];
  negativeKeywords: string[];
  platforms: SocialPlatform[];
  targetSubreddits?: string[];
  minIntentScore: number;
  isActive: boolean;
  autoConvertToCrm?: boolean;
  createdAt: string;
}

export interface RawSocialPost {
  id: string;
  platform: SocialPlatform;
  externalId: string;
  author: string;
  title: string;
  content: string;
  url: string;
  timestamp: string;
  score?: number;
  commentsCount?: number;
  subredditOrChannel?: string;
}

export interface SocialLead {
  id: string;
  rawPost: RawSocialPost;
  matchedRuleId: string;
  matchedKeyword: string;
  intentScore: number;
  detectedPainPoint: string;
  suggestedPitch: string;
  status: SocialLeadStatus;
  convertedLeadId?: string;
  evaluatedAt: string;
}

/**
 * Distinguishes "the feed returned nothing" from "the feed never answered".
 * 'blocked' means the request never completed (CORS, DNS, offline): the remedy
 * is a server-side proxy. 'failed' means the endpoint answered and refused
 * (rate limit, 403, 5xx): the remedy is backing off or authenticating.
 */
export type FeedFetchOutcome =
  | { readonly status: 'ok'; readonly posts: RawSocialPost[] }
  | { readonly status: 'blocked'; readonly reason: string }
  | { readonly status: 'failed'; readonly reason: string };

export interface FeedScanProblem {
  readonly platform: SocialPlatform;
  readonly displayName: string;
  readonly status: 'blocked' | 'failed';
  readonly reason: string;
}

export interface FeedScanResult {
  readonly leads: SocialLead[];
  readonly problems: FeedScanProblem[];
}

export interface SocialFeedProvider {
  id: SocialPlatform;
  displayName: string;
  isConfigured(): boolean;
  fetchPosts(rule: SocialMonitorRule): Promise<FeedFetchOutcome>;
}
