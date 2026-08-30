<script lang="ts">
  import { onMount } from 'svelte';
  import { type ProfessionCategory, PROFESSION_CONFIGS, type GooglePlaceBusiness, type Lead } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import {
    Search,
    MapPin,
    Globe,
    Phone,
    Star,
    ExternalLink,
    Sparkles,
    Building2,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Download,
    Eye,
    PhoneCall,
    Layers,
    Compass,
    RefreshCw,
    Plus,
    XCircle,
    Copy,
    TrendingUp,
    Zap
  } from 'lucide-svelte';
  import { US_STATES } from '../../types/states';

  interface Props {
    onopenmodal?: (modalName: string, lead?: any) => void;
    onopenfullpreview?: (lead: Lead) => void;
  }

  let { onopenmodal, onopenfullpreview }: Props = $props();

  let searchMode = $state<'structured' | 'omni'>('structured');
  let searchKeyword = $state('Tree Trimming & Removal');
  let omniQuery = $state('Tree Trimming & Removal in Phoenix AZ');
  let selectedProfession = $state<ProfessionCategory>('trade');
  let searchCity = $state('Phoenix');
  let searchState = $state('AZ');
  let filterNoWebsite = $state(true);
  let minRating = $state(0);
  let minReviews = $state(0);
  let viewMode = $state<'cards' | 'table'>('cards');
  let isBatchImporting = $state(false);

  const QUICK_SECTORS = [
    { label: 'Tree Trimming & Removal', keyword: 'Tree Trimming & Removal', profession: 'trade' as ProfessionCategory, hitRate: '55% No Site' },
    { label: 'Locksmiths', keyword: 'Emergency Locksmith Services', profession: 'trade' as ProfessionCategory, hitRate: '60% No Site' },
    { label: 'Mobile Auto Detailing', keyword: 'Mobile Auto Detailing', profession: 'trade' as ProfessionCategory, hitRate: '65% No Site' },
    { label: 'Towing & Recovery', keyword: 'Towing Service & Roadside', profession: 'trade' as ProfessionCategory, hitRate: '50% No Site' },
    { label: 'Plumbers', keyword: 'Plumbers', profession: 'trade' as ProfessionCategory, hitRate: '40% No Site' },
    { label: 'Roofing Contractors', keyword: 'Roofing Contractors', profession: 'trade' as ProfessionCategory, hitRate: '35% No Site' },
    { label: 'Drywall & Painting', keyword: 'Drywall Repair & Painting', profession: 'trade' as ProfessionCategory, hitRate: '45% No Site' },
    { label: 'Fence Installation', keyword: 'Fence & Gate Contractors', profession: 'trade' as ProfessionCategory, hitRate: '45% No Site' },
    { label: 'HVAC Services', keyword: 'HVAC Heating and Air', profession: 'trade' as ProfessionCategory, hitRate: '35% No Site' },
    { label: 'Dentists', keyword: 'Family Dentistry', profession: 'dental' as ProfessionCategory, hitRate: '25% No Site' },
    { label: 'Chiropractors', keyword: 'Chiropractors', profession: 'chiropractic' as ProfessionCategory, hitRate: '30% No Site' },
    { label: 'Salons & MedSpas', keyword: 'MedSpa Skincare', profession: 'beauty' as ProfessionCategory, hitRate: '35% No Site' },
    { label: 'Auto Repair', keyword: 'Auto Repair and Mechanics', profession: 'trade' as ProfessionCategory, hitRate: '35% No Site' },
    { label: 'CPAs & Tax Services', keyword: 'CPA Tax Services', profession: 'finance' as ProfessionCategory, hitRate: '30% No Site' },
  ];

  const stateOptions = [
    { value: 'ALL', label: 'All / Nationwide or Included in Query' },
    ...US_STATES.map((s) => ({ value: s.code, label: `${s.code} - ${s.fullName}` }))
  ];

  const ratingOptions = [
    { value: '0', label: 'Any Star Rating (0+ Stars)' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars (Recommended)' },
    { value: '4.5', label: '4.5+ Stars (High Reputation)' },
  ];

  const reviewOptions = [
    { value: '0', label: 'Any Review Count (0+ Reviews)' },
    { value: '5', label: '5+ Established Reviews' },
    { value: '15', label: '15+ Reviews' },
    { value: '50', label: '50+ High Volume' },
  ];

  const activeComposedQuery = $derived.by(() => {
    if (searchMode === 'omni') {
      return omniQuery.trim() || 'local businesses';
    }
    const parts: string[] = [];
    if (searchKeyword.trim()) {
      parts.push(searchKeyword.trim());
    } else {
      parts.push('local businesses');
    }
    if (searchCity.trim()) {
      parts.push(`in ${searchCity.trim()}`);
    }
    if (searchState && searchState !== 'ALL') {
      parts.push(searchState);
    }
    return parts.join(' ');
  });

  function applyQuickSector(sector: typeof QUICK_SECTORS[0]) {
    searchKeyword = sector.keyword;
    selectedProfession = sector.profession;
    if (searchMode === 'omni') {
      const loc = searchCity ? ` in ${searchCity}${searchState && searchState !== 'ALL' ? ' ' + searchState : ''}` : '';
      omniQuery = `${sector.keyword}${loc}`;
    }
  }

  async function handleExecutePlacesSearch(loadNextPage = false) {
    const pageToken = loadNextPage && leadStore.placesLastResponse?.nextPageToken ? leadStore.placesLastResponse.nextPageToken : undefined;

    const isOmni = searchMode === 'omni';
    const queryToSend = isOmni ? (omniQuery.trim() || 'local businesses') : searchKeyword.trim();
    const cityToSend = isOmni ? '' : searchCity.trim();
    const stateToSend = isOmni || searchState === 'ALL' ? '' : searchState;

    await leadStore.searchGooglePlaces({
      query: queryToSend,
      keyword: queryToSend,
      profession: selectedProfession,
      city: cityToSend,
      state: stateToSend,
      filterNoWebsite,
      minRating: Number(minRating) || 0,
      minReviews: Number(minReviews) || 0,
      pagetoken: pageToken,
      limit: 20,
    });
  }

  async function handleImportSingle(place: GooglePlaceBusiness) {
    const lead = await leadStore.importGooglePlacesLead(place);
    return lead;
  }

  async function handleImportAll() {
    if (!leadStore.placesSearchResults.length) return;
    isBatchImporting = true;
    try {
      await leadStore.importAllGooglePlacesLeads(leadStore.placesSearchResults);
    } finally {
      isBatchImporting = false;
    }
  }

  async function handleQuickPreview(place: GooglePlaceBusiness) {
    const lead = await handleImportSingle(place);
    if (lead) {
      if (onopenfullpreview) {
        onopenfullpreview(lead);
      } else {
        onopenmodal?.('website_builder', lead);
      }
    }
  }

  function handleOpenPitch(place: GooglePlaceBusiness) {
    const lead = leadStore.leads.find((l) => l.id === place.id) || place;
    onopenmodal?.('call_script', lead);
  }

  async function copyToClipboard(text: string, label: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} Copied`, text);
    } catch {
      toast.error('Copy Failed', 'Please select and copy manually.');
    }
  }

  const isSavedInPipeline = (placeId: string, licenseNumber: string) => {
    return leadStore.leads.some((l) => l.id === placeId || l.licenseNumber === licenseNumber);
  };
</script>

<div class="space-y-6">
  <!-- Radar Hero Banner -->
  <Card class="p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-800/40 text-slate-100 relative overflow-hidden shadow-xl">
    <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute right-32 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
      <div class="space-y-2.5 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Compass class="w-3.5 h-3.5 text-cyan-400" />
          <span>Google Places Radar &bull; Live Digital Footprint Engine</span>
        </div>
        <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <span>Query Local Businesses With No Website</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">High Conversion</span>
        </h2>
        <p class="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Scan Google Maps listings for high-opportunity businesses that have phone lines and customer reviews but lack a custom standalone domain or rely exclusively on Facebook or Yelp stubs.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="p-4 rounded-xl bg-slate-950/80 border border-cyan-800/50 text-center min-w-[130px]">
          <div class="text-2xl font-black text-cyan-400 font-mono">
            {leadStore.placesSearchResults.length}
          </div>
          <div class="text-[11px] text-slate-400 mt-0.5">Found in Scan</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/50 text-center min-w-[130px]">
          <div class="text-2xl font-black text-emerald-400 font-mono">
            {leadStore.placesLastResponse ? `${leadStore.placesLastResponse.strikeRatePercentage}%` : '0%'}
          </div>
          <div class="text-[11px] text-slate-400 mt-0.5">No-Site Strike Rate</div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Query Configuration Form -->
  <Card class="p-6 space-y-5">
    <div class="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Search class="w-4 h-4 text-cyan-500" />
          <span>Google Places Radar Query Engine</span>
        </h3>

        <!-- Mode Switcher -->
        <div class="flex items-center rounded-lg bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onclick={() => (searchMode = 'structured')}
            class="px-2.5 py-1 rounded-md transition-all cursor-pointer {searchMode === 'structured'
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400'}"
          >
            Structured Mode
          </button>
          <button
            type="button"
            onclick={() => (searchMode = 'omni')}
            class="px-2.5 py-1 rounded-md transition-all cursor-pointer {searchMode === 'omni'
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400'}"
          >
            Direct / Omni Query
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 dark:text-slate-400">Target Industry:</span>
        <IndustryBadge profession={selectedProfession} variant="badge" size="sm" />
      </div>
    </div>

    <!-- Quick Sector Selection Grid -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
          High-Yield "No Website" Sectors:
        </label>
        <span class="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
          Click any preset to auto-populate query
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each QUICK_SECTORS as sec}
          <button
            type="button"
            onclick={() => applyQuickSector(sec)}
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none flex items-center gap-1.5 {searchKeyword === sec.keyword || omniQuery.startsWith(sec.keyword)
              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 font-bold shadow-xs'
              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'}"
          >
            <Building2 class="w-3 h-3 text-cyan-500" />
            <span>{sec.label}</span>
            <span class="text-[10px] px-1 py-0.2 rounded bg-cyan-900/20 text-cyan-400 font-mono font-bold">{sec.hitRate}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if searchMode === 'omni'}
      <!-- Omni / Direct Query Search Input -->
      <div class="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-cyan-900/40">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Zap class="w-3.5 h-3.5 text-cyan-400" />
            <span>Direct Google Places Omni-Query:</span>
          </label>
          <span class="text-[11px] text-slate-400">
            Accepts any natural search (e.g. trade, zip code, county, or metro)
          </span>
        </div>
        <Input
          bind:value={omniQuery}
          placeholder="e.g. Tree Trimming in Phoenix AZ, Locksmith 75001, Mobile Detailing Tampa FL..."
          class="font-mono text-sm"
        />
        <div class="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
          <span class="text-slate-500">Suggested formats:</span>
          <button type="button" onclick={() => (omniQuery = 'Tree Trimming & Removal in Phoenix AZ')} class="hover:text-cyan-400 underline cursor-pointer">Tree Trimming in Phoenix AZ</button>
          <span>&bull;</span>
          <button type="button" onclick={() => (omniQuery = 'Emergency Locksmith 75001')} class="hover:text-cyan-400 underline cursor-pointer">Locksmith 75001</button>
          <span>&bull;</span>
          <button type="button" onclick={() => (omniQuery = 'Mobile Auto Detailing in Dallas County TX')} class="hover:text-cyan-400 underline cursor-pointer">Mobile Detailing Dallas County</button>
          <span>&bull;</span>
          <button type="button" onclick={() => (omniQuery = 'Drywall Contractor in Pinal County AZ')} class="hover:text-cyan-400 underline cursor-pointer">Drywall in Pinal County AZ</button>
        </div>
      </div>
    {:else}
      <!-- Structured Inputs Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <!-- Search Keyword / Trade -->
        <div class="lg:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Keyword or Trade:
          </label>
          <Input
            bind:value={searchKeyword}
            placeholder="e.g. Plumbers, Roofing, Family Dental..."
          />
        </div>

        <!-- City (Optional) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Target City <span class="text-slate-400 font-normal">(Optional)</span>:
          </label>
          <Input
            bind:value={searchCity}
            placeholder="Optional (e.g. Phoenix, Austin)"
          />
        </div>

        <!-- State (Optional) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            State <span class="text-slate-400 font-normal">(Optional)</span>:
          </label>
          <Select
            bind:value={searchState}
            options={stateOptions}
          />
        </div>

        <!-- Minimum Rating -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Rating Quality:
          </label>
          <Select
            bind:value={minRating}
            options={ratingOptions}
          />
        </div>
      </div>
    {/if}

    <!-- Live API Composed Query & Dissection Preview -->
    <div class="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-2 min-w-0">
        <span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold text-[10px] shrink-0">
          API QUERY
        </span>
        <span class="text-slate-300 truncate font-mono">
          "{activeComposedQuery}"
        </span>
      </div>
      <div class="text-[11px] text-slate-400 shrink-0 flex items-center gap-1.5">
        <Sparkles class="w-3 h-3 text-cyan-400" />
        <span>Scans Google Places & filters out established websites</span>
      </div>
    </div>

    <!-- Controls Row: Filter Toggle & Action Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
      <!-- Glowing No-Website Toggle -->
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          bind:checked={filterNoWebsite}
          class="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-pointer"
        />
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Show "No Website" & Directory-Only Businesses Exclusively
          </span>
          {#if filterNoWebsite}
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
              Active Radar Filter
            </span>
          {/if}
        </div>
      </label>

      <!-- Run Scan Button -->
      <div class="flex items-center gap-2.5">
        <Button
          variant="primary"
          onclick={() => handleExecutePlacesSearch(false)}
          loading={leadStore.isSearchingPlaces}
          class="gap-2 px-5 py-2 text-xs font-bold shadow-md shadow-cyan-900/20 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border-0"
        >
          <Search class="w-4 h-4" />
          <span>{leadStore.isSearchingPlaces ? 'Scanning Google Places...' : 'Scan Google Places'}</span>
        </Button>
      </div>
    </div>
  </Card>

  <!-- Live Scan Analytics Breakdown -->
  {#if leadStore.placesLastResponse}
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card class="p-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Scanned</div>
        <div class="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{leadStore.placesLastResponse.totalQueried}</div>
        <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Google Places verified listings</div>
      </Card>

      <Card class="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
        <div class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Zero Website Found</div>
        <div class="text-xl font-bold text-emerald-600 dark:text-emerald-300 mt-1 font-mono">{leadStore.placesLastResponse.noWebsiteCount}</div>
        <div class="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Prime turnkey prospects</div>
      </Card>

      <Card class="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
        <div class="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Directory / Social Stubs</div>
        <div class="text-xl font-bold text-amber-600 dark:text-amber-300 mt-1 font-mono">{leadStore.placesLastResponse.directoryOnlyCount}</div>
        <div class="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Yelp/Facebook placeholders</div>
      </Card>

      <Card class="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900/40">
        <div class="text-[11px] font-medium text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Est. Pipeline Value</div>
        <div class="text-xl font-bold text-cyan-600 dark:text-cyan-300 mt-1 font-mono">
          ${leadStore.placesLastResponse.potentialPipelineValue.toLocaleString()}
        </div>
        <div class="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 mt-0.5">2-Yr hosting & turnkey builds</div>
      </Card>
    </div>
  {/if}

  <!-- Results Section & Batch Toolbar -->
  {#if leadStore.placesSearchResults.length > 0}
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            {leadStore.placesSearchResults.length} Businesses Discovered
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">
            ({leadStore.placesLastResponse?.query})
          </span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- View Toggle -->
          <div class="flex items-center rounded-lg bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onclick={() => (viewMode = 'cards')}
              class="px-2.5 py-1 rounded-md transition-all cursor-pointer {viewMode === 'cards'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400'}"
            >
              Cards
            </button>
            <button
              type="button"
              onclick={() => (viewMode = 'table')}
              class="px-2.5 py-1 rounded-md transition-all cursor-pointer {viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400'}"
            >
              Table
            </button>
          </div>

          <!-- Batch Import Button -->
          <Button
            variant="outline"
            size="sm"
            onclick={handleImportAll}
            loading={isBatchImporting}
            class="text-xs font-bold gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Import All ({leadStore.placesSearchResults.length}) Leads</span>
          </Button>
        </div>
      </div>

      <!-- Card Grid View -->
      {#if viewMode === 'cards'}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each leadStore.placesSearchResults as place (place.id)}
            {@const isSaved = isSavedInPipeline(place.id, place.licenseNumber)}
            {@const displayPhone = place.phone || place.skipTraceData?.verifiedPhone || place.internationalPhone}
            <Card class="p-4.5 space-y-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <!-- Top Row: Business Name & Rating -->
              <div class="space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate" title={place.businessName}>
                      {place.businessName}
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {place.formattedAddress}
                    </p>
                  </div>
                  <IndustryBadge profession={place.profession} variant="icon-only" size="sm" />
                </div>

                <!-- Rating & Review Count -->
                <div class="flex items-center gap-2 text-xs flex-wrap">
                  {#if place.rating > 0}
                    <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono text-[11px]">
                      <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{place.rating.toFixed(1)}</span>
                    </div>
                  {/if}
                  <span class="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    {place.userRatingsTotal} Google Reviews
                  </span>
                  <span class="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px]">
                    ${place.estimatedDealValue.toLocaleString()} 2-Yr Value
                  </span>
                </div>
              </div>

              <!-- Middle: Contact Line & Website Status Badge -->
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/60 space-y-2 text-xs">
                <!-- Phone -->
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Phone:</span>
                  {#if displayPhone}
                    <div class="flex items-center gap-1.5">
                      <a
                        href="tel:{displayPhone}"
                        class="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {displayPhone}
                      </a>
                      <button
                        type="button"
                        onclick={() => copyToClipboard(displayPhone, 'Phone number')}
                        class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy Phone"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  {:else}
                    <span class="text-slate-400 italic">No direct phone</span>
                  {/if}
                </div>

                <!-- Website Status Badge -->
                <div class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/40">
                  <span class="text-slate-500 dark:text-slate-400">Website Status:</span>
                  {#if place.websiteStatus === 'missing'}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      <XCircle class="w-3 h-3" />
                      <span>Zero Website</span>
                    </span>
                  {:else if place.websiteStatus === 'directory_only'}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" title={place.website}>
                      <AlertTriangle class="w-3 h-3" />
                      <span>Directory Only</span>
                    </span>
                  {:else}
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-600 dark:text-cyan-400 hover:underline max-w-[140px] truncate"
                    >
                      <Globe class="w-3 h-3" />
                      <span class="truncate">{place.website}</span>
                    </a>
                  {/if}
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="pt-1 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div class="flex items-center gap-1.5">
                  {#if isSaved}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
                      <span>Saved</span>
                    </span>
                  {:else}
                    <Button
                      variant="outline"
                      size="sm"
                      onclick={() => handleImportSingle(place)}
                      class="text-xs gap-1 font-bold text-emerald-700 dark:text-emerald-300 border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Plus class="w-3 h-3" />
                      <span>Import</span>
                    </Button>
                  {/if}

                  <Button
                    variant="outline"
                    size="sm"
                    onclick={() => handleQuickPreview(place)}
                    class="text-xs gap-1 text-cyan-700 dark:text-cyan-300 border-cyan-800 hover:bg-cyan-950/40"
                    title="Generate Live Practice / Business Preview Demo"
                  >
                    <Eye class="w-3 h-3 text-cyan-500" />
                    <span>Demo</span>
                  </Button>
                </div>

                <div class="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => handleOpenPitch(place)}
                    class="text-xs gap-1 text-purple-600 dark:text-purple-400 hover:bg-purple-950/30"
                    title="Open Cold Call Pitch Script"
                  >
                    <PhoneCall class="w-3 h-3" />
                    <span>Pitch</span>
                  </Button>

                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View on Google Maps"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {:else}
        <!-- Data Table View -->
        <Card class="overflow-hidden border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th class="py-3 px-4">Business Name & Address</th>
                  <th class="py-3 px-4">Rating</th>
                  <th class="py-3 px-4">Verified Phone</th>
                  <th class="py-3 px-4">Website Footprint</th>
                  <th class="py-3 px-4">Est. Value</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
                {#each leadStore.placesSearchResults as place (place.id)}
                  {@const isSaved = isSavedInPipeline(place.id, place.licenseNumber)}
                  {@const tablePhone = place.phone || place.skipTraceData?.verifiedPhone || place.internationalPhone}
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td class="py-3 px-4 max-w-[220px]">
                      <div class="font-bold text-slate-900 dark:text-white truncate">{place.businessName}</div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{place.formattedAddress}</div>
                    </td>
                    <td class="py-3 px-4">
                      {#if place.rating > 0}
                        <div class="flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400">
                          <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{place.rating.toFixed(1)}</span>
                          <span class="text-[10px] text-slate-400">({place.userRatingsTotal})</span>
                        </div>
                      {:else}
                        <span class="text-slate-400 italic">No ratings</span>
                      {/if}
                    </td>
                    <td class="py-3 px-4 font-mono">
                      {#if tablePhone}
                        <a href="tel:{tablePhone}" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                          {tablePhone}
                        </a>
                      {:else}
                        <span class="text-slate-400 italic">No phone</span>
                      {/if}
                    </td>
                    <td class="py-3 px-4">
                      {#if place.websiteStatus === 'missing'}
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          Zero Website
                        </span>
                      {:else if place.websiteStatus === 'directory_only'}
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Directory Only
                        </span>
                      {:else}
                        <a href={place.website} target="_blank" rel="noreferrer" class="text-cyan-600 dark:text-cyan-400 hover:underline max-w-[130px] truncate block">
                          {place.website}
                        </a>
                      {/if}
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${place.estimatedDealValue.toLocaleString()}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        {#if isSaved}
                          <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Saved</span>
                        {:else}
                          <Button variant="outline" size="sm" onclick={() => handleImportSingle(place)} class="text-xs px-2 py-0.5">
                            Import
                          </Button>
                        {/if}
                        <Button variant="outline" size="sm" onclick={() => handleQuickPreview(place)} class="text-xs px-2 py-0.5 text-cyan-600 dark:text-cyan-400 border-cyan-800">
                          Demo
                        </Button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </Card>
      {/if}

      <!-- Next Page Pagination Load -->
      {#if leadStore.placesLastResponse?.nextPageToken}
        <div class="text-center pt-4">
          <Button
            variant="outline"
            onclick={() => handleExecutePlacesSearch(true)}
            loading={leadStore.isSearchingPlaces}
            class="text-xs font-bold gap-2 px-6 text-cyan-700 dark:text-cyan-300 border-cyan-800 hover:bg-cyan-950/30"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Load Next Page of Results from Google Places</span>
          </Button>
        </div>
      {/if}
    </div>
  {:else if !leadStore.isSearchingPlaces}
    <!-- Empty State -->
    <Card class="p-12 text-center space-y-4 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
      <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
        <Compass class="w-6 h-6" />
      </div>
      <div class="space-y-1 max-w-md mx-auto">
        <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">Ready to Scan Google Places Radar</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Select an industry preset or enter a trade and city above, then click "Scan Google Places" to discover local businesses with missing websites.
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onclick={() => handleExecutePlacesSearch(false)}
        class="text-xs gap-1.5 font-bold shadow-sm"
      >
        <Search class="w-3.5 h-3.5" />
        <span>Scan "{activeComposedQuery}"</span>
      </Button>
    </Card>
  {/if}
</div>
