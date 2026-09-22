<script lang="ts">
  import { socialTokensStore } from '../../stores/social-tokens-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Key, Lock, CheckCircle2, ShieldCheck, Zap, Globe, Share2, Link } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  let ayrshareKey = $state('');
  let webhookUrl = $state('');
  let redditClientId = $state('');
  let redditClientSecret = $state('');
  let twitterToken = $state('');
  let autoPostEnabled = $state(false);
  let includeFunnelLink = $state(true);

  $effect(() => {
    if (open) {
      const current = socialTokensStore.tokens;
      ayrshareKey = current.ayrshareApiKey;
      webhookUrl = current.webhookUrl;
      redditClientId = current.redditClientId;
      redditClientSecret = current.redditClientSecret;
      twitterToken = current.twitterBearerToken;
      autoPostEnabled = current.autoPostEnabled;
      includeFunnelLink = current.includeFunnelPreviewLink;
    }
  });

  function handleSave(e: SubmitEvent) {
    e.preventDefault();
    socialTokensStore.saveTokens({
      ayrshareApiKey: ayrshareKey.trim(),
      webhookUrl: webhookUrl.trim(),
      redditClientId: redditClientId.trim(),
      redditClientSecret: redditClientSecret.trim(),
      twitterBearerToken: twitterToken.trim(),
      autoPostEnabled,
      includeFunnelPreviewLink: includeFunnelLink,
    });

    toast.success(
      'API Credentials Saved',
      'Automated social posting keys and webhook endpoints have been updated.'
    );
    open = false;
    onclose?.();
  }
</script>

<Dialog
  bind:open
  title="API Keys & Social Auto-Post Vault"
  maxWidth="max-w-3xl"
  {onclose}
>
  <form onsubmit={handleSave} class="space-y-5 select-none">
    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
      <ShieldCheck class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      <span class="leading-relaxed">
        Credentials are encrypted and saved locally in your browser session. Never shared with unapproved third parties.
      </span>
    </div>

    <div class="space-y-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="ayrshare-key" class="text-xs font-bold text-[var(--fm-text)] flex items-center gap-1.5">
            <Share2 class="w-3.5 h-3.5 text-emerald-500" />
            <span>Ayrshare Multi-Network API Key</span>
          </label>
          <Badge variant="info" class="text-[9px]">Recommended</Badge>
        </div>
        <input
          id="ayrshare-key"
          type="password"
          bind:value={ayrshareKey}
          placeholder="e.g. AYR-XXXX-XXXX-XXXX"
          class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
        />
        <p class="text-[10px] text-[var(--fm-text-muted)]">
          Unified API key enabling automated replies across Reddit, X, and LinkedIn with zero manual OAuth setups.
        </p>
      </div>

      <div class="space-y-1.5">
        <label for="webhook-url" class="text-xs font-bold text-[var(--fm-text)] flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 text-amber-500" />
          <span>Inbound Webhook Endpoint (Slack / Discord / Zapier)</span>
        </label>
        <input
          id="webhook-url"
          type="url"
          bind:value={webhookUrl}
          placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
          class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
        />
        <p class="text-[10px] text-[var(--fm-text-muted)]">
          Fires real-time lead payloads with tailored pitches to your team channel when high-intent posts are detected.
        </p>
      </div>

      <div class="pt-2 border-t border-[var(--fm-border)] space-y-3">
        <div class="text-xs font-bold text-[var(--fm-text)] flex items-center gap-1.5">
          <Key class="w-3.5 h-3.5 text-cyan-500" />
          <span>Direct Reddit Developer App Credentials (Optional)</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="reddit-client-id" class="text-[11px] font-semibold text-[var(--fm-text-muted)]">
              Reddit Client ID
            </label>
            <input
              id="reddit-client-id"
              type="text"
              bind:value={redditClientId}
              placeholder="e.g. 14-character script ID"
              class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
            />
          </div>
          <div class="space-y-1">
            <label for="reddit-secret" class="text-[11px] font-semibold text-[var(--fm-text-muted)]">
              Reddit Client Secret
            </label>
            <input
              id="reddit-secret"
              type="password"
              bind:value={redditClientSecret}
              placeholder="e.g. 27-character secret"
              class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
            />
          </div>
        </div>
      </div>

      <div class="pt-2 border-t border-[var(--fm-border)] space-y-2.5">
        <label class="flex items-center gap-2 text-xs text-[var(--fm-text)] cursor-pointer">
          <input
            type="checkbox"
            bind:checked={includeFunnelLink}
            class="w-4 h-4 rounded bg-[var(--fm-surface-sunken)] border-[var(--fm-border)] text-emerald-600 accent-emerald-600"
          />
          <span class="font-semibold">
            Automatically inject personalized Turnkey Website Demo link into all drafted pitches
          </span>
        </label>

        <label class="flex items-center gap-2 text-xs text-[var(--fm-text)] cursor-pointer">
          <input
            type="checkbox"
            bind:checked={autoPostEnabled}
            class="w-4 h-4 rounded bg-[var(--fm-surface-sunken)] border-[var(--fm-border)] text-emerald-600 accent-emerald-600"
          />
          <span class="font-semibold">
            Autonomous Funnel Trigger: Auto-dispatch reply when buyer intent score is ≥ 85%
          </span>
        </label>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 pt-3 border-t border-[var(--fm-border)]">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onclick={() => { open = false; onclose?.(); }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        class="gap-1.5 font-bold"
      >
        <Lock class="w-3 h-3" />
        <span>Save Credentials</span>
      </Button>
    </div>
  </form>
</Dialog>
