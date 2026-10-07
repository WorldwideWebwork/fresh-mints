export type LeadSource = 'registry' | 'places' | 'social_radar' | 'manual' | 'csv';

export interface SocialLeadContext {
  platform: string;
  postUrl: string;
  originalPostText: string;
  matchedKeyword?: string;
  intentScore?: number;
  detectedPainPoint?: string;
  suggestedPitch?: string;
}
