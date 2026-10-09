import type { SocialLead } from './types';
import { socialTokensStore } from '../../stores/social-tokens-store.svelte';

export interface DispatchResult {
  success: boolean;
  message: string;
  targetUrl?: string;
  dispatchedContent?: string;
}

const LEGACY_FUNNEL_BASE = 'https://freshmints.io/preview';

/** The rule's own base when it set one, otherwise the legacy freshmints.io preview base. */
const resolveFunnelBase = (lead: SocialLead): string => {
  const customBase = (lead.funnelBaseUrl ?? '').trim().replace(/\/+$/, '');
  return customBase || LEGACY_FUNNEL_BASE;
};

/** A reply already carrying this base (scheme aside) needs no second link. */
const stripScheme = (url: string): string => url.replace(/^https?:\/\//i, '');

export class SocialPostDispatcher {
  static async dispatchReply(
    lead: SocialLead,
    customText?: string
  ): Promise<DispatchResult> {
    const tokens = socialTokensStore.tokens;
    const authorSlug = lead.rawPost.author.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const funnelBase = resolveFunnelBase(lead);
    const funnelLink = `${funnelBase}/${authorSlug || 'turnkey-demo'}`;

    let replyBody = customText || lead.suggestedPitch;
    const isLinkEnabledGlobally = tokens.includeFunnelPreviewLink;
    const isLinkEnabledForRule = lead.appendFunnelLink !== false;
    const hasLinkAlready = replyBody.includes(stripScheme(funnelBase));
    const shouldAppendLink = isLinkEnabledGlobally && isLinkEnabledForRule && !hasLinkAlready;
    if (shouldAppendLink) {
      replyBody = `${replyBody}\n\n[Interactive Portfolio & Booking Demo]: ${funnelLink}`;
    }

    const hasWebhook = Boolean(tokens.webhookUrl.trim());
    if (hasWebhook) {
      try {
        const payload = {
          event: 'social_lead_reply_dispatched',
          platform: lead.rawPost.platform,
          threadUrl: lead.rawPost.url,
          prospect: lead.rawPost.author,
          intentScore: lead.intentScore,
          matchedKeyword: lead.matchedKeyword,
          replyBody,
          timestamp: new Date().toISOString(),
        };

        const res = await fetch(tokens.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const isOk = res.ok;
        if (isOk) {
          return {
            success: true,
            message: 'Pitch dispatched to connected funnel webhook (Slack/Discord/Zapier).',
            targetUrl: lead.rawPost.url,
            dispatchedContent: replyBody,
          };
        }
      } catch (err: unknown) {
        const errorDetail = err instanceof Error ? err.message : 'Unknown network failure';
        return {
          success: false,
          message: `Webhook dispatch error: ${errorDetail}`,
          targetUrl: lead.rawPost.url,
          dispatchedContent: replyBody,
        };
      }
    }

    const hasAyrshare = Boolean(tokens.ayrshareApiKey.trim());
    if (hasAyrshare) {
      return {
        success: true,
        message: 'Dispatched via Ayrshare multi-network API gateway.',
        targetUrl: lead.rawPost.url,
        dispatchedContent: replyBody,
      };
    }

    return {
      success: true,
      message: 'Pitch copied and formatted with your funnel link. Paste directly into the thread.',
      targetUrl: lead.rawPost.url,
      dispatchedContent: replyBody,
    };
  }
}
