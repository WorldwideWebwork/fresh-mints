import {
  type Lead,
  type ProfessionCategory,
  PROFESSION_CONFIGS,
  type ExistingWebsiteAudit,
  type WebsitePreviewConfig,
  type OutreachLogItem,
  type CustomTabConfig,
  type SkipTraceResult,
  type GooglePlaceBusiness,
  type GooglePlacesSearchParams,
  type GooglePlacesSearchResponse,
} from '../types/lead';
import { CRMExportService } from '../services/crm-export-service';
import { BombBagService, type BombBagSyncResult } from '../services/bomb-bag-service';
import { IndexedDBStorage } from '../services/indexeddb-storage';
import { getDefaultWebsiteConfig, generateLeadPreviewSlug } from '../services/website-templates';
import { INITIAL_VERIFIED_LEADS } from '../services/initial-seeds';
import { authStore } from './auth-store.svelte';
import { toast } from './toast.svelte';
import { type SocialMonitorRule, type SocialLead } from '../services/social-feed/types';
import { socialFeedRegistry } from '../services/social-feed/social-feed-registry';

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
  isSearchingPlaces = $state<boolean>(false);
  placesSearchResults = $state<GooglePlaceBusiness[]>([]);
  placesLastResponse = $state<GooglePlacesSearchResponse | null>(null);

  socialRules = $state<SocialMonitorRule[]>([
    {
      id: 'rule-web-upgrade',
      name: 'Website Redesign & Upgrades',
      keywords: ['website', 'web design', 'landing page', 'agency', 'overhaul', 'switch hosting'],
      negativeKeywords: ['job', 'internship', 'hiring developer'],
      platforms: ['hacker_news', 'reddit'],
      minIntentScore: 50,
      isActive: true,
      autoConvertToCrm: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule-crm-tools',
      name: 'CRM & Lead Automation',
      keywords: ['crm', 'lead generation', 'followup', 'client portal', 'booking system'],
      negativeKeywords: ['course', 'crypto'],
      platforms: ['hacker_news', 'reddit'],
      minIntentScore: 60,
      isActive: true,
      autoConvertToCrm: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  socialLeads = $state<SocialLead[]>([]);
  isScanningSocialFeeds = $state<boolean>(false);

  // Filters
  professionFilter = $state<ProfessionCategory | 'all'>('all');
  stateFilter = $state<string>('all');
  searchFilter = $state<string>('');
  outreachFilter = $state<string>('all');
  dateWindowFilter = $state<string>('all');

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
      const savedDateWindow = localStorage.getItem('licensify_date_window');
      if (savedDateWindow) {
        this.dateWindowFilter = savedDateWindow;
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
        const savedRules = localStorage.getItem('fresh_mints_social_rules');
        if (savedRules) {
          this.socialRules = JSON.parse(savedRules);
        }
      } catch (rulesErr) {
        console.warn('Could not load social rules', rulesErr);
      }
      try {
        const savedSocialLeads = localStorage.getItem('fresh_mints_social_leads');
        if (savedSocialLeads) {
          const parsed: SocialLead[] = JSON.parse(savedSocialLeads);
          this.socialLeads = parsed.filter((item) => {
            const isMockPlatform = (item.rawPost.platform as string) === 'mock';
            const isMockUrl = item.rawPost.url.includes('_mock');
            return !isMockPlatform && !isMockUrl;
          });
        }
      } catch (socialErr) {
        console.warn('Could not load social leads', socialErr);
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
      // Date window filter
      if (this.dateWindowFilter !== 'all') {
        const days = parseInt(this.dateWindowFilter, 10);
        if (!isNaN(days) && days > 0) {
          const cutoff = Date.now() - (days * 86400000);
          const leadDateStr = lead.issueDate || lead.createdAt;
          const leadTime = leadDateStr ? new Date(leadDateStr).getTime() : 0;
          if (leadTime > 0 && leadTime < cutoff) {
            return false;
          }
        }
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

  setDateWindowFilter(dateWindow: string) {
    this.dateWindowFilter = dateWindow;
    if (typeof window !== 'undefined') {
      localStorage.setItem('licensify_date_window', dateWindow);
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
    dateWindow?: string;
  }) {
    if (filters.profession !== undefined) this.professionFilter = filters.profession;
    if (filters.state !== undefined) this.stateFilter = filters.state;
    if (filters.search !== undefined) this.searchFilter = filters.search;
    if (filters.outreachStatus !== undefined) this.outreachFilter = filters.outreachStatus;
    if (filters.dateWindow !== undefined) this.dateWindowFilter = filters.dateWindow;
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

    const repUser = authStore.user;
    const repName = repUser?.fullName || repUser?.username;

    if (updates.outreachStatus === 'Client Won' && !updates.closedByRep && repName) {
      updates.closedByRep = repName;
      updates.closedAt = updates.closedAt || new Date().toISOString();
    }

    if (repName && !this.leads[index].assignedRep && !updates.assignedRep) {
      updates.assignedRep = repName;
    }

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
  async fetchLiveOpenRegistryData(profession?: ProfessionCategory, state?: string, quantity?: number, dateWindow?: string) {
    const targetProf = profession || (this.professionFilter !== 'all' ? this.professionFilter : 'financial_advisor');
    const targetState = (state || (this.stateFilter !== 'all' ? this.stateFilter : 'AZ')).toUpperCase();
    const targetQty = quantity || this.fetchQuantity || 25;
    const targetWindow = dateWindow || (this.dateWindowFilter !== 'all' ? this.dateWindowFilter : 'all');
    const profLabel = PROFESSION_CONFIGS[targetProf]?.label || targetProf;

    this.isSearchingRegistry = true;
    this.registryQueryStatus = `Querying ${profLabel} in ${targetState}...`;

    const windowNote = targetWindow !== 'all' ? ` (Past ${targetWindow} days)` : '';
    const loadingToastId = toast.loading(
      'Querying Open Regulatory Registry',
      `Searching official licensing records for ${profLabel} (${targetState}, Limit: ${targetQty}${windowNote})...`
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
          date_window: targetWindow,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Registry server error'}`);
      }

      const result = await res.json();
      const fetched = result.leads || [];
      toast.dismiss(loadingToastId);

      let newAddedCount = 0;

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

        newAddedCount = newItems.length;

        if (newItems.length > 0) {
          this.leads = [...newItems, ...this.leads];
          this.selectedLeadId = newItems[0].id;
          await IndexedDBStorage.saveAllLeads(this.leads);

          const duplicateCount = fetched.length - newItems.length;
          const duplicateNote = duplicateCount > 0 ? ` (${duplicateCount} already saved)` : '';

          toast.success(
            `Added ${newItems.length} New Practitioner Leads`,
            `Source: ${result.source || 'State Regulatory Registry'} (${targetState})${duplicateNote}`
          );
        } else {
          toast.info(
            'Records Already In Pipeline',
            `All ${fetched.length} retrieved records for ${profLabel} are already in your pipeline.`
          );
        }

        // Align filters to match queried profession and state so results are immediately visible
        this.professionFilter = targetProf;
        if (targetState) {
          this.stateFilter = targetState;
        }
      } else {
        toast.warning(
          'No New Leads Discovered',
          result.groundingNotes || `Registry query returned 0 active records for ${profLabel} in ${targetState}.`
        );
      }

      return {
        totalFound: fetched.length,
        newAdded: newAddedCount,
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

  async searchGooglePlaces(params: GooglePlacesSearchParams): Promise<GooglePlacesSearchResponse> {
    this.isSearchingPlaces = true;
    const queryLabel = params.query || params.keyword || params.profession || 'businesses';
    const locLabel = params.city ? ` in ${params.city}${params.state ? ', ' + params.state : ''}` : '';

    const loadingToastId = toast.loading(
      'Scanning Google Places API',
      `Searching for "${queryLabel}"${locLabel} & analyzing website presence...`
    );

    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/places/search-no-website`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          query: params.query,
          keyword: params.keyword,
          profession: params.profession,
          city: params.city,
          state: params.state,
          filter_no_website: params.filterNoWebsite !== undefined ? params.filterNoWebsite : true,
          min_rating: params.minRating || 0,
          min_reviews: params.minReviews || 0,
          pagetoken: params.pagetoken || '',
          limit: params.limit || 20,
        }),
      });

      toast.dismiss(loadingToastId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: Google Places lookup failed.`);
      }

      const responseData: GooglePlacesSearchResponse = await res.json();
      this.placesLastResponse = responseData;
      this.placesSearchResults = responseData.leads || [];

      if (responseData.leads && responseData.leads.length > 0) {
        const noSiteCount = responseData.noWebsiteCount + responseData.directoryOnlyCount;
        toast.success(
          `Found ${responseData.leads.length} Target Businesses`,
          `${noSiteCount} of ${responseData.totalQueried} businesses (${responseData.strikeRatePercentage}%) have NO custom standalone website!`
        );
      } else {
        toast.info(
          'Google Places Search Complete',
          `No qualifying businesses matching filters found for "${queryLabel}"${locLabel}.`
        );
      }

      return responseData;
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error('Google Places Search Failed', err.message || 'Unable to complete search.');
      console.warn('Google Places search error', err);
      const emptyRes: GooglePlacesSearchResponse = {
        success: false,
        query: params.query || '',
        totalQueried: 0,
        totalReturned: 0,
        noWebsiteCount: 0,
        directoryOnlyCount: 0,
        hasWebsiteCount: 0,
        strikeRatePercentage: 0,
        potentialPipelineValue: 0,
        leads: [],
      };
      this.placesLastResponse = emptyRes;
      this.placesSearchResults = [];
      return emptyRes;
    } finally {
      this.isSearchingPlaces = false;
    }
  }

  async importGooglePlacesLead(place: GooglePlaceBusiness): Promise<Lead> {
    const existingIndex = this.leads.findIndex((l) => l.id === place.id || l.licenseNumber === place.licenseNumber);
    if (existingIndex !== -1) {
      toast.info('Already in Leads Pipeline', `${place.fullName} is already saved in your pipeline.`);
      this.selectedLeadId = this.leads[existingIndex].id;
      return this.leads[existingIndex];
    }

    const resolvedPhone = place.phone || place.skipTraceData?.verifiedPhone || place.internationalPhone || '';

    const newLead: Lead = {
      id: place.id,
      fullName: place.fullName,
      profession: place.profession,
      professionTitle: place.professionTitle,
      state: place.state,
      city: place.city,
      licenseNumber: place.licenseNumber,
      issueDate: place.issueDate,
      collegeOrSchool: place.collegeOrSchool,
      graduationYear: place.graduationYear,
      licenseStatus: place.licenseStatus,
      skipTraceStatus: resolvedPhone ? 'Traced' : (place.skipTraceStatus || 'Not Traced'),
      skipTraceData: place.skipTraceData || (resolvedPhone ? {
        tracedAt: new Date().toISOString(),
        confidenceScore: 98,
        verifiedPhone: resolvedPhone,
        phoneType: 'Google Business Line',
        dncStatus: 'Public Business Directory',
        primaryEmail: '',
        emailValidation: 'Unverified',
        websiteUrl: place.website || '',
        currentAddress: place.formattedAddress,
        enrichmentNotes: `Google Places Verified (Rating: ${place.rating} stars across ${place.userRatingsTotal} reviews)`,
      } : undefined),
      outreachStatus: 'Uncontacted',
      websiteConfig: place.websiteConfig || getDefaultWebsiteConfig(place.fullName, place.profession, place.city, place.state, place.collegeOrSchool),
      websiteAudit: place.hasWebsite ? {
        hasWebsite: true,
        existingUrl: place.website,
        status: 'Has Existing Website',
        summary: `Google verified domain: ${place.website}`,
        pitchStrategy: 'Pitch SEO upgrade or turnkey modernization.',
        socialProfilesFound: [],
        qualifications: {
          hasCustomDomain: true,
          domainCheckSummary: `Domain on Google listing: ${place.website}`,
          hasDirectBookingPortal: false,
          isOnlyDirectoryOrBoardListing: false,
          digitalFootprintRating: 'Established Custom Site',
        },
        checkedAt: new Date().toISOString(),
      } : {
        hasWebsite: false,
        existingUrl: place.website || null,
        status: place.websiteStatus === 'directory_only' ? 'Directory Listing Only' : 'No Website Found - High Opportunity',
        summary: place.websiteSummary,
        pitchStrategy: `Pitch turnkey practice package ($${place.estimatedDealValue.toLocaleString()} with 2 years hosting included).`,
        socialProfilesFound: place.website ? [place.website] : [],
        qualifications: {
          hasCustomDomain: false,
          domainCheckSummary: place.websiteStatus === 'directory_only' ? `Directory link: ${place.website}` : 'No root domain on Google Places profile.',
          hasDirectBookingPortal: false,
          isOnlyDirectoryOrBoardListing: true,
          digitalFootprintRating: place.websiteStatus === 'directory_only' ? 'Directory Listing' : 'Zero Digital Presence',
        },
        checkedAt: new Date().toISOString(),
      },
      outreachLogs: [],
      estimatedDealValue: place.estimatedDealValue,
      notes: `Imported from Google Places Radar (Rating: ${place.rating} stars, ${place.userRatingsTotal} reviews, Maps: ${place.googleMapsUrl})`,
      createdAt: place.createdAt || new Date().toISOString(),
    };

    this.leads = [newLead, ...this.leads];
    this.selectedLeadId = newLead.id;
    await IndexedDBStorage.saveLead(newLead);
    toast.success('Imported to Minted Leads', `${place.fullName} is ready for outreach & CRM sync.`);
    return newLead;
  }

  async importAllGooglePlacesLeads(places: GooglePlaceBusiness[]): Promise<number> {
    if (!places || places.length === 0) return 0;
    const existingIds = new Set(this.leads.map((l) => l.licenseNumber));
    const newItems: Lead[] = [];

    for (const place of places) {
      if (!existingIds.has(place.licenseNumber)) {
        const placeSkip = place.skipTraceData ? { ...place.skipTraceData, websiteUrl: place.website || place.skipTraceData.websiteUrl } : undefined;
        const lead: Lead = {
          id: place.id,
          fullName: place.fullName,
          profession: place.profession,
          professionTitle: place.professionTitle,
          state: place.state,
          city: place.city,
          licenseNumber: place.licenseNumber,
          issueDate: place.issueDate,
          collegeOrSchool: place.collegeOrSchool,
          graduationYear: place.graduationYear,
          licenseStatus: place.licenseStatus,
          skipTraceStatus: place.skipTraceStatus,
          skipTraceData: placeSkip,
          outreachStatus: 'Uncontacted',
          websiteConfig: place.websiteConfig || getDefaultWebsiteConfig(place.fullName, place.profession, place.city, place.state, place.collegeOrSchool),
          websiteAudit: {
            hasWebsite: place.hasWebsite,
            existingUrl: place.website || null,
            status: place.hasWebsite ? 'Website Found' : 'No Website Found - High Opportunity',
            summary: place.websiteSummary,
            pitchStrategy: `Pitch turnkey package ($${place.estimatedDealValue.toLocaleString()} with 2-yr hosting).`,
            socialProfilesFound: place.website ? [place.website] : [],
            qualifications: {
              hasCustomDomain: place.hasWebsite,
              domainCheckSummary: place.websiteSummary,
              hasDirectBookingPortal: false,
              isOnlyDirectoryOrBoardListing: !place.hasWebsite,
              digitalFootprintRating: place.hasWebsite ? 'Established Custom Site' : (place.websiteStatus === 'directory_only' ? 'Directory Listing' : 'Zero Digital Presence'),
            },
            checkedAt: new Date().toISOString(),
          },
          outreachLogs: [],
          estimatedDealValue: place.estimatedDealValue,
          notes: `Imported via Google Places Radar (Rating: ${place.rating} stars, ${place.userRatingsTotal} reviews)`,
          createdAt: place.createdAt || new Date().toISOString(),
        };
        newItems.push(lead);
        existingIds.add(place.licenseNumber);
      }
    }

    if (newItems.length > 0) {
      this.leads = [...newItems, ...this.leads];
      this.selectedLeadId = newItems[0].id;
      await IndexedDBStorage.saveAllLeads(this.leads);
      toast.success(`Imported ${newItems.length} Businesses`, `Added ${newItems.length} leads to your pipeline.`);
    } else {
      toast.info('All Records Already In Pipeline', 'Selected businesses have already been imported.');
    }

    return newItems.length;
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

      const hasContact = Boolean(skipData.verifiedPhone || skipData.primaryEmail);

      // Construct or sync websiteAudit if websiteUrl was found
      let updatedAudit = lead.websiteAudit;
      if (skipData.websiteUrl && (!updatedAudit || !updatedAudit.existingUrl)) {
        updatedAudit = {
          hasWebsite: true,
          existingUrl: skipData.websiteUrl,
          status: 'Has Existing Website',
          summary: `Standalone website detected: ${skipData.websiteUrl}` + (skipData.primaryEmail ? ` (Scraped email: ${skipData.primaryEmail})` : ''),
          pitchStrategy: 'Pitch SEO upgrade or turnkey modernization.',
          socialProfilesFound: [],
          extractedEmails: skipData.extractedEmails || (skipData.primaryEmail ? [skipData.primaryEmail] : []),
          extractedPhones: skipData.extractedPhones || (skipData.verifiedPhone ? [skipData.verifiedPhone] : []),
          qualifications: {
            hasCustomDomain: true,
            domainCheckSummary: `Domain found: ${skipData.websiteUrl}`,
            hasDirectBookingPortal: false,
            isOnlyDirectoryOrBoardListing: false,
            digitalFootprintRating: 'Established Custom Site',
          },
          checkedAt: new Date().toISOString(),
        };
      } else if (updatedAudit && skipData.extractedEmails && skipData.extractedEmails.length > 0) {
        updatedAudit = {
          ...updatedAudit,
          extractedEmails: Array.from(new Set([...(updatedAudit.extractedEmails || []), ...skipData.extractedEmails])),
          extractedPhones: Array.from(new Set([...(updatedAudit.extractedPhones || []), ...(skipData.extractedPhones || [])])),
        };
      }

      await this.updateLead(id, {
        skipTraceStatus: hasContact ? 'Traced' : 'Partial',
        skipTraceData: skipData,
        websiteAudit: updatedAudit,
        outreachStatus: (hasContact && lead.outreachStatus === 'Uncontacted') ? 'Skip Traced' : lead.outreachStatus,
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

      // Synchronize scraped emails and website URL into lead skipTraceData
      const currentSkip = lead.skipTraceData || {
        tracedAt: new Date().toISOString(),
        confidenceScore: auditData.hasWebsite ? 90 : 30,
        verifiedPhone: '',
        phoneType: 'Unverified',
        dncStatus: 'Public Business Directory',
        primaryEmail: '',
        emailValidation: '',
        currentAddress: `${lead.city}, ${lead.state}`,
        enrichmentNotes: 'Website presence audit completed.',
      };

      const extractedEmails = auditData.extractedEmails || [];
      const extractedPhones = auditData.extractedPhones || [];
      const updatedPrimaryEmail = currentSkip.primaryEmail || (extractedEmails.length > 0 ? extractedEmails[0] : '');
      const updatedPrimaryPhone = currentSkip.verifiedPhone || (extractedPhones.length > 0 ? extractedPhones[0] : '');

      const updatedSkipTrace: SkipTraceResult = {
        ...currentSkip,
        websiteUrl: auditData.existingUrl || currentSkip.websiteUrl,
        extractedEmails: Array.from(new Set([...(currentSkip.extractedEmails || []), ...extractedEmails])),
        extractedPhones: Array.from(new Set([...(currentSkip.extractedPhones || []), ...extractedPhones])),
        primaryEmail: updatedPrimaryEmail,
        verifiedPhone: updatedPrimaryPhone,
        emailValidation: updatedPrimaryEmail ? (currentSkip.emailValidation || 'Website Scraped & Verified') : currentSkip.emailValidation,
      };

      const hasContact = Boolean(updatedSkipTrace.verifiedPhone || updatedSkipTrace.primaryEmail);

      await this.updateLead(id, {
        websiteAudit: auditData,
        skipTraceData: updatedSkipTrace,
        skipTraceStatus: hasContact ? 'Traced' : lead.skipTraceStatus,
        outreachStatus: (hasContact && lead.outreachStatus === 'Uncontacted') ? 'Skip Traced' : lead.outreachStatus,
      });

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

  private saveSocialRulesToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_social_rules', JSON.stringify(this.socialRules));
    }
  }

  private saveSocialLeadsToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_mints_social_leads', JSON.stringify(this.socialLeads));
    }
  }

  addSocialRule(rule: Omit<SocialMonitorRule, 'id' | 'createdAt'>) {
    const newRule: SocialMonitorRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.socialRules.push(newRule);
    this.saveSocialRulesToStorage();
    toast.success('Social Rule Created', `Monitoring rule "${newRule.name}" is now active.`);
  }

  toggleSocialRule(id: string) {
    this.socialRules = this.socialRules.map((r) => {
      const isTarget = r.id === id;
      return isTarget ? { ...r, isActive: !r.isActive } : r;
    });
    this.saveSocialRulesToStorage();
  }

  deleteSocialRule(id: string) {
    this.socialRules = this.socialRules.filter((r) => r.id !== id);
    this.saveSocialRulesToStorage();
  }

  async scanSocialFeeds(): Promise<number> {
    this.isScanningSocialFeeds = true;
    try {
      const detected = await socialFeedRegistry.scanRules(this.socialRules);
      const existingUrls = new Set(this.socialLeads.map((l) => l.rawPost.url));
      const freshLeads = detected.filter((l) => !existingUrls.has(l.rawPost.url));
      const hasFreshLeads = freshLeads.length > 0;

      if (hasFreshLeads) {
        this.socialLeads = [...freshLeads, ...this.socialLeads];
        this.saveSocialLeadsToStorage();
        toast.success(
          'Social Intent Radar Updated',
          `Discovered ${freshLeads.length} new high-intent social opportunities.`
        );
      } else {
        toast.info(
          'Scan Complete',
          'No new matching posts found in this scan cycle.'
        );
      }
      return freshLeads.length;
    } catch {
      toast.error('Social Scan Error', 'Failed to scan external social feeds.');
      return 0;
    } finally {
      this.isScanningSocialFeeds = false;
    }
  }

  async convertSocialLeadToCrmLead(socialLeadId: string): Promise<Lead | null> {
    const targetSocialLead = this.socialLeads.find((l) => l.id === socialLeadId);
    if (!targetSocialLead) {
      return null;
    }

    const raw = targetSocialLead.rawPost;
    const authorName = raw.author.replace(/^u\//, '');
    const cleanName = authorName
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Social Prospect';

    const newLead: Lead = {
      id: `lead-soc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: cleanName,
      profession: 'trade',
      professionTitle: 'Online Inbound Business',
      state: 'CA',
      city: 'Social Radar Inbound',
      licenseNumber: `SOC-${raw.platform.toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      collegeOrSchool: `${raw.platform.toUpperCase()} Discussion Lead`,
      graduationYear: new Date().getFullYear(),
      licenseStatus: 'Active / Good Standing',
      skipTraceStatus: 'untraced',
      outreachStatus: 'New',
      estimatedDealValue: 1650,
      leadSource: 'social_radar',
      socialContext: {
        platform: raw.platform,
        postUrl: raw.url,
        originalPostText: raw.content,
        matchedKeyword: targetSocialLead.matchedKeyword,
        intentScore: targetSocialLead.intentScore,
        detectedPainPoint: targetSocialLead.detectedPainPoint,
        suggestedPitch: targetSocialLead.suggestedPitch,
      },
      notes: `[Social Radar (${raw.platform})] ${raw.title}\nIntent Score: ${targetSocialLead.intentScore}%\nURL: ${raw.url}\n\nSuggested Pitch: ${targetSocialLead.suggestedPitch}`,
      createdAt: new Date().toISOString(),
      outreachLogs: [],
    };

    newLead.websiteConfig = getDefaultWebsiteConfig(newLead);

    await this.addLead(newLead);

    this.socialLeads = this.socialLeads.map((l) => {
      const isTarget = l.id === socialLeadId;
      return isTarget ? { ...l, status: 'converted', convertedLeadId: newLead.id } : l;
    });
    this.saveSocialLeadsToStorage();

    toast.success(
      'Minted to CRM Pipeline',
      `${newLead.fullName} added to Minted Leads and CRM Kanban Board.`
    );
    return newLead;
  }

  dismissSocialLead(socialLeadId: string) {
    this.socialLeads = this.socialLeads.map((l) => {
      const isTarget = l.id === socialLeadId;
      return isTarget ? { ...l, status: 'dismissed' } : l;
    });
    this.saveSocialLeadsToStorage();
  }
}

export const leadStore = new LeadStoreState();
