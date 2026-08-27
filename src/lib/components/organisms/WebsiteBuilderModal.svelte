<script lang="ts">
  import {
    type Lead,
    type WebsitePreviewConfig,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { getDefaultWebsiteConfig, getPreviewLink } from '../../services/website-templates';
  import { copyTextToClipboard } from '../../services/clipboard';
  import PracticeWebsiteTemplate from './PracticeWebsiteTemplate.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import {
    X,
    Globe,
    Smartphone,
    Monitor,
    Copy,
    ExternalLink,
    Send,
    Edit3,
    Flame,
    Check,
    Lock,
    Sparkles,
    Sun,
    Moon,
  } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
    onopenoutreach?: (lead: Lead) => void;
    onopenfullpreview?: (lead: Lead) => void;
  }

  let { open = $bindable(false), lead = null, onclose, onopenoutreach, onopenfullpreview }: Props = $props();

  let deviceMode = $state<'desktop' | 'mobile'>('desktop');
  let isEditing = $state(false);
  let copied = $state(false);

  function close() {
    open = false;
    onclose?.();
  }

  const siteConfig = $derived.by<WebsitePreviewConfig>(() => {
    if (lead?.websiteConfig) return lead.websiteConfig;
    if (lead) {
      return getDefaultWebsiteConfig(
        lead.fullName,
        lead.profession,
        lead.city,
        lead.state,
        lead.collegeOrSchool
      );
    }
    return getDefaultWebsiteConfig(
      'Dr. David Sinclair',
      'dental',
      'Phoenix',
      'AZ',
      'College for Financial Planning'
    );
  });

  const previewUrl = $derived.by(() => {
    if (!lead) return '';
    return getPreviewLink(lead);
  });

  const profMeta = $derived(
    lead ? PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate : null
  );

  const hostingPlan = $derived(
    profMeta ? W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze : null
  );

  const paletteColors = [
    { label: 'Teal', hex: '#0f766e' },
    { label: 'Rose', hex: '#e11d48' },
    { label: 'Blue', hex: '#2563eb' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Slate', hex: '#1e293b' },
    { label: 'Pink', hex: '#db2777' },
    { label: 'Orange', hex: '#ea580c' },
  ];

  function handleColorChange(color: string) {
    if (!lead) return;
    const updated = { ...siteConfig, primaryColor: color };
    leadStore.updateLead(lead.id, { websiteConfig: updated });
  }

  function handleThemeChange(theme: 'executive_dark' | 'clinical_light') {
    if (!lead) return;
    const updated = { ...siteConfig, templateTheme: theme };
    leadStore.updateLead(lead.id, { websiteConfig: updated });
    toast.success('Template Theme Updated', `Switched to ${theme === 'executive_dark' ? 'Executive Dark (Full Suite)' : 'Clinical Light (Clean)'}`);
  }

  function handleHeadlineChange(val: string) {
    if (!lead) return;
    const updated = { ...siteConfig, heroHeadline: val };
    leadStore.updateLead(lead.id, { websiteConfig: updated });
  }

  function handlePriceChange(val: number) {
    if (!lead) return;
    const updated = { ...siteConfig, offerPrice: val };
    leadStore.updateLead(lead.id, {
      websiteConfig: updated,
      estimatedDealValue: val,
    });
  }

  async function handleCopyLink() {
    if (!lead) return;
    const link = getPreviewLink(lead);
    const success = await copyTextToClipboard(link);
    if (success) {
      copied = true;
      toast.success('Live preview link copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2500);
    } else {
      toast.error('Copy failed', 'Please select and copy the link manually.');
    }
  }

  const copyShareLink = handleCopyLink;

  function handleLaunchOutreach() {
    if (!lead) return;
    close();
    if (onopenoutreach) {
      onopenoutreach(lead);
    }
  }

  function handleOpenStandalone() {
    if (!lead) return;
    const link = getPreviewLink(lead);
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && lead}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    onclick={close}
  >
    <div
      class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header Bar -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/90">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold flex-shrink-0">
            <Globe class="w-5 h-5" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Turnkey Practice Website: {lead.fullName}
              </h2>
              <Badge variant="success" class="text-xs font-mono">
                ${siteConfig.offerPrice.toLocaleString()} (2-Yr w4 Cloud Package)
              </Badge>
              {#if hostingPlan}
                <span class="text-[11px] bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-mono">
                  {hostingPlan.name} (${hostingPlan.monthlyBaseRate}/mo post-2yr)
                </span>
                <span class="text-[11px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                  <Flame class="w-3 h-3 text-amber-400" />
                  Rep Bounty: $300
                </span>
              {/if}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compass Launch Studio &bull; <strong>{lead.professionTitle}</strong> ({lead.city}, {lead.state}) &bull; $999 Domain Buyout Rights
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Mode Switcher -->
          <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onclick={() => (deviceMode = 'desktop')}
              class="p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {deviceMode === 'desktop' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
            >
              <Monitor class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onclick={() => (deviceMode = 'mobile')}
              class="p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {deviceMode === 'mobile' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
            >
              <Smartphone class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onclick={() => (isEditing = !isEditing)}
            class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isEditing ? 'Done Customizing' : 'Customize Site'}</span>
          </button>

          <button
            type="button"
            onclick={close}
            class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Editing & Template Controls Bar (Collapsible) -->
      {#if isEditing}
        <div class="bg-slate-50 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 p-4 px-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <!-- Template Version Switcher -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">
              Template Design Layout
            </span>
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onclick={() => handleThemeChange('executive_dark')}
                class="flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 {(siteConfig.templateTheme || 'executive_dark') === 'executive_dark' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
              >
                <Moon class="w-3 h-3" />
                <span>Executive Dark</span>
              </button>
              <button
                type="button"
                onclick={() => handleThemeChange('clinical_light')}
                class="flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 {siteConfig.templateTheme === 'clinical_light' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
              >
                <Sun class="w-3 h-3" />
                <span>Clinical Light</span>
              </button>
            </div>
          </div>

          <!-- Hero Headline -->
          <div>
            <label for="edit-headline" class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">
              Hero Headline
            </label>
            <input
              id="edit-headline"
              type="text"
              value={siteConfig.heroHeadline}
              oninput={(e) => handleHeadlineChange((e.target as HTMLInputElement).value)}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <!-- Brand Color Palette -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">
              Brand Accent Color
            </span>
            <div class="flex items-center gap-2 pt-0.5">
              {#each paletteColors as col}
                <button
                  type="button"
                  title={col.label}
                  onclick={() => handleColorChange(col.hex)}
                  class="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform {siteConfig.primaryColor === col.hex ? 'border-white scale-115 ring-2 ring-emerald-500/50' : 'border-transparent hover:scale-105'}"
                  style="background-color: {col.hex};"
                ></button>
              {/each}
            </div>
          </div>

          <!-- Offer Price -->
          <div>
            <label for="edit-offer-price" class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">
              2-Year Package Price ($)
            </label>
            <input
              id="edit-offer-price"
              type="number"
              value={siteConfig.offerPrice}
              oninput={(e) => handlePriceChange(Number((e.target as HTMLInputElement).value))}
              class="w-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      {/if}

      <!-- Live Interactive Website Frame Canvas (Using Shared PracticeWebsiteTemplate) -->
      <div class="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex-1 overflow-y-auto flex justify-center custom-scrollbar">
        <div class="{deviceMode === 'mobile' ? 'w-[385px]' : 'w-full max-w-5xl'}">
          <PracticeWebsiteTemplate
            {lead}
            {siteConfig}
            {deviceMode}
            {previewUrl}
          />
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={handleCopyLink}
            class="border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 gap-1.5 text-xs cursor-pointer"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Link Copied!</span>
            {:else}
              <Copy class="w-3.5 h-3.5" />
              <span>Copy Pitch Link</span>
            {/if}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onclick={handleOpenStandalone}
            class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white gap-1 cursor-pointer"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            <span>Open Standalone Preview</span>
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onclick={handleLaunchOutreach}
            class="gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <Send class="w-4 h-4" />
            <span>Offer Website to {lead.fullName.split(' ')[0]}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
