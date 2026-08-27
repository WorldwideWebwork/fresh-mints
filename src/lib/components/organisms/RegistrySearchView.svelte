<script lang="ts">
  import { type ProfessionCategory, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Button from '../atoms/Button.svelte';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Select from '../atoms/Select.svelte';
  import Input from '../atoms/Input.svelte';
  import IndustryIcon from '../atoms/IndustryIcon.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import { Sparkles, Database, Search, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-svelte';
  import { US_STATES } from '../../types/states';

  let selectedProfession = $state<ProfessionCategory>('real_estate');
  let selectedState = $state('CA');
  let searchLimit = $state(25);
  let isSearching = $state(false);
  let searchResultInfo = $state<{ totalFound: number; source: string; groundingNotes: string } | null>(null);

  const professionOptions = Object.values(PROFESSION_CONFIGS).map((p) => ({
    value: p.id,
    label: p.label,
  }));

  const stateOptions = US_STATES.map((s) => ({ value: s.code, label: s.fullName }));

  const industryList = Object.values(PROFESSION_CONFIGS).map((p) => ({
    id: p.id,
    label: p.label,
    shortLabel: p.label.split('&')[0].trim(),
    avgValue: p.averageWebsiteValue
  }));

  async function handleExecuteSearch() {
    isSearching = true;
    try {
      const res = await leadStore.fetchLiveOpenRegistryData(selectedProfession, selectedState, searchLimit);
      searchResultInfo = res;
    } finally {
      isSearching = false;
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Intro Card -->
  <Card class="p-6 bg-gradient-to-r from-emerald-50 dark:from-emerald-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border-slate-200 dark:border-emerald-800/30">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2 max-w-2xl">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Database class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Federal NPPES NPI Registry & State Open Data Engine</span>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Discover Newly Licensed Professionals in Real Time
        </h2>
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Query authoritative open government licensing registries to discover newly board-passed doctors, nurses, real estate brokers, contractors, and fiduciaries before anyone else.
        </p>
      </div>

      <div class="flex-shrink-0">
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{leadStore.leads.length}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Leads in Working Pipeline</div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Query Configuration Form with 13 Sector Visual Selector -->
  <Card class="p-6 space-y-5">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
        <Search class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Target Sector & Jurisdiction Parameters</span>
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 dark:text-slate-400">Selected Sector:</span>
        <IndustryBadge profession={selectedProfession} variant="badge" size="sm" />
      </div>
    </div>

    <!-- Visual 13 Supported Industries Selector Grid -->
    <div class="space-y-2">
      <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
        Choose from 13 High-Value Supported Sectors:
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {#each industryList as ind (ind.id)}
          <button
            type="button"
            onclick={() => (selectedProfession = ind.id)}
            class="flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none {selectedProfession === ind.id
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'}"
          >
            <IndustryBadge profession={ind.id} variant="icon-only" size="sm" class="mb-1.5" />
            <span class="text-[11px] font-bold leading-tight truncate w-full">{ind.shortLabel}</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">${ind.avgValue}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
      <div>
        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Target Sector Dropdown:</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IndustryIcon profession={selectedProfession} class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <Select bind:value={selectedProfession} options={professionOptions} class="text-xs pl-9" />
        </div>
      </div>

      <div>
        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Target State / Board:</label>
        <Select bind:value={selectedState} options={stateOptions} class="text-xs" />
      </div>

      <div>
        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Batch Retrieval Limit:</label>
        <Select
          bind:value={searchLimit as any}
          options={[
            { value: '10', label: '10 Leads' },
            { value: '25', label: '25 Leads' },
            { value: '50', label: '50 Leads' },
            { value: '100', label: '100 Leads' },
          ]}
          class="text-xs"
        />
      </div>
    </div>

    <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
      <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Live verification with Google Search Grounding and direct CMS registry feeds.</span>
      </div>

      <Button
        variant="primary"
        size="md"
        onclick={handleExecuteSearch}
        loading={isSearching}
        class="gap-2 font-bold px-6"
      >
        <Sparkles class="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
        <span>Run Live Registry Query</span>
      </Button>
    </div>
  </Card>

  <!-- Query In Progress Indicator -->
  {#if isSearching}
    <Card class="p-5 bg-slate-50 dark:bg-slate-950/80 border-emerald-800/40 flex items-center gap-4 animate-pulse">
      <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
        <Database class="w-5 h-5" />
      </div>
      <div class="flex-grow space-y-1">
        <div class="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Connecting to Official State & Federal Registry Feeds...
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Retrieving verified board pass records and practitioner credentials for {selectedProfession} in {selectedState}.
        </p>
      </div>
    </Card>
  {/if}

  <!-- Query Feedback Info -->
  {#if searchResultInfo && !isSearching}
    <Card class="p-5 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-800/50 flex items-start gap-4">
      <div class="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
        <CheckCircle2 class="w-5 h-5" />
      </div>
      <div class="flex-grow space-y-1">
        <div class="text-sm font-bold text-emerald-700 dark:text-emerald-200">
          Discovered {searchResultInfo.totalFound} new leads from {searchResultInfo.source}
        </div>
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
          {searchResultInfo.groundingNotes}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onclick={() => leadStore.setActiveTab('leads')}
        class="gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-800 flex-shrink-0"
      >
        <span>View in Table</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </Button>
    </Card>
  {/if}
</div>
