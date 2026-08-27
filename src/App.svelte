<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore } from './lib/stores/theme.svelte';
  import { leadStore } from './lib/stores/lead-store.svelte';
  import type { Lead } from './lib/types/lead';
  import DashboardLayout from './lib/components/templates/DashboardLayout.svelte';
  import FilterBar from './lib/components/molecules/FilterBar.svelte';
  import Toast from './lib/components/molecules/Toast.svelte';
  import ConfirmDialog from './lib/components/molecules/ConfirmDialog.svelte';
  import LoadingScreen from './lib/components/organisms/LoadingScreen.svelte';

  // Standalone Website Preview
  import PracticeWebsitePreview from './lib/components/organisms/PracticeWebsitePreview.svelte';

  // Organisms / Views
  import RegistrySearchView from './lib/components/organisms/RegistrySearchView.svelte';
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

  let isClearConfirmOpen = $state(false);
  let isAppLoading = $state(true);
  let isNavigating = false;
  let hasMounted = false;

  // Browser History & Route Parser (executed ONLY on popstate/hashchange and initial mount)
  function parseUrlRoute() {
    if (typeof window === 'undefined') return;
    isNavigating = true;

    try {
      const hash = window.location.hash || '';

      // 1. Standalone Practice Website Preview Route: #/preview/slug
      if (hash.startsWith('#/preview/')) {
        const slug = hash.replace('#/preview/', '').split('?')[0];
        standalonePreviewSlug = slug;
        const found = leadStore.leads.find(
          (l) => (l.websiteConfig?.previewSlug || l.id) === slug
        );
        if (found) standalonePreviewLead = found;
        return;
      }
      if (hash.startsWith('#preview-')) {
        const slug = hash.replace('#preview-', '').split('?')[0];
        standalonePreviewSlug = slug;
        const found = leadStore.leads.find(
          (l) => (l.websiteConfig?.previewSlug || l.id) === slug
        );
        if (found) standalonePreviewLead = found;
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

      const validTabs = ['search', 'leads', 'kanban', 'rephub', 'economics', 'analytics'];
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
    standalonePreviewSlug = lead.websiteConfig?.previewSlug || lead.id;
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
  <!-- Standalone Turnkey Practice Website View -->
  <PracticeWebsitePreview
    slug={standalonePreviewSlug}
    lead={standalonePreviewLead}
    onback={handleCloseFullPreview}
  />
{:else}
  <!-- Main Fresh Mints Command Deck Dashboard -->
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
  lead={modalState.lead}
  onclose={closeModal}
  onopenoutreach={(l) => openModal('outreach_generator', l)}
  onopenfullpreview={handleOpenFullPreview}
/>

<ColdCallScriptModal
  open={modalState.name === 'call_script'}
  lead={modalState.lead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<OutreachGeneratorModal
  open={modalState.name === 'outreach_generator'}
  lead={modalState.lead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<LeadDetailModal
  open={modalState.name === 'lead_detail'}
  lead={modalState.lead}
  onclose={closeModal}
  onopenmodal={openModal}
/>

<WebsiteAuditModal
  open={modalState.name === 'website_audit'}
  lead={modalState.lead}
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
