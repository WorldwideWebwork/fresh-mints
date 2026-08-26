import { useSyncExternalStore } from 'react';
import { LeadStore } from '../lib/store';

export function useLeadStore() {
  const store = LeadStore.getInstance();
  
  useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => store.getVersion(),
    () => store.getVersion()
  );

  return {
    leads: store.getLeads(),
    filteredLeads: store.getFilteredLeads(),
    selectedLead: store.getSelectedLead(),
    selectedLeadId: store.getSelectedLeadId(),
    activeTab: store.getActiveTab(),
    customTabs: store.getCustomTabs(),
    filters: store.getFilters(),
    analytics: store.getAnalytics(),
    isInitialized: store.getIsInitialized(),
    fetchQuantity: store.getFetchQuantity(),

    // Actions
    setFetchQuantity: (quantity: number) => store.setFetchQuantity(quantity),
    setSelectedLeadId: (id: string | null) => store.setSelectedLeadId(id),
    setActiveTab: (tab: string) => store.setActiveTab(tab),
    addCustomTab: (tab: Parameters<typeof store.addCustomTab>[0]) => store.addCustomTab(tab),
    removeCustomTab: (id: string) => store.removeCustomTab(id),
    setFilters: (filters: Parameters<typeof store.setFilters>[0]) => store.setFilters(filters),
    addLead: (lead: Parameters<typeof store.addLead>[0]) => store.addLead(lead),
    fetchLiveOpenRegistryData: (
      profession?: Parameters<typeof store.fetchLiveOpenRegistryData>[0],
      state?: Parameters<typeof store.fetchLiveOpenRegistryData>[1],
      quantity?: number
    ) => store.fetchLiveOpenRegistryData(profession, state, quantity),
    updateLead: (id: string, updates: Parameters<typeof store.updateLead>[1]) => store.updateLead(id, updates),
    deleteLead: (id: string) => store.deleteLead(id),
    clearAllLeads: () => store.clearAllLeads(),
    exportFilteredToCSV: () => store.exportFilteredToCSV(),
    importFromCSV: (csvText: string) => store.importFromCSV(csvText),
    getWebhookUrl: () => store.getWebhookUrl(),
    setWebhookUrl: (url: string) => store.setWebhookUrl(url),
    syncLeadToCRM: (id: string) => store.syncLeadToCRM(id),
    syncAllFilteredToCRM: () => store.syncAllFilteredToCRM(),
    skipTraceLead: (id: string) => store.performSkipTrace(id),
    batchSkipTraceAllUntraced: () => store.batchSkipTraceAllUntraced(),
    checkLeadWebsite: (id: string) => store.checkLeadWebsiteLive(id),
    ensureWebsiteConfig: (id: string) => store.ensureWebsiteConfig(id),
    logOutreach: (id: string, log: Parameters<typeof store.recordOutreachLog>[1]) => store.recordOutreachLog(id, log),
  };
}
