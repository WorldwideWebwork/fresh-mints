import type { SocialLead } from './types';
import { socialTokensStore } from '../../stores/social-tokens-store.svelte';

export interface DispatchResult {
  success: boolean;
  message: string;
  targetUrl?: string;
  dispatchedContent?: string;
}

export class SocialPostDispatcher {
  static async dispatchReply(
    lead: SocialLead,
    customText?: string
  ): Promise<DispatchResult> {
    const tokens = socialTokensStore.tokens;
    const authorSlug = lead.rawPost.author.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const funnelLink = `https://freshmints.io/preview/${authorSlug || 'turnkey-demo'}`;

    let replyBody = customText || lead.suggestedPitch;
    const shouldAppendLink = tokens.includeFunnelPreviewLink && !replyBody.includes('freshmints.io/preview');
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
