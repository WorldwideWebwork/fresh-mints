<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { authStore } from '../../stores/auth-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import {
    getDefaultWebsiteConfig,
    getPreviewLink,
    getPathPreviewLink,
    getSubdomainPreviewLink,
    generateLeadPreviewSlug,
  } from '../../services/website-templates';
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
    Copy,
    Moon,
    Sun,
    Globe,
  } from 'lucide-svelte';

  interface Props {
    slug?: string;
    lead?: Lead | null;
    onback?: () => void;
  }

  let { slug = '', lead = null, onback }: Props = $props();

  let copied = $state(false);
  let copyType = $state<'standard' | 'subdomain' | 'path'>('standard');
  let selectedTheme = $state<'executive_dark' | 'clinical_light'>('executive_dark');

  // Resolve matching lead from store or browser storage if not provided directly
  const activeLead = $derived.by<Lead | null>(() => {
    if (lead) return lead;
    if (!slug) return leadStore.leads[0] || null;

    const cleanSlug = slug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '');

    // 1. Check in-memory / IndexedDB leadStore
    const foundInStore = leadStore.leads.find((l) => {
      const configSlug = l.websiteConfig?.previewSlug?.toLowerCase();
      const nameSlug = generateLeadPreviewSlug(l.fullName);
      const simpleNameSlug = l.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return (
        l.id === cleanSlug ||
        configSlug === cleanSlug ||
        nameSlug === cleanSlug ||
        simpleNameSlug === cleanSlug
      );
    });
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
        'financial_advisor',
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

  const previewUrl = $derived.by(() => {
    return getPreviewLink(activeLead || siteConfig.previewSlug);
  });

  const subdomainUrl = $derived.by(() => {
    return getSubdomainPreviewLink(activeLead || siteConfig.previewSlug);
  });

  const pathUrl = $derived.by(() => {
    return getPathPreviewLink(activeLead || siteConfig.previewSlug);
  });

  async function handleCopyShare(type: 'standard' | 'subdomain' | 'path' = 'standard') {
    const targetLink = type === 'subdomain' ? subdomainUrl : (type === 'path' ? pathUrl : previewUrl);
    const label = type === 'subdomain' ? 'Subdomain URL' : (type === 'path' ? 'Clean Path URL' : 'Preview URL');

    const success = await copyTextToClipboard(targetLink);
    if (success) {
      copied = true;
      copyType = type;
      toast.success(`${label} copied to clipboard!`, targetLink);
      setTimeout(() => {
        copied = false;
      }, 2500);
    } else {
      toast.error('Copy failed', 'Please copy link manually.');
    }
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

<div class="min-h-screen w-full font-sans antialiased text-stone-900 selection:bg-teal-600 selection:text-white">
  <!-- Full True Standalone Practice Website (Full Bleed / Edge-to-Edge) -->
  <PracticeWebsiteTemplate
    lead={activeLead}
    {siteConfig}
    frameless={true}
    {previewUrl}
  />

  <!-- Discreet Floating Rep Utility Pill (Only visible when user is an authenticated sales rep/admin) -->
  {#if authStore.isLoggedIn}
    <div class="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white px-4 py-2 rounded-full shadow-2xl text-xs select-none">
      <button
        type="button"
        onclick={handleBackToPortal}
        class="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold cursor-pointer transition-colors"
        title="Return to Fresh Mints Command Deck"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Command Deck</span>
      </button>

      <span class="text-slate-600">|</span>

      <button
        type="button"
        onclick={() => handleToggleTheme(selectedTheme === 'executive_dark' ? 'clinical_light' : 'executive_dark')}
        class="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        title="Toggle Theme"
      >
        {#if selectedTheme === 'executive_dark'}
          <Sun class="w-3.5 h-3.5 text-amber-400" />
        {:else}
          <Moon class="w-3.5 h-3.5 text-cyan-400" />
        {/if}
        <span class="hidden sm:inline">{selectedTheme === 'executive_dark' ? 'Clinical Light' : 'Executive Dark'}</span>
      </button>

      <span class="text-slate-600">|</span>

      <button
        type="button"
        onclick={() => handleCopyShare('subdomain')}
        class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        title="Copy Subdomain Link"
      >
        {#if copied && copyType === 'subdomain'}
          <Check class="w-3.5 h-3.5 text-emerald-400" />
          <span class="text-emerald-400">Copied!</span>
        {:else}
          <Globe class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Share Link</span>
        {/if}
      </button>
    </div>
  {/if}
</div>
