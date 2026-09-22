export interface SocialApiTokens {
  redditClientId: string;
  redditClientSecret: string;
  redditUsername: string;
  redditPassword: string;
  twitterBearerToken: string;
  ayrshareApiKey: string;
  webhookUrl: string;
  autoPostEnabled: boolean;
  autoPostThreshold: number;
  includeFunnelPreviewLink: boolean;
}

const DEFAULT_TOKENS: SocialApiTokens = {
  redditClientId: '',
  redditClientSecret: '',
  redditUsername: '',
  redditPassword: '',
  twitterBearerToken: '',
  ayrshareApiKey: '',
  webhookUrl: '',
  autoPostEnabled: false,
  autoPostThreshold: 85,
  includeFunnelPreviewLink: true,
};

class SocialTokensStore {
  tokens = $state<SocialApiTokens>(DEFAULT_TOKENS);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = localStorage.getItem('fresh_mints_social_tokens');
    if (!saved) {
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      this.tokens = { ...DEFAULT_TOKENS, ...parsed };
    } catch {
      this.tokens = DEFAULT_TOKENS;
    }
  }

  saveTokens(updates: Partial<SocialApiTokens>) {
    this.tokens = { ...this.tokens, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_social_tokens', JSON.stringify(this.tokens));
    }
  }

  hasConfiguredKey(): boolean {
    const hasReddit = Boolean(this.tokens.redditClientId && this.tokens.redditClientSecret);
    const hasTwitter = Boolean(this.tokens.twitterBearerToken);
    const hasAyrshare = Boolean(this.tokens.ayrshareApiKey);
    const hasWebhook = Boolean(this.tokens.webhookUrl);
    return hasReddit || hasTwitter || hasAyrshare || hasWebhook;
  }
}

export const socialTokensStore = new SocialTokensStore();
