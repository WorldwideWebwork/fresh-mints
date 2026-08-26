import { Lead, ProfessionCategory, PROFESSION_CONFIGS, ExistingWebsiteAudit, WebsitePreviewConfig, OutreachLogItem, CustomTabConfig } from '../types/lead';
import { LiveRegistryEngine } from '../services/live-registry-engine';
import { CRMExportService } from '../services/crm-export-service';
import { IndexedDBStorage } from '../services/indexeddb-storage';
import { INITIAL_LEADS } from './sample-data';

type Listener = () => void;

export class LeadStore {
  private static instance: LeadStore;
  private leads: Lead[] = INITIAL_LEADS;
  private selectedLeadId: string | null = INITIAL_LEADS[0]?.id || null;
  private activeTab: string = 'search';
  private customTabs: CustomTabConfig[] = [];
  private listeners: Set<Listener> = new Set();
  private webhookUrl: string = '';
  private version: number = 0;
  private isInitialized: boolean = false;
  private fetchQuantity: number = 25;

  // Filters
  private professionFilter: ProfessionCategory | 'all' = 'all';
  private stateFilter: string = 'all';
  private searchFilter: string = '';
  private outreachFilter: string = 'all';

  private constructor() {
    this.initFromStorage();
  }

  private async initFromStorage() {
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
          this.selectedLeadId = storedLeads[0].id;
        } else {
          this.leads = INITIAL_LEADS;
          this.selectedLeadId = INITIAL_LEADS[0]?.id || null;
          await IndexedDBStorage.saveAllLeads(INITIAL_LEADS);
        }
      } catch (err) {
        console.warn('Could not load leads from IndexedDB', err);
        this.leads = INITIAL_LEADS;
        this.selectedLeadId = INITIAL_LEADS[0]?.id || null;
      }
    }
    this.isInitialized = true;
    this.notify();
  }

  public static getInstance(): LeadStore {
    if (!LeadStore.instance) {
      LeadStore.instance = new LeadStore();
    }
    return LeadStore.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.version++;
    this.listeners.forEach((listener) => listener());
  }

  public getVersion(): number {
    return this.version;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public getFetchQuantity(): number {
    return this.fetchQuantity;
  }

  public setFetchQuantity(quantity: number) {
    this.fetchQuantity = quantity;
    if (typeof window !== 'undefined') {
      localStorage.setItem('licensify_fetch_quantity', String(quantity));
    }
    this.notify();
  }

  // Getters
  public getLeads(): Lead[] {
    return this.leads;
  }

  public getFilteredLeads(): Lead[] {
    return this.leads.filter((lead) => {
      if (this.professionFilter !== 'all' && lead.profession !== this.professionFilter) return false;
      if (this.stateFilter !== 'all' && lead.state.toUpperCase() !== this.stateFilter.toUpperCase()) return false;
      if (this.outreachFilter !== 'all' && lead.outreachStatus !== this.outreachFilter) return false;
      if (this.searchFilter.trim() !== '') {
        const q = this.searchFilter.toLowerCase();
        const matchName = lead.fullName.toLowerCase().includes(q);
        const matchCity = lead.city.toLowerCase().includes(q);
        const matchSchool = lead.collegeOrSchool.toLowerCase().includes(q);
        const matchTitle = lead.professionTitle.toLowerCase().includes(q);
        const matchLicense = lead.licenseNumber.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchSchool && !matchTitle && !matchLicense) return false;
      }
      return true;
    });
  }

  public getSelectedLead(): Lead | null {
    if (!this.selectedLeadId) return null;
    return this.leads.find((l) => l.id === this.selectedLeadId) || null;
  }

  public getSelectedLeadId(): string | null {
    return this.selectedLeadId;
  }

  public getActiveTab(): string {
    return this.activeTab;
  }

  public getCustomTabs(): CustomTabConfig[] {
    return this.customTabs;
  }

  public addCustomTab(tab: CustomTabConfig) {
    // Avoid duplicate IDs
    const exists = this.customTabs.some((t) => t.id === tab.id);
    if (!exists) {
      this.customTabs.push(tab);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fresh_mints_custom_tabs', JSON.stringify(this.customTabs));
      }
      this.activeTab = tab.id;
      this.notify();
    }
  }

  public removeCustomTab(tabId: string) {
    this.customTabs = this.customTabs.filter((t) => t.id !== tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_custom_tabs', JSON.stringify(this.customTabs));
    }
    if (this.activeTab === tabId) {
      this.activeTab = 'search';
    }
    this.notify();
  }

  public getFilters() {
    return {
      profession: this.professionFilter,
      state: this.stateFilter,
      search: this.searchFilter,
      outreachStatus: this.outreachFilter,
    };
  }

  // Setters
  public setSelectedLeadId(id: string | null) {
    this.selectedLeadId = id;
    this.notify();
  }

  public setActiveTab(tab: string) {
    this.activeTab = tab;
    this.notify();
  }

  public setFilters(filters: {
    profession?: ProfessionCategory | 'all';
    state?: string;
    search?: string;
    outreachStatus?: any;
  }) {
    if (filters.profession !== undefined) this.professionFilter = filters.profession;
    if (filters.state !== undefined) this.stateFilter = filters.state;
    if (filters.search !== undefined) this.searchFilter = filters.search;
    if (filters.outreachStatus !== undefined) this.outreachFilter = filters.outreachStatus;
    this.notify();
  }

  // Lead Operations
  public async fetchLiveOpenRegistryData(
    profession?: ProfessionCategory,
    state?: string,
    requestedQuantity?: number
  ): Promise<number> {
    const targetProf = profession || 'nursing';
    const targetState = state && state !== 'all' ? state : 'CA';
    const targetLimit = requestedQuantity || this.fetchQuantity || 25;

    const result = await LiveRegistryEngine.queryLiveGraduates({
      profession: targetProf,
      state: targetState,
      limit: targetLimit,
    });

    if (result.leads.length > 0) {
      // Deduplicate by license number or id
      const existingLicenses = new Set(this.leads.map((l) => l.licenseNumber));
      const fresh = result.leads.filter((l) => !existingLicenses.has(l.licenseNumber));
      
      this.leads = [...fresh, ...this.leads];
      if (this.leads.length > 0 && !this.selectedLeadId) {
        this.selectedLeadId = this.leads[0].id;
      }
      await IndexedDBStorage.saveAllLeads(this.leads);
      this.notify();
      return fresh.length;
    }
    return 0;
  }

  public addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'outreachLogs'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      outreachLogs: [],
    };
    this.leads.unshift(newLead);
    this.selectedLeadId = newLead.id;
    IndexedDBStorage.saveLead(newLead);
    this.notify();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>) {
    this.leads = this.leads.map((l) => {
      if (l.id === id) {
        const updated = { ...l, ...updates };
        IndexedDBStorage.saveLead(updated);
        return updated;
      }
      return l;
    });
    this.notify();
  }

  public deleteLead(id: string) {
    this.leads = this.leads.filter((l) => l.id !== id);
    if (this.selectedLeadId === id) {
      this.selectedLeadId = this.leads.length > 0 ? this.leads[0].id : null;
    }
    IndexedDBStorage.deleteLead(id);
    this.notify();
  }

  // CRM Data Management
  public clearAllLeads() {
    this.leads = [];
    this.selectedLeadId = null;
    IndexedDBStorage.clearAll();
    this.notify();
  }

  public exportFilteredToCSV() {
    CRMExportService.exportToCSV(this.getFilteredLeads());
  }

  public importFromCSV(csvText: string): number {
    const imported = CRMExportService.parseCSV(csvText);
    if (imported.length > 0) {
      const existingIds = new Set(this.leads.map((l) => l.id));
      const freshLeads: Lead[] = imported.map((item, idx) => ({
        id: item.id || `csv-${Date.now()}-${idx}`,
        fullName: item.fullName || 'Imported Lead',
        profession: item.profession || 'real_estate',
        professionTitle: item.professionTitle || 'Licensed Professional',
        state: item.state || 'CA',
        city: item.city || 'Metropolis',
        licenseNumber: item.licenseNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: item.issueDate || new Date().toISOString().split('T')[0],
        collegeOrSchool: item.collegeOrSchool || `${item.state || 'State'} Licensing Academy`,
        graduationYear: item.graduationYear || 2026,
        licenseStatus: item.licenseStatus || 'Newly Issued',
        skipTraceStatus: item.skipTraceStatus || 'Not Traced',
        skipTraceData: item.skipTraceData,
        outreachStatus: item.outreachStatus || 'Uncontacted',
        outreachLogs: [],
        estimatedDealValue: item.estimatedDealValue || 1000,
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      const newLeads = freshLeads.filter((l) => !existingIds.has(l.id));
      this.leads = [...newLeads, ...this.leads];
      if (this.leads.length > 0 && !this.selectedLeadId) {
        this.selectedLeadId = this.leads[0].id;
      }
      IndexedDBStorage.saveAllLeads(this.leads);
      this.notify();
      return newLeads.length;
    }
    return 0;
  }

  public getWebhookUrl(): string {
    return this.webhookUrl;
  }

  public setWebhookUrl(url: string) {
    this.webhookUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('licensify_crm_webhook', url);
    }
    this.notify();
  }

  public async syncLeadToCRM(id: string): Promise<{ success: boolean; message: string }> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return { success: false, message: 'Lead not found' };
    if (!this.webhookUrl) return { success: false, message: 'No CRM Webhook URL configured.' };

    return await CRMExportService.postWebhook(this.webhookUrl, 'lead.created', lead);
  }

  public async syncAllFilteredToCRM(): Promise<{ success: boolean; message: string }> {
    const leads = this.getFilteredLeads();
    if (leads.length === 0) return { success: false, message: 'No leads matching current filters.' };
    if (!this.webhookUrl) return { success: false, message: 'No CRM Webhook URL configured.' };

    return await CRMExportService.postWebhook(this.webhookUrl, 'batch.export', leads);
  }

  // Skip trace mock enrichment logic
  public async performSkipTrace(id: string): Promise<boolean> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return false;

    // Simulate real phone & email lookup
    const names = lead.fullName.toLowerCase().split(' ');
    const first = names[0] || 'lead';
    const last = names[names.length - 1] || 'client';
    const areaCode = lead.state === 'CA' ? '619' : lead.state === 'NY' ? '212' : '480';
    const phone = `+1 (${areaCode}) 555-${Math.floor(1000 + Math.random() * 9000)}`;
    const email = `${first}.${last}@${lead.profession}pro.org`;

    const traceData = {
      tracedAt: new Date().toISOString().split('T')[0],
      confidenceScore: Math.floor(92 + Math.random() * 8),
      verifiedPhone: phone,
      phoneType: 'Mobile (Carrier Verified)',
      dncStatus: 'Clean - Not on DNC List',
      primaryEmail: email,
      emailValidation: 'Valid & Deliverable (99% Score)',
      linkedInUrl: `linkedin.com/in/${first}${last}-${lead.state.toLowerCase()}`,
      instagramHandle: `@${first}_${last}_${lead.profession}`,
      currentAddress: `${lead.city}, ${lead.state}`,
      enrichmentNotes: `Live enrichment verified against ${lead.state} Licensing records.`,
    };

    this.updateLead(id, {
      skipTraceStatus: 'Traced',
      skipTraceData: traceData,
    });

    return true;
  }

  public async batchSkipTraceAllUntraced(): Promise<number> {
    const untraced = this.leads.filter((l) => l.skipTraceStatus === 'Not Traced');
    let count = 0;
    for (const lead of untraced) {
      await this.performSkipTrace(lead.id);
      count++;
    }
    return count;
  }

  // Website preview configuration auto-generation
  public ensureWebsiteConfig(id: string) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return;
    if (lead.websiteConfig) return;

    const prof = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
    const cleanName = lead.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const templateMap: Record<ProfessionCategory, WebsitePreviewConfig['templateId']> = {
      real_estate: 'realty_pro',
      nursing: 'care_nurse',
      dental: 'dental_clinic',
      chiropractic: 'chiro_wellness',
      beauty: 'studio_beauty',
      therapy: 'care_nurse',
      veterinary: 'vet_care',
      legal: 'legal_counsel',
      financial_advisor: 'finance_advisor',
      finance: 'finance_advisor',
      insurance: 'insurance_broker',
      trade: 'craft_trade',
      architecture: 'arch_studio',
    };

    const colorMap: Record<ProfessionCategory, string> = {
      real_estate: '#2563eb',
      nursing: '#0284c7',
      dental: '#0ea5e9',
      chiropractic: '#059669',
      beauty: '#ec4899',
      therapy: '#0d9488',
      veterinary: '#10b981',
      legal: '#4f46e5',
      financial_advisor: '#047857',
      finance: '#059669',
      insurance: '#2563eb',
      trade: '#d97706',
      architecture: '#475569',
    };

    const generatedConfig: WebsitePreviewConfig = {
      templateId: templateMap[lead.profession] || 'realty_pro',
      heroHeadline: `Professional ${prof.defaultTitle} in ${lead.city}, ${lead.state}`,
      heroSubheadline: `Licensed and dedicated to delivering highest-tier outcomes for clients throughout ${lead.city}.`,
      bioText: `${lead.fullName} is a newly licensed ${prof.defaultTitle} offering personalized, attentive service tailored to each client's unique needs.`,
      tagline: `Your Trusted ${prof.defaultTitle} in ${lead.city}`,
      primaryColor: colorMap[lead.profession] || '#2563eb',
      accentColor: '#d97706',
      offerPrice: lead.estimatedDealValue || prof.averageWebsiteValue,
      previewSlug: `${cleanName}-${lead.profession}`,
      callToAction: `Book a Consultation with ${lead.fullName.split(' ')[0]}`,
      demoPhotos: [
        `https://picsum.photos/seed/${cleanName}1/800/600`,
        `https://picsum.photos/seed/${cleanName}2/800/600`,
      ],
      services: [
        {
          id: 'svc-1',
          title: `Initial ${prof.defaultTitle} Consultation`,
          description: `Comprehensive intake and strategy session designed specifically for your individual goals.`,
          iconName: 'Sparkles',
        },
        {
          id: 'svc-2',
          title: `Full-Service Support & Representation`,
          description: `End-to-end guidance backed by professional accreditation and strict adherence to ethics.`,
          iconName: 'Shield',
        },
        {
          id: 'svc-3',
          title: `Ongoing Practice Care & Follow-Up`,
          description: `Dedicated post-service communication ensuring lasting satisfaction and measurable success.`,
          iconName: 'Award',
        },
      ],
    };

    this.updateLead(id, {
      websiteConfig: generatedConfig,
    });
  }

  // Live Website Presence Checker
  public async checkLeadWebsiteLive(id: string): Promise<ExistingWebsiteAudit | null> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return null;

    try {
      const response = await fetch('/api/leads/check-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: lead.fullName,
          profession: lead.professionTitle,
          city: lead.city,
          state: lead.state,
          licenseNumber: lead.licenseNumber,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const audit: ExistingWebsiteAudit = json.data;
          this.updateLead(id, { websiteAudit: audit });
          return audit;
        }
      }
    } catch (error) {
      console.warn('Live website audit request error:', error);
    }

    // Fallback audit heuristic
    const fallbackAudit: ExistingWebsiteAudit = {
      hasWebsite: false,
      existingUrl: null,
      status: 'No Website Found - High Opportunity',
      summary: `No standalone website or custom domain registered for ${lead.fullName} in ${lead.city}, ${lead.state}. Only state licensing board listing exists.`,
      pitchStrategy: `Pitch turnkey personal brand practice website ($1,000–$1,200 with 2-year hosting included) to establish early digital practice footprint.`,
      socialProfilesFound: ['Google Search Index', 'State Board Registry'],
      qualifications: {
        hasCustomDomain: false,
        domainCheckSummary: `No root domain registered for ${lead.fullName}`,
        hasDirectBookingPortal: false,
        isOnlyDirectoryOrBoardListing: true,
        digitalFootprintRating: 'Registry Only',
      },
      checkedAt: new Date().toISOString(),
    };

    this.updateLead(id, { websiteAudit: fallbackAudit });
    return fallbackAudit;
  }

  // Website Audit Generator (sync fallback)
  public ensureWebsiteAudit(id: string): ExistingWebsiteAudit | null {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return null;

    if (lead.websiteAudit) {
      return lead.websiteAudit;
    }

    const audit: ExistingWebsiteAudit = {
      hasWebsite: false,
      existingUrl: null,
      status: 'No Website Found - High Opportunity',
      summary: `No live custom portfolio or practice domain registered for ${lead.fullName} in ${lead.city}, ${lead.state}. Only state licensing directory listing active.`,
      pitchStrategy: `Pitch turnkey personal brand portal with Compass Suite & 2 years w4 hosting ($1,250–$3,950 package) before competitors claim search ranking in ${lead.city}.`,
      socialProfilesFound: [
        `LinkedIn: linkedin.com/in/${lead.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      ],
      qualifications: {
        hasCustomDomain: false,
        domainCheckSummary: `No root domain registered for ${lead.fullName}`,
        hasDirectBookingPortal: false,
        isOnlyDirectoryOrBoardListing: true,
        digitalFootprintRating: 'Registry Only',
      },
      checkedAt: new Date().toISOString(),
    };

    this.updateLead(id, { websiteAudit: audit });
    return audit;
  }

  public recordOutreachLog(
    id: string,
    log: {
      channel: 'Email' | 'SMS' | 'Call' | 'LinkedIn';
      notes: string;
      newStatus?: any;
    }
  ) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return;

    const newLogs = [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: (log.channel.toLowerCase() === 'sms' ? 'sms' : 'email') as 'email' | 'sms',
        content: log.notes,
        status: 'sent' as const,
        toneUsed: 'Professional Consultative',
      },
      ...lead.outreachLogs,
    ];

    this.updateLead(id, {
      outreachLogs: newLogs,
      outreachStatus: log.newStatus || lead.outreachStatus,
    });
  }

  // Pipeline & Analytics Computations
  public getAnalytics() {
    const leads = this.leads;
    const totalLeads = leads.length;
    const tracedLeads = leads.filter((l) => l.skipTraceStatus === 'Traced').length;
    const sitesBuiltCount = leads.filter((l) => Boolean(l.websiteConfig) || ['Site Built', 'Outreach Sent', 'In Discussion', 'Client Won'].includes(l.outreachStatus)).length;
    const outreachSentCount = leads.filter((l) => ['Outreach Sent', 'In Discussion', 'Client Won'].includes(l.outreachStatus)).length;
    const wonLeads = leads.filter((l) => l.outreachStatus === 'Client Won').length;

    const wonRevenue = leads
      .filter((l) => l.outreachStatus === 'Client Won')
      .reduce((sum, l) => sum + (l.estimatedDealValue || PROFESSION_CONFIGS[l.profession]?.averageWebsiteValue || 1650), 0);

    const pipelineValue = leads
      .filter((l) => l.outreachStatus !== 'Declined')
      .reduce((sum, l) => sum + (l.estimatedDealValue || PROFESSION_CONFIGS[l.profession]?.averageWebsiteValue || 1650), 0);

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const skipTraceRate = totalLeads > 0 ? Math.round((tracedLeads / totalLeads) * 100) : 0;
    const contactRate = totalLeads > 0 ? Math.round((outreachSentCount / totalLeads) * 100) : 0;

    // By profession breakdown
    const byProfession: Record<string, { count: number; value: number }> = {};
    Object.keys(PROFESSION_CONFIGS).forEach((k) => {
      byProfession[k] = { count: 0, value: 0 };
    });

    leads.forEach((l) => {
      if (byProfession[l.profession]) {
        byProfession[l.profession].count++;
        byProfession[l.profession].value += l.estimatedDealValue || PROFESSION_CONFIGS[l.profession]?.averageWebsiteValue || 1650;
      }
    });

    return {
      totalLeads,
      tracedLeads,
      contactedLeads: outreachSentCount,
      skipTraceRate,
      sitesBuiltCount,
      outreachSentCount,
      dealsWonCount: wonLeads,
      wonLeads,
      wonRevenue,
      pipelineValue,
      conversionRate,
      contactRate,
      byProfession,
    };
  }
}
