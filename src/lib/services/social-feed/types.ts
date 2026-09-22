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

export interface SocialFeedProvider {
  id: SocialPlatform;
  displayName: string;
  isConfigured(): boolean;
  fetchPosts(rule: SocialMonitorRule): Promise<RawSocialPost[]>;
}
