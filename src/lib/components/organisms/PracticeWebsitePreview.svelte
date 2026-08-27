<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { getDefaultWebsiteConfig, getPreviewLink } from '../../services/website-templates';
  import { copyTextToClipboard } from '../../services/clipboard';
  import PracticeWebsiteTemplate from './PracticeWebsiteTemplate.svelte';
  import {
    type Lead,
    type WebsitePreviewConfig,
    type ProfessionCategory,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import {
    Check,
    ArrowLeft,
    ExternalLink,
    Monitor,
    Smartphone,
    Copy,
    Moon,
    Sun,
  } from 'lucide-svelte';

  interface Props {
    slug?: string;
    lead?: Lead | null;
    onback?: () => void;
  }

  let { slug = '', lead = null, onback }: Props = $props();

  let copied = $state(false);
  let viewMode = $state<'desktop' | 'mobile'>('desktop');
  let selectedTheme = $state<'executive_dark' | 'clinical_light'>('executive_dark');

  // Resolve matching lead from store or browser storage if not provided directly
  const activeLead = $derived.by<Lead | null>(() => {
    if (lead) return lead;
    if (!slug) return leadStore.leads[0] || null;

    const cleanSlug = slug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '');

    // 1. Check in-memory / IndexedDB leadStore
    const foundInStore = leadStore.leads.find(
      (l) =>
        l.id === cleanSlug ||
        l.websiteConfig?.previewSlug === cleanSlug ||
        l.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug
    );
    if (foundInStore) return foundInStore;

    // 2. Check cached lead from browser session/localStorage (saved when preview link was generated)
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`fm_preview_${cleanSlug}`) || localStorage.getItem(`fm_preview_${cleanSlug}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') return parsed as Lead;
        }
      } catch (e) {
        // Ignore storage read errors
      }
    }

    // 3. Fallback to first lead in store if available
    if (leadStore.leads.length > 0) {
      return leadStore.leads[0];
    }

    return null;
  });

  // Resolve website configuration
  const siteConfig = $derived.by<WebsitePreviewConfig>(() => {
    let baseConfig: WebsitePreviewConfig;

    if (activeLead?.websiteConfig) {
      baseConfig = activeLead.websiteConfig;
    } else if (activeLead) {
      baseConfig = getDefaultWebsiteConfig(
        activeLead.fullName,
        activeLead.profession,
        activeLead.city,
        activeLead.state,
        activeLead.collegeOrSchool
      );
    } else {
      const cleanSlug = slug.replace(/-official$/i, '').replace(/[-_]+/g, ' ').trim();
      const formattedName = cleanSlug
        ? cleanSlug.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Professional Practice Specialist';

      baseConfig = getDefaultWebsiteConfig(
        formattedName,
        'dental',
        'Phoenix',
        'AZ',
        'Accredited Graduate Academy'
      );
    }

    return {
      ...baseConfig,
      templateTheme: selectedTheme || baseConfig.templateTheme || 'executive_dark',
    };
  });

  // Sync initial theme
  $effect(() => {
    if (activeLead?.websiteConfig?.templateTheme) {
      selectedTheme = activeLead.websiteConfig.templateTheme;
    }
  });

  const practitionerName = $derived(
    activeLead?.fullName ||
      siteConfig.heroHeadline.split(' - ')[0] ||
      siteConfig.heroHeadline.split(' | ')[0] ||
      'Professional Practice Specialist'
  );

  const professionCategory: ProfessionCategory = $derived(activeLead?.profession || 'dental');
  const profMeta = $derived(PROFESSION_CONFIGS[professionCategory] || PROFESSION_CONFIGS.real_estate);

  const previewUrl = $derived.by(() => {
    return getPreviewLink(activeLead || siteConfig.previewSlug);
  });

  async function handleCopyShare() {
    const success = await copyTextToClipboard(previewUrl);
    if (success) {
      copied = true;
      toast.success('Live preview link copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2500);
    } else {
      toast.error('Copy failed', 'Please copy link manually.');
    }
  }

  function handleOpenNewTab() {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }

  function handleToggleTheme(theme: 'executive_dark' | 'clinical_light') {
    selectedTheme = theme;
    if (activeLead) {
      leadStore.updateLead(activeLead.id, {
        websiteConfig: { ...siteConfig, templateTheme: theme },
      });
    }
  }

  function handleBackToPortal() {
    if (onback) {
      onback();
    } else {
      window.location.hash = '';
      if (window.history?.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      }
      window.dispatchEvent(new Event('popstate'));
    }
  }
</script>

<div class="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-stone-900 selection:bg-teal-600 selection:text-white">
  <!-- Rep Command & Preview Toolbar (Sticky Top Bar) -->
  <aside aria-label="Rep Preview Bar" class="bg-slate-950 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-200 sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <!-- Left: Practitioner Summary & Launch Badge -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={handleBackToPortal}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Exit to Command Deck</span>
        </button>

        <div class="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-slate-300">
          <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-bold text-white">{practitionerName}</span>
          <span class="text-slate-400">&bull;</span>
          <span class="text-slate-400">{profMeta.defaultTitle}</span>
          <span class="text-[11px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/80 font-mono">
            ${siteConfig.offerPrice.toLocaleString()} (2-Yr w4 Cloud Package)
          </span>
        </div>
      </div>

      <!-- Center: Template Theme & Device Switcher -->
      <div class="flex items-center gap-2">
        <!-- Template Style Selector -->
        <div class="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onclick={() => handleToggleTheme('executive_dark')}
            class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {selectedTheme === 'executive_dark' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
          >
            <Moon class="w-3.5 h-3.5" />
            <span>Executive Dark</span>
          </button>
          <button
            type="button"
            onclick={() => handleToggleTheme('clinical_light')}
            class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {selectedTheme === 'clinical_light' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
          >
            <Sun class="w-3.5 h-3.5" />
            <span>Clinical Light</span>
          </button>
        </div>

        <!-- Viewport Mode -->
        <div class="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onclick={() => (viewMode = 'desktop')}
            class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {viewMode === 'desktop' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
          >
            <Monitor class="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onclick={() => (viewMode = 'mobile')}
            class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {viewMode === 'mobile' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={handleCopyShare}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          {#if copied}
            <Check class="w-3.5 h-3.5 text-emerald-400" />
            <span class="text-emerald-400 font-semibold">Link Copied!</span>
          {:else}
            <Copy class="w-3.5 h-3.5" />
            <span>Copy Pitch Link</span>
          {/if}
        </button>

        <button
          type="button"
          onclick={handleOpenNewTab}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>Open Direct Link</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Website Preview Container Area (Using Shared PracticeWebsiteTemplate) -->
  <main class="flex-1 bg-slate-900 p-2 sm:p-6 flex justify-center items-start overflow-y-auto">
    <div class="{viewMode === 'mobile' ? 'w-[385px] my-4' : 'w-full max-w-6xl my-2'}">
      <PracticeWebsiteTemplate
        lead={activeLead}
        {siteConfig}
        deviceMode={viewMode}
        {previewUrl}
      />
    </div>
  </main>
</div>
