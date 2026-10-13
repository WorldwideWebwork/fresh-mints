import type { SocialLead } from './types';
import { socialPreferencesStore } from '../../stores/social-preferences-store.svelte';
import { composeReplyBody } from './funnel-link';
import { relayDispatchToServer } from './social-dispatch-relay';

export interface DispatchResult {
  success: boolean;
  message: string;
  targetUrl?: string;
  dispatchedContent?: string;
}

const COPIED_MESSAGE = 'Pitch copied and formatted with your funnel link. Paste directly into the thread.';
const COPIED_WITHOUT_GUIDE_MESSAGE =
  'Reply copied without the guide link: add your guide page URL in Social Radar Settings. Paste directly into the thread.';

export class SocialPostDispatcher {
  static async dispatchReply(
    lead: SocialLead,
    customText?: string
  ): Promise<DispatchResult> {
    const preferences = socialPreferencesStore.preferences;
    const composed = composeReplyBody(lead, customText || lead.suggestedPitch, {
      linksEnabled: preferences.includeFunnelPreviewLink,
      guidePageUrl: preferences.guidePageUrl ?? '',
    });
    const replyBody = composed.body;

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

    const isGuideLinkMissing = composed.linkOutcome === 'unavailable';
    return {
      success: true,
      message: isGuideLinkMissing ? COPIED_WITHOUT_GUIDE_MESSAGE : COPIED_MESSAGE,
      targetUrl: lead.rawPost.url,
      dispatchedContent: replyBody,
    };
  }
}
