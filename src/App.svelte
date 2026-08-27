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

  function checkPreviewRoute() {
    if (typeof window === 'undefined') return;

    // Check hash (e.g. #/preview/david-sinclair-official or #preview-david-sinclair)
    const hash = window.location.hash || '';
    if (hash.startsWith('#/preview/')) {
      standalonePreviewSlug = hash.replace('#/preview/', '');
      return;
    }
    if (hash.startsWith('#preview-')) {
      standalonePreviewSlug = hash.replace('#preview-', '');
      return;
    }

    // Check query params (e.g. ?preview=david-sinclair-official)
    const params = new URLSearchParams(window.location.search);
    const queryPreview = params.get('preview');
    if (queryPreview) {
      standalonePreviewSlug = queryPreview;
      return;
    }

    // Check path (e.g. /preview/david-sinclair-official)
    const path = window.location.pathname || '';
    if (path.includes('/preview/')) {
      const match = path.match(/\/preview\/([^/?#]+)/);
      if (match && match[1]) {
        standalonePreviewSlug = match[1];
        return;
      }
    }

    standalonePreviewSlug = null;
  }

  onMount(() => {
    checkPreviewRoute();
    window.addEventListener('popstate', checkPreviewRoute);
    window.addEventListener('hashchange', checkPreviewRoute);

    return () => {
      window.removeEventListener('popstate', checkPreviewRoute);
      window.removeEventListener('hashchange', checkPreviewRoute);
    };
  });

  function openModal(name: string, lead?: Lead) {
    if (name === 'confirm_clear') {
      isClearConfirmOpen = true;
      return;
    }
    modalState = {
      name,
      lead: lead || leadStore.selectedLead,
    };
  }

  function closeModal() {
    modalState = {
      name: null,
      lead: null,
    };
  }

  function handleOpenFullPreview(lead: Lead) {
    standalonePreviewLead = lead;
    standalonePreviewSlug = lead.websiteConfig?.previewSlug || lead.id;
    window.location.hash = `#/preview/${standalonePreviewSlug}`;
  }

  function handleCloseFullPreview() {
    standalonePreviewSlug = null;
    standalonePreviewLead = null;
    window.location.hash = '';
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

<!-- Modals -->
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
/>

<OutreachGeneratorModal
  open={modalState.name === 'outreach_generator'}
  lead={modalState.lead}
  onclose={closeModal}
/>

<LeadDetailModal
  open={modalState.name === 'lead_detail'}
  lead={modalState.lead}
  onclose={closeModal}
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
