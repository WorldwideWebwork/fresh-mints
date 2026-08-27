import {
  type Lead,
  type ProfessionCategory,
  PROFESSION_CONFIGS,
  type ExistingWebsiteAudit,
  type WebsitePreviewConfig,
  type OutreachLogItem,
  type CustomTabConfig,
  type SkipTraceResult,
} from '../types/lead';
import { CRMExportService } from '../services/crm-export-service';
import { BombBagService, type BombBagSyncResult } from '../services/bomb-bag-service';
import { IndexedDBStorage } from '../services/indexeddb-storage';
import { getDefaultWebsiteConfig, generateLeadPreviewSlug } from '../services/website-templates';
import { INITIAL_VERIFIED_LEADS } from '../services/initial-seeds';
import { toast } from './toast.svelte';

class LeadStoreState {
  leads = $state<Lead[]>([]);
  selectedLeadId = $state<string | null>(null);
  activeTab = $state<string>('leads');
  customTabs = $state<CustomTabConfig[]>([]);
  webhookUrl = $state<string>('');
  fetchQuantity = $state<number>(25);
  isInitialized = $state<boolean>(false);
  isSearchingRegistry = $state<boolean>(false);
  registryQueryStatus = $state<string>('');

  // Filters
  professionFilter = $state<ProfessionCategory | 'all'>('all');
  stateFilter = $state<string>('all');
  searchFilter = $state<string>('');
  outreachFilter = $state<string>('all');

  constructor() {
    this.initFromStorage();
  }

  async initFromStorage() {
    if (typeof window !== 'undefined') {
      this.webhookUrl = localStorage.getItem('licensify_crm_webhook') || '';
      const savedQuantity = localStorage.getItem('licensify_fetch_quantity');
      if (savedQuantity) {
        this.fetchQuantity = parseInt(savedQuantity, 10) || 25;
      }
      try {
        const savedTabs = localStorage.getItem('fresh_mints_custom_tabs');
        if (savedTabs) {
          this.customTabs = JSON.parse(savedTabs);
        }
      } catch (tabErr) {
        console.warn('Could not load custom tabs', tabErr);
      }
      try {
        const storedLeads = await IndexedDBStorage.getAllLeads();
        if (storedLeads && storedLeads.length > 0) {
          this.leads = storedLeads;
          this.selectedLeadId = storedLeads[0]?.id || null;
        } else {
          this.leads = [];
          this.selectedLeadId = null;
        }
      } catch (e) {
        console.warn('Failed to load leads from IndexedDB', e);
        this.leads = [];
        this.selectedLeadId = null;
      }
      this.isInitialized = true;
    }
  }

  // Derived filtered leads
  get filteredLeads(): Lead[] {
    return this.leads.filter((lead) => {
      // Profession match
      if (this.professionFilter !== 'all' && lead.profession !== this.professionFilter) {
        return false;
      }
      // State match
      if (this.stateFilter !== 'all' && lead.state !== this.stateFilter) {
        return false;
      }
      // Outreach match
      if (this.outreachFilter !== 'all' && lead.outreachStatus !== this.outreachFilter) {
        return false;
      }
      // Text search match
      if (this.searchFilter.trim().length > 0) {
        const q = this.searchFilter.toLowerCase();
        const matchesName = lead.fullName.toLowerCase().includes(q);
        const matchesCity = lead.city.toLowerCase().includes(q);
        const matchesSchool = lead.collegeOrSchool.toLowerCase().includes(q);
        const matchesLicense = lead.licenseNumber.toLowerCase().includes(q);
        const matchesPhone = Boolean(lead.skipTraceData?.verifiedPhone?.toLowerCase().includes(q));
        const matchesEmail = Boolean(lead.skipTraceData?.primaryEmail?.toLowerCase().includes(q));
        return matchesName || matchesCity || matchesSchool || matchesLicense || matchesPhone || matchesEmail;
      }
      return true;
    });
  }

  get selectedLead(): Lead | null {
    if (!this.selectedLeadId) return this.filteredLeads[0] || this.leads[0] || null;
    return this.leads.find((l) => l.id === this.selectedLeadId) || null;
  }

  get analytics() {
    const totalLeads = this.leads.length;
    const skipTracedCount = this.leads.filter((l) => l.skipTraceStatus === 'Traced').length;
    const sitesBuiltCount = this.leads.filter((l) => Boolean(l.websiteConfig)).length;
    const pitchesSentCount = this.leads.filter((l) => ['Outreach Sent', 'In Discussion', 'Client Won'].includes(l.outreachStatus)).length;
    const clientsWonCount = this.leads.filter((l) => l.outreachStatus === 'Client Won').length;

    const totalPipelineValue = this.leads.reduce((sum, l) => sum + (l.estimatedDealValue || 1650), 0);
    const wonRevenue = this.leads
      .filter((l) => l.outreachStatus === 'Client Won')
      .reduce((sum, l) => sum + (l.estimatedDealValue || 1650), 0);

    const conversionRate = pitchesSentCount > 0 ? Math.round((clientsWonCount / pitchesSentCount) * 100) : 0;

    return {
      totalLeads,
      skipTracedCount,
      sitesBuiltCount,
      pitchesSentCount,
      clientsWonCount,
      totalPipelineValue,
      wonRevenue,
      conversionRate,
    };
  }

  // Actions
  setFetchQuantity(quantity: number) {
    this.fetchQuantity = quantity;
    if (typeof window !== 'undefined') {
      localStorage.setItem('licensify_fetch_quantity', quantity.toString());
    }
  }

  setSelectedLeadId(id: string | null) {
    this.selectedLeadId = id;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addCustomTab(tab: CustomTabConfig) {
    this.customTabs = [...this.customTabs, tab];
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_custom_tabs', JSON.stringify(this.customTabs));
    }
  }

  removeCustomTab(id: string) {
    this.customTabs = this.customTabs.filter((t) => t.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_custom_tabs', JSON.stringify(this.customTabs));
    }
    if (this.activeTab === id) {
      this.activeTab = 'search';
    }
  }

  setFilters(filters: {
    profession?: ProfessionCategory | 'all';
    state?: string;
    search?: string;
    outreachStatus?: string;
  }) {
    if (filters.profession !== undefined) this.professionFilter = filters.profession;
    if (filters.state !== undefined) this.stateFilter = filters.state;
    if (filters.search !== undefined) this.searchFilter = filters.search;
    if (filters.outreachStatus !== undefined) this.outreachFilter = filters.outreachStatus;
  }

  async addLead(lead: Partial<Lead>): Promise<Lead> {
    const prof = lead.profession || 'real_estate';
    const profMeta = PROFESSION_CONFIGS[prof] || PROFESSION_CONFIGS.real_estate;
    const fullName = lead.fullName || 'New Practitioner';
    const city = lead.city || 'Metro Area';
    const state = lead.state || 'CA';
    const school = lead.collegeOrSchool || `${state} Licensing Board`;

    const newLead: Lead = {
      id: lead.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fullName,
      profession: prof,
      professionTitle: lead.professionTitle || profMeta.defaultTitle,
      state,
      city,
      licenseNumber: lead.licenseNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: lead.issueDate || new Date().toISOString().split('T')[0],
      collegeOrSchool: school,
      graduationYear: lead.graduationYear || 2026,
      licenseStatus: lead.licenseStatus || 'Newly Issued',
      skipTraceStatus: lead.skipTraceStatus || 'Not Traced',
      skipTraceData: lead.skipTraceData,
      outreachStatus: lead.outreachStatus || 'Uncontacted',
      websiteConfig: lead.websiteConfig || getDefaultWebsiteConfig(fullName, prof, city, state, school),
      websiteAudit: lead.websiteAudit,
      outreachLogs: lead.outreachLogs || [],
      estimatedDealValue: lead.estimatedDealValue || profMeta.averageWebsiteValue || 1650,
      notes: lead.notes,
      createdAt: lead.createdAt || new Date().toISOString(),
    };

    this.leads = [newLead, ...this.leads];
    this.selectedLeadId = newLead.id;
    await IndexedDBStorage.saveLead(newLead);
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    const index = this.leads.findIndex((l) => l.id === id);
    if (index === -1) return;

    const updated = { ...this.leads[index], ...updates };
    const newLeads = [...this.leads];
    newLeads[index] = updated;
    this.leads = newLeads;
    await IndexedDBStorage.saveLead(updated);
  }

  async deleteLead(id: string): Promise<void> {
    this.leads = this.leads.filter((l) => l.id !== id);
    if (this.selectedLeadId === id) {
      this.selectedLeadId = this.leads[0]?.id || null;
    }
    await IndexedDBStorage.deleteLead(id);
  }

  async clearAllLeads(): Promise<void> {
    this.leads = [];
    this.selectedLeadId = null;
    await IndexedDBStorage.clearAll();
  }

  // REST API Actions
  async fetchLiveOpenRegistryData(profession?: ProfessionCategory, state?: string, quantity?: number) {
    const targetProf = profession || (this.professionFilter !== 'all' ? this.professionFilter : 'financial_advisor');
    const targetState = (state || (this.stateFilter !== 'all' ? this.stateFilter : 'AZ')).toUpperCase();
    const targetQty = quantity || this.fetchQuantity || 25;
    const profLabel = PROFESSION_CONFIGS[targetProf]?.label || targetProf;

    this.isSearchingRegistry = true;
    this.registryQueryStatus = `Querying ${profLabel} in ${targetState}...`;

    const loadingToastId = toast.loading(
      'Querying Open Regulatory Registry',
      `Searching official licensing records for ${profLabel} (${targetState}, Limit: ${targetQty})...`
    );

    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/registry/fetch-live`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          profession: targetProf,
          state: targetState,
          limit: targetQty,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Registry server error'}`);
      }

      const result = await res.json();
      const fetched = result.leads || [];
      toast.dismiss(loadingToastId);

      if (fetched.length > 0) {
        // Merge without duplicates and ensure clean name-based preview configurations
        const existingIds = new Set(this.leads.map((l) => l.licenseNumber));
        const newItems = fetched
          .map((l: Lead) => {
            if (
              !l.websiteConfig ||
              !l.websiteConfig.previewSlug ||
              l.websiteConfig.previewSlug.startsWith('finra-') ||
              l.websiteConfig.previewSlug.startsWith('nppes-')
            ) {
              l.websiteConfig = getDefaultWebsiteConfig(
                l.fullName,
                l.profession,
                l.city,
                l.state,
                l.collegeOrSchool
              );
            }
            return l;
          })
          .filter((l: Lead) => !existingIds.has(l.licenseNumber));

        this.leads = [...newItems, ...this.leads];
        if (newItems.length > 0) {
          this.selectedLeadId = newItems[0].id;
          await IndexedDBStorage.saveAllLeads(this.leads);
        }

        toast.success(
          `Discovered ${fetched.length} Practitioner Leads`,
          `Source: ${result.source || 'State Regulatory Registry'} (${targetState})`
        );
      } else {
        toast.warning(
          'No New Leads Discovered',
          result.groundingNotes || `Registry query returned 0 active records for ${profLabel} in ${targetState}.`
        );
      }

      return {
        totalFound: fetched.length,
        source: result.source || 'Open Registry Data',
        groundingNotes: result.groundingNotes || 'Queried live registry records.',
      };
    } catch (e: any) {
      toast.dismiss(loadingToastId);
      toast.error(
        'Registry Query Failed',
        e.message || 'Unable to connect to registry endpoint.'
      );
      console.warn('Registry query fallback', e);
      return { totalFound: 0, source: 'Registry', groundingNotes: e.message };
    } finally {
      this.isSearchingRegistry = false;
      this.registryQueryStatus = '';
    }
  }

  async performSkipTrace(id: string): Promise<SkipTraceResult | null> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return null;

    await this.updateLead(id, { skipTraceStatus: 'In Progress' });

    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/gemini/generate`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          action: 'skipTraceEnrichment',
          payload: {
            name: lead.fullName,
            profession: lead.profession,
            city: lead.city,
            state: lead.state,
            licenseNumber: lead.licenseNumber,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const skipData: SkipTraceResult = data.data || {
        confidenceScore: 85,
        verifiedPhone: '',
        phoneType: 'Unverified',
        dncStatus: 'Public Directory',
        primaryEmail: '',
        emailValidation: 'No email located',
        currentAddress: `${lead.city}, ${lead.state}`,
        enrichmentNotes: 'Search Grounding completed.',
      };

      await this.updateLead(id, {
        skipTraceStatus: 'Traced',
        skipTraceData: skipData,
        outreachStatus: lead.outreachStatus === 'Uncontacted' ? 'Skip Traced' : lead.outreachStatus,
      });

      return skipData;
    } catch (err: any) {
      console.warn('Skip trace error:', err);
      await this.updateLead(id, { skipTraceStatus: 'Not Traced' });
      return null;
    }
  }

  async checkLeadWebsiteLive(id: string): Promise<ExistingWebsiteAudit | null> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return null;

    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/leads/check-website`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          leadName: lead.fullName,
          profession: lead.profession,
          city: lead.city,
          state: lead.state,
          licenseNumber: lead.licenseNumber,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const auditData: ExistingWebsiteAudit = data.data;

      await this.updateLead(id, { websiteAudit: auditData });
      return auditData;
    } catch (err: any) {
      console.warn('Website check error:', err);
      return null;
    }
  }

  ensureWebsiteConfig(id: string): WebsitePreviewConfig {
    const lead = this.leads.find((l) => l.id === id);
    if (lead?.websiteConfig && lead.websiteConfig.previewSlug && !lead.websiteConfig.previewSlug.startsWith('finra-') && !lead.websiteConfig.previewSlug.startsWith('nppes-')) {
      return lead.websiteConfig;
    }

    const config = getDefaultWebsiteConfig(
      lead?.fullName || 'Professional',
      lead?.profession || 'real_estate',
      lead?.city || 'City',
      lead?.state || 'CA',
      lead?.collegeOrSchool || 'Board'
    );
    this.updateLead(id, { websiteConfig: config, outreachStatus: lead?.outreachStatus === 'Uncontacted' ? 'Site Built' : (lead?.outreachStatus || 'Site Built') });
    return config;
  }

  async recordOutreachLog(id: string, log: Omit<OutreachLogItem, 'id' | 'timestamp'>) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return;

    const newLogItem: OutreachLogItem = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    await this.updateLead(id, {
      outreachLogs: [newLogItem, ...(lead.outreachLogs || [])],
      outreachStatus: 'Outreach Sent',
    });
  }

  async syncLeadToCRM(id: string): Promise<{ success: boolean; message: string; contactId?: number }> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return { success: false, message: 'Lead not found' };

    const result = await CRMExportService.syncToQuestbook(lead);
    if (result.success && result.contactId) {
      await this.updateLead(id, {
        crmContactId: result.contactId,
        crmSyncedAt: new Date().toISOString(),
      });
    }
    return result;
  }

  async syncAllFilteredToCRM(): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;
    for (const lead of this.filteredLeads) {
      const res = await CRMExportService.syncToQuestbook(lead);
      if (res.success) {
        synced++;
        if (res.contactId) {
          await this.updateLead(lead.id, {
            crmContactId: res.contactId,
            crmSyncedAt: new Date().toISOString(),
          });
        }
      } else {
        failed++;
      }
    }
    return { synced, failed };
  }

  async syncLeadToBombBag(id: string, listId?: number, tags: string[] = []): Promise<BombBagSyncResult> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return { success: false, message: 'Lead not found' };

    const result = await BombBagService.syncToBombBag(lead, listId, tags);
    if (result.success && result.subscriberId) {
      await this.updateLead(id, {
        bombBagSubscriberId: result.subscriberId,
        bombBagSyncedAt: new Date().toISOString(),
        bombBagListId: result.listId,
      });
    }
    return result;
  }

  async syncAllFilteredToBombBag(listId?: number): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;
    const leadsToSync = [...this.filteredLeads];

    const batchRes = await BombBagService.syncBatchToBombBag(leadsToSync, listId);
    if (batchRes.success && batchRes.results) {
      for (const item of batchRes.results) {
        await this.updateLead(item.leadId, {
          bombBagSubscriberId: item.subscriberId,
          bombBagSyncedAt: new Date().toISOString(),
          bombBagListId: item.listId,
        });
        synced++;
      }
    } else {
      failed = leadsToSync.length;
    }
    return { synced, failed };
  }

  exportFilteredToCSV() {
    CRMExportService.exportToCSV(this.filteredLeads);
  }

  async importFromCSV(csvText: string): Promise<number> {
    const parsed = CRMExportService.parseCSV(csvText);
    let addedCount = 0;
    for (const item of parsed) {
      await this.addLead(item);
      addedCount++;
    }
    return addedCount;
  }
}

export const leadStore = new LeadStoreState();
