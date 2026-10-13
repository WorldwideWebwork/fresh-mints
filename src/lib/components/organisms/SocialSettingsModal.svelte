<script lang="ts">
  import { socialPreferencesStore } from '../../stores/social-preferences-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import FormField from '../atoms/FormField.svelte';
  import Input from '../atoms/Input.svelte';
  import { normalizeGuidePageUrl } from '../../services/social-feed/funnel-link';
  import { ShieldCheck, ExternalLink } from 'lucide-svelte';

  const CONNECTORS_URL = '/wp-admin/options-connectors.php';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  let includeFunnelLink = $state(true);
  let guidePageUrl = $state('');

  const guidePageUrlError = $derived(
    guidePageUrl.trim() !== '' && normalizeGuidePageUrl(guidePageUrl) === ''
      ? 'Use the full address, starting with https:// or http://.'
      : ''
  );

  $effect(() => {
    if (open) {
      includeFunnelLink = socialPreferencesStore.preferences.includeFunnelPreviewLink;
      guidePageUrl = socialPreferencesStore.preferences.guidePageUrl ?? '';
    }
  });

  function handleSave(e: SubmitEvent) {
    e.preventDefault();
    if (guidePageUrlError) {
      toast.error('Guide page URL not saved', guidePageUrlError);
      return;
    }
    socialPreferencesStore.save({ includeFunnelPreviewLink: includeFunnelLink, guidePageUrl });

    toast.success('Social Settings Saved', 'Your Social Radar preferences have been updated.');
    open = false;
    onclose?.();
  }
</script>

<Dialog
  bind:open
  title="Social Radar Settings"
  maxWidth="max-w-xl"
  {onclose}
>
  <form onsubmit={handleSave} class="space-y-5 select-none">
    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
      <ShieldCheck class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      <span class="leading-relaxed">
        API keys, tokens and webhook URLs are never kept in this browser. They live on the server in
        WordPress Connectors, and only the server uses them.
      </span>
    </div>

    <div class="space-y-1.5">
      <a
        href={CONNECTORS_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <span>Manage credentials in Settings &rsaquo; Connectors</span>
        <ExternalLink class="w-3 h-3" />
      </a>
      <p class="text-[10px] text-[var(--fm-text-muted)]">
        Add the YouTube and Stack Exchange keys there, and the Social Dispatch Webhook URL to also send each
        dispatched reply to a Slack, Discord or Zapier channel.
      </p>
    </div>

    <div class="pt-2 border-t border-[var(--fm-border)]">
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
    </div>

    <div class="space-y-1.5">
      <FormField label="Guide page URL" error={guidePageUrlError}>
        <Input
          bind:value={guidePageUrl}
          type="url"
          placeholder="https://your-site.example/annuity-guide/"
          autocomplete="off"
        />
      </FormField>
      <p class="text-[10px] text-[var(--fm-text-muted)]">
        The capture page that annuity replies link to. Each link carries the platform, rule, thread and reply
        it came from, so an opt-in can be traced to the post that earned it. Leave blank to send annuity
        replies without a link.
      </p>
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
        class="font-bold"
      >
        Save Settings
      </Button>
    </div>
  </form>
</Dialog>
