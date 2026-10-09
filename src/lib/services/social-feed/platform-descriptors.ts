import type { SocialPlatform } from './types';

export type PlatformBadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'danger' | 'outline';

export interface PlatformDescriptor {
  readonly badgeLabel: string;
  readonly badgeVariant: PlatformBadgeVariant;
}

export interface RulePlatformOption {
  readonly id: SocialPlatform;
  readonly toggleLabel: string;
}

/** One entry per platform, so the lead badge never needs a conditional chain. */
export const PLATFORM_DESCRIPTORS: Readonly<Record<SocialPlatform, PlatformDescriptor>> = {
  hacker_news: { badgeLabel: 'Hacker News', badgeVariant: 'warning' },
  reddit: { badgeLabel: 'Reddit', badgeVariant: 'danger' },
  stack_exchange: { badgeLabel: 'Stack Exchange', badgeVariant: 'info' },
  youtube: { badgeLabel: 'YouTube', badgeVariant: 'success' },
  bluesky: { badgeLabel: 'Bluesky', badgeVariant: 'default' },
  x: { badgeLabel: 'X', badgeVariant: 'outline' },
};

/** The platforms a rule can monitor today, in the order the modal lists them. */
export const RULE_PLATFORM_OPTIONS: readonly RulePlatformOption[] = [
  { id: 'hacker_news', toggleLabel: 'Hacker News (Live Algolia API)' },
  { id: 'reddit', toggleLabel: 'Reddit (Live Public Feed)' },
  { id: 'stack_exchange', toggleLabel: 'Stack Exchange (Personal Finance & Money)' },
  { id: 'youtube', toggleLabel: 'YouTube (Video Comments)' },
];

const isKnownPlatform = (platform: string): platform is SocialPlatform =>
  Object.prototype.hasOwnProperty.call(PLATFORM_DESCRIPTORS, platform);

/**
 * Persisted leads may carry a platform this build does not know (for example the retired
 * `mock` source), so unknown values get a readable outline badge instead of throwing.
 */
export const describePlatform = (platform: string): PlatformDescriptor => {
  if (isKnownPlatform(platform)) return PLATFORM_DESCRIPTORS[platform];
  return { badgeLabel: platform.replace(/_/g, ' '), badgeVariant: 'outline' };
};
