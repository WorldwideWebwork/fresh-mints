import type { SocialLead } from './types';

/**
 * Hands a dispatched reply to the Fresh Mints server, which holds the dispatch webhook URL
 * (a Connectors API credential) and makes the one outbound POST. The browser never sees,
 * stores or sends that URL.
 */

const SOCIAL_DISPATCH_PATH = '/xophz-freshmints/v1/social/dispatch';
const NOT_CONFIGURED_CODE = 'freshmints_webhook_not_configured';
const SENT_FALLBACK_MESSAGE = 'Pitch dispatched to connected funnel webhook (Slack/Discord/Zapier).';

export type DispatchRelayOutcome =
  | { status: 'sent'; message: string }
  | { status: 'not_configured' }
  | { status: 'failed'; reason: string };

interface WpApiSettings {
  root?: string;
  nonce?: string;
}

const resolveRestConfig = (): { endpoint: string; nonce: string } => {
  const settings: WpApiSettings | undefined =
    typeof window === 'undefined' ? undefined : (window as any).wpApiSettings;
  const restRoot = settings?.root || '/wp-json/';
  const nonce = settings?.nonce || '';
  return { endpoint: `${restRoot.replace(/\/$/, '')}${SOCIAL_DISPATCH_PATH}`, nonce };
};

const readJsonObject = async (response: Response): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await response.json();
    const isObject = typeof body === 'object' && body !== null;
    return isObject ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const stringField = (body: Record<string, unknown>, name: string): string => {
  const value = body[name];
  return typeof value === 'string' ? value : '';
};

export const relayDispatchToServer = async (
  lead: SocialLead,
  replyBody: string,
): Promise<DispatchRelayOutcome> => {
  const { endpoint, nonce } = resolveRestConfig();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      },
      body: JSON.stringify({
        platform: lead.rawPost.platform,
        leadId: lead.id,
        threadUrl: lead.rawPost.url,
        prospect: lead.rawPost.author,
        intentScore: lead.intentScore,
        matchedKeyword: lead.matchedKeyword,
        replyBody,
      }),
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Unknown network failure';
    return { status: 'failed', reason: detail };
  }

  const body = await readJsonObject(response);

  const isAccepted = response.ok;
  if (isAccepted) {
    return { status: 'sent', message: stringField(body, 'message') || SENT_FALLBACK_MESSAGE };
  }

  const isNotConfigured = stringField(body, 'code') === NOT_CONFIGURED_CODE;
  if (isNotConfigured) {
    return { status: 'not_configured' };
  }

  const serverMessage = stringField(body, 'message');
  return { status: 'failed', reason: serverMessage || `The server answered HTTP ${response.status}.` };
};
