import type { SocialLead } from './types';
import { socialPreferencesStore } from '../../stores/social-preferences-store.svelte';
import { relayDispatchToServer } from './social-dispatch-relay';

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
    const preferences = socialPreferencesStore.preferences;
    const authorSlug = lead.rawPost.author.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const funnelBase = resolveFunnelBase(lead);
    const funnelLink = `${funnelBase}/${authorSlug || 'turnkey-demo'}`;

    let replyBody = customText || lead.suggestedPitch;
    const isLinkEnabledGlobally = preferences.includeFunnelPreviewLink;
    const isLinkEnabledForRule = lead.appendFunnelLink !== false;
    const hasLinkAlready = replyBody.includes(stripScheme(funnelBase));
    const shouldAppendLink = isLinkEnabledGlobally && isLinkEnabledForRule && !hasLinkAlready;
    if (shouldAppendLink) {
      replyBody = `${replyBody}\n\n[Interactive Portfolio & Booking Demo]: ${funnelLink}`;
    }

    // The webhook URL is a Connectors API credential held by the server, so the browser only
    // asks the server to relay. A server with no webhook configured answers "not configured",
    // and the reply then goes out by the copy-and-paste path below.
    const relay = await relayDispatchToServer(lead, replyBody);

    const isSent = relay.status === 'sent';
    if (isSent) {
      return {
        success: true,
        message: relay.message,
        targetUrl: lead.rawPost.url,
        dispatchedContent: replyBody,
      };
    }

    const isFailed = relay.status === 'failed';
    if (isFailed) {
      return {
        success: false,
        message: `Webhook dispatch error: ${relay.reason}`,
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
