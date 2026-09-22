<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore } from './lib/stores/theme.svelte';
  import { leadStore } from './lib/stores/lead-store.svelte';
  import { authStore } from './lib/stores/auth-store.svelte';
  import type { Lead } from './lib/types/lead';
  import { generateLeadPreviewSlug } from './lib/services/website-templates';
  import DashboardLayout from './lib/components/templates/DashboardLayout.svelte';
  import FilterBar from './lib/components/molecules/FilterBar.svelte';
  import Toast from './lib/components/molecules/Toast.svelte';
  import ConfirmDialog from './lib/components/molecules/ConfirmDialog.svelte';
  import LoadingScreen from './lib/components/organisms/LoadingScreen.svelte';

  // Authentication View
  import AuthLoginView from './lib/components/organisms/AuthLoginView.svelte';

  // Standalone Website Preview
  import PracticeWebsitePreview from './lib/components/organisms/PracticeWebsitePreview.svelte';

  // Organisms / Views
  import RegistrySearchView from './lib/components/organisms/RegistrySearchView.svelte';
  import PlacesSearchView from './lib/components/organisms/PlacesSearchView.svelte';
  import SocialRadarView from './lib/components/organisms/SocialRadarView.svelte';
  import LeadTable from './lib/components/organisms/LeadTable.svelte';
  import KanbanBoard from './lib/components/organisms/KanbanBoard.svelte';
  import RepHubView from './lib/components/organisms/RepHubView.svelte';
  import W4EconomicsView from './lib/components/organisms/W4EconomicsView.svelte';
  import AnalyticsView from './lib/components/organisms/AnalyticsView.svelte';

  // Modals
  import WebsiteBuilderModal from './lib/components/organisms/WebsiteBuilderModal.svelte';
  import ColdCallScriptModal from './lib/components/organisms/ColdCallScriptModal.svelte';
  import OutreachGeneratorModal from './lib/components/organisms/OutreachGeneratorModal.svelte';
  import LeadDetailModal from './lib/components/organisms/LeadDetailModal.svelte';
  import WebsiteAuditModal from './lib/components/organisms/WebsiteAuditModal.svelte';
  import ImportCSVModal from './lib/components/organisms/ImportCSVModal.svelte';
  import CustomTabModal from './lib/components/organisms/CustomTabModal.svelte';
  import SettingsModal from './lib/components/organisms/SettingsModal.svelte';
  import UpgradePlanModal from './lib/components/organisms/UpgradePlanModal.svelte';
  import SocialTokensModal from './lib/components/organisms/SocialTokensModal.svelte';

  // Standalone preview slug state
  let standalonePreviewSlug = $state<string | null>(null);
  let standalonePreviewLead = $state<Lead | null>(null);

  // Modal State
  let modalState = $state<{
    name: string | null;
    lead: Lead | null;
  }>({
    name: null,
    lead: null,
  });

  const activeModalLead = $derived(
    modalState.lead
      ? leadStore.leads.find((l) => l.id === modalState.lead?.id) || modalState.lead
      : null
  );

  let isClearConfirmOpen = $state(false);
  let isAppLoading = $state(true);
  let isNavigating = false;
  let hasMounted = false;

  // Browser History, Subdomain & Route Parser (executed on popstate/hashchange, initial mount, and subdomain triggers)
  function parseUrlRoute() {
    if (typeof window === 'undefined') return;
    isNavigating = true;

    try {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';
      const hostname = window.location.hostname || '';
      const wpPreviewSlug = (window as any).wpApiSettings?.previewSlug || '';

      // 0. Detect Subdomain or WordPress-injected Preview Slug (e.g. sarah-jenkins.mycompass or /preview/sarah-jenkins)
      let detectedSlug: string | null = null;

      if (wpPreviewSlug && wpPreviewSlug !== 'fresh-mints') {
        detectedSlug = wpPreviewSlug;
      } else if (pathname.startsWith('/preview/')) {
        detectedSlug = pathname.replace('/preview/', '').split('/')[0].split('?')[0];
      } else {
        const hostParts = hostname.replace(/:\d+$/, '').split('.');
        if (hostParts.length >= 2) {
          const sub = hostParts[0].toLowerCase();
          const reserved = ['www', 'localhost', 'mycompass', 'app', 'mail', 'preview', 'freshmints', 'compass', 'api', 'admin'];
          if (!reserved.includes(sub) && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            detectedSlug = sub;
          }
        }
      }

      // 1. Standalone Practice Website Preview Route: #/preview/slug, #preview-slug, or detected subdomain
      if (hash.startsWith('#/preview/')) {
        detectedSlug = hash.replace('#/preview/', '').split('?')[0];
      } else if (hash.startsWith('#preview-')) {
        detectedSlug = hash.replace('#preview-', '').split('?')[0];
      }

      if (detectedSlug) {
        const cleanSlug = detectedSlug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '');
        standalonePreviewSlug = cleanSlug;

        // Search store for matching preview slug, full name kebab-case, or ID
        const found = leadStore.leads.find((l) => {
          const configSlug = l.websiteConfig?.previewSlug?.toLowerCase();
          const nameSlug = l.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          return configSlug === cleanSlug || l.id === cleanSlug || nameSlug === cleanSlug;
        });

        if (found) {
          standalonePreviewLead = found;
        } else {
          // Check browser storage cache
          try {
            const cached = sessionStorage.getItem(`fm_preview_${cleanSlug}`) || localStorage.getItem(`fm_preview_${cleanSlug}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && typeof parsed === 'object') {
                standalonePreviewLead = parsed as Lead;
              }
            }
          } catch (e) {
            // Ignore cache error
          }
        }
        return;
      }

      standalonePreviewSlug = null;
      standalonePreviewLead = null;

      // 2. Main Deck Hash (e.g. #/kanban?lead=123&modal=lead_detail)
      const cleanHash = hash.replace(/^#\/?/, '');
      if (!cleanHash || cleanHash === 'fresh-mints') {
        return;
      }

      const [pathSegment, querySegment] = cleanHash.split('?');
      const params = new URLSearchParams(querySegment || '');

      const validTabs = ['search', 'places', 'social_radar', 'leads', 'kanban', 'rephub', 'economics', 'analytics'];
      let targetTab = pathSegment;
      if (targetTab.startsWith('view/')) {
        targetTab = targetTab.replace('view/', '');
      }

      const isCustomTab = leadStore.customTabs.some((t) => t.id === targetTab);
      if (validTabs.includes(targetTab) || isCustomTab) {
        leadStore.setActiveTab(targetTab);
      }

      const leadId = params.get('lead');
      if (leadId) {
        leadStore.setSelectedLeadId(leadId);
      }

      const modalName = params.get('modal');
      if (modalName) {
        const activeTargetLead =
          leadStore.leads.find((l) => l.id === (leadId || leadStore.selectedLeadId)) ||
          leadStore.selectedLead;
        modalState = {
          name: modalName,
          lead: activeTargetLead,
        };
      } else {
        modalState = {
          name: null,
          lead: null,
        };
      }
    } finally {
      setTimeout(() => {
        isNavigating = false;
      }, 50);
    }
  }

  // Push or Replace browser history entry
  function syncStateToUrl(push: boolean = true) {
    if (typeof window === 'undefined' || isNavigating || !hasMounted) return;

    if (standalonePreviewSlug) {
      const targetHash = `#/preview/${standalonePreviewSlug}`;
      if (window.location.hash !== targetHash) {
        if (push) history.pushState(null, '', targetHash);
        else history.replaceState(null, '', targetHash);
      }
      return;
    }

    let tabPath = leadStore.activeTab;
    if (leadStore.customTabs.some((t) => t.id === tabPath)) {
      tabPath = `view/${tabPath}`;
    }

    const params = new URLSearchParams();
    if (modalState.name) {
      params.set('modal', modalState.name);
    }

    const targetLeadId = modalState.lead?.id || leadStore.selectedLeadId;
    if (targetLeadId && (modalState.name || leadStore.activeTab === 'rephub')) {
      params.set('lead', targetLeadId);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const targetHash = `#/${tabPath}${queryString}`;

    if (window.location.hash !== targetHash) {
      if (push) {
        history.pushState(null, '', targetHash);
      } else {
        history.replaceState(null, '', targetHash);
      }
    }
  }

  onMount(() => {
    hasMounted = true;
    parseUrlRoute();

    window.addEventListener('popstate', parseUrlRoute);
    window.addEventListener('hashchange', parseUrlRoute);

    return () => {
      window.removeEventListener('popstate', parseUrlRoute);
      window.removeEventListener('hashchange', parseUrlRoute);
    };
  });

  // Track tab changes in browser history
  $effect(() => {
    const _tab = leadStore.activeTab;
    if (hasMounted && !isNavigating) {
      syncStateToUrl(true);
    }
  });

  function openModal(name: string, lead?: Lead) {
    if (name === 'confirm_clear') {
      isClearConfirmOpen = true;
      return;
    }
    const targetLead = lead || leadStore.selectedLead;
    modalState = {
      name,
      lead: targetLead,
    };
    if (targetLead) {
      leadStore.setSelectedLeadId(targetLead.id);
    }
    syncStateToUrl(true);
  }

  function closeModal() {
    modalState = {
      name: null,
      lead: null,
    };
    syncStateToUrl(true);
  }

  function handleOpenFullPreview(lead: Lead) {
    standalonePreviewLead = lead;
    standalonePreviewSlug = lead.websiteConfig?.previewSlug || generateLeadPreviewSlug(lead.fullName) || lead.id;
    syncStateToUrl(true);
  }

  function handleCloseFullPreview() {
    standalonePreviewSlug = null;
    standalonePreviewLead = null;
    syncStateToUrl(true);
  }
</script>

{#if isAppLoading && !standalonePreviewSlug}
  <LoadingScreen
    isReady={leadStore.isInitialized}
    oncomplete={() => (isAppLoading = false)}
  />
{/if}

{#if standalonePreviewSlug}
  <!-- Standalone Turnkey Practice Website View (Public Access for Prospects) -->
  <PracticeWebsitePreview
    slug={standalonePreviewSlug}
    lead={standalonePreviewLead}
    onback={handleCloseFullPreview}
  />
{:else if !authStore.isLoggedIn}
  <!-- Secure Rep & Admin In-App Authentication Gate -->
  <AuthLoginView />
{:else}
  <!-- Main Fresh Mints Command Deck Dashboard (Authenticated Session) -->
  <DashboardLayout
    onopenmodal={openModal}
    onopenconfirmclear={() => (isClearConfirmOpen = true)}
  >
    <!-- Search and Filter Bar (shown on discovery, table, kanban, and custom views) -->
    {#if ['search', 'leads', 'kanban'].includes(leadStore.activeTab) || leadStore.customTabs.some((t) => t.id === leadStore.activeTab)}
      <FilterBar />
    {/if}

    <!-- View Switcher -->
    {#if leadStore.activeTab === 'search'}
      <RegistrySearchView />
    {:else if leadStore.activeTab === 'places'}
      <PlacesSearchView onopenmodal={openModal} onopenfullpreview={handleOpenFullPreview} />
    {:else if leadStore.activeTab === 'social_radar'}
      <SocialRadarView onopenmodal={openModal} />
    {:else if leadStore.activeTab === 'leads'}
      <LeadTable onopenmodal={openModal} />
    {:else if leadStore.activeTab === 'kanban'}
      <KanbanBoard onopenmodal={openModal} />
    {:else if leadStore.activeTab === 'rephub'}
      <RepHubView onopenmodal={openModal} />
    {:else if leadStore.activeTab === 'economics'}
      <W4EconomicsView />
    {:else if leadStore.activeTab === 'analytics'}
      <AnalyticsView />
    {:else}
      <!-- Custom Saved Preset View -->
      <LeadTable onopenmodal={openModal} />
    {/if}
  </DashboardLayout>
{/if}

<!-- Modals with Fluid History Integration -->
<WebsiteBuilderModal
  open={modalState.name === 'website_builder'}
  lead={activeModalLead}
  onclose={closeModal}
  onopenoutreach={(l) => openModal('outreach_generator', l)}
  onopenfullpreview={handleOpenFullPreview}
/>

<ColdCallScriptModal
  open={modalState.name === 'call_script'}
  lead={activeModalLead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<OutreachGeneratorModal
  open={modalState.name === 'outreach_generator'}
  lead={activeModalLead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<LeadDetailModal
  open={modalState.name === 'lead_detail'}
  lead={activeModalLead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<WebsiteAuditModal
  open={modalState.name === 'website_audit'}
  lead={activeModalLead}
  onclose={closeModal}
  onopenpreview={(l) => openModal('website_builder', l)}
  onopenpitch={(l) => openModal('outreach_generator', l)}
/>

<ImportCSVModal
  open={modalState.name === 'import_csv'}
  onclose={closeModal}
/>

<CustomTabModal
  open={modalState.name === 'custom_tab'}
  onclose={closeModal}
/>

<SettingsModal
  open={modalState.name === 'settings'}
  onclose={closeModal}
  onopenconfirmclear={() => (isClearConfirmOpen = true)}
/>

<UpgradePlanModal
  open={modalState.name === 'upgrade_plan'}
  onclose={closeModal}
/>

<SocialTokensModal
  open={modalState.name === 'social_tokens'}
  onclose={closeModal}
/>

<ConfirmDialog
  bind:open={isClearConfirmOpen}
  title="Clear All Lead Records?"
  description="This will erase all cached practitioner leads from your local IndexedDB storage. This cannot be undone."
  confirmText="Clear All Data"
  variant="danger"
  onconfirm={() => leadStore.clearAllLeads()}
/>

<!-- Toast Notifications -->
<Toast />
