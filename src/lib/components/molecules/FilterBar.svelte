<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { PROFESSION_CONFIGS, OUTREACH_STAGES, type ProfessionCategory } from '../../types/lead';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import Button from '../atoms/Button.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import IndustryIcon from '../atoms/IndustryIcon.svelte';
  import { Search, Sparkles, Filter, RefreshCw, X, Layers } from 'lucide-svelte';

  import { STATE_DROPDOWN_OPTIONS } from '../../types/states';

  let isSearchingRegistry = $state(false);

  const professionOptions = [
    { value: 'all', label: 'All Industries (13 High-Value Sectors)' },
    ...Object.values(PROFESSION_CONFIGS).map((p) => ({
      value: p.id,
      label: p.label,
    })),
  ];

  const stateOptions = STATE_DROPDOWN_OPTIONS;

  const outreachOptions = [
    { value: 'all', label: 'All Pipeline Stages' },
    ...OUTREACH_STAGES.map((s) => ({ value: s, label: s })),
  ];

  const dateWindowOptions = [
    { value: 'all', label: 'All Dates (Any License Age)' },
    { value: '30', label: 'Past 30 Days (Ultra-Fresh)' },
    { value: '60', label: 'Past 60 Days' },
    { value: '90', label: 'Past 90 Days (Quarterly)' },
    { value: '180', label: 'Past 6 Months' },
    { value: '365', label: 'Past 1 Year' },
  ];

  const industryList: Array<{ id: ProfessionCategory | 'all'; label: string; shortLabel: string }> = [
    { id: 'all', label: 'All Industries (13 High-Value Sectors)', shortLabel: 'All Industries' },
    ...Object.values(PROFESSION_CONFIGS).map((p) => ({
      id: p.id,
      label: p.label,
      shortLabel: p.label.split('&')[0].trim(),
    })),
  ];

  const leadCountsByProfession = $derived.by(() => {
    const counts: Record<string, number> = { all: leadStore.leads.length };
    for (const lead of leadStore.leads) {
      counts[lead.profession] = (counts[lead.profession] || 0) + 1;
    }
    return counts;
  });

  async function handleQueryLiveRegistry() {
    isSearchingRegistry = true;
    try {
      const targetProf = leadStore.professionFilter !== 'all' ? leadStore.professionFilter : undefined;
      const targetState = leadStore.stateFilter !== 'all' ? leadStore.stateFilter : undefined;
      await leadStore.fetchLiveOpenRegistryData(targetProf, targetState, undefined, leadStore.dateWindowFilter);
    } finally {
      isSearchingRegistry = false;
    }
  }

  function clearSearch() {
    leadStore.searchFilter = '';
  }

  function handleSelectIndustry(profId: ProfessionCategory | 'all') {
    leadStore.professionFilter = profId;
  }
</script>

<div class="bg-white dark:bg-slate-900/80 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm dark:shadow-md dark:shadow-black/40 border border-slate-200 dark:border-slate-800/80">
  <!-- Search and Dropdowns Bar -->
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
    <!-- Search Bar -->
    <div class="relative flex-grow min-w-[240px]">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
        <Search class="w-4 h-4" />
      </div>
      <Input
        bind:value={leadStore.searchFilter}
        placeholder="Search practitioner by name, license #, city, phone..."
        class="pl-9 pr-8"
      />
      {#if leadStore.searchFilter}
        <button
          type="button"
          onclick={clearSearch}
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      {/if}
    </div>

    <!-- Profession Dropdown with Active Icon -->
    <div class="w-full lg:w-60 flex-shrink-0 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <IndustryIcon profession={leadStore.professionFilter} class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <Select
        bind:value={leadStore.professionFilter}
        options={professionOptions}
        class="pl-9"
      />
    </div>

    <!-- State Dropdown -->
    <div class="w-full lg:w-36 flex-shrink-0">
      <Select
        bind:value={leadStore.stateFilter}
        options={stateOptions}
      />
    </div>

    <!-- Date Window Dropdown -->
    <div class="w-full lg:w-44 flex-shrink-0">
      <Select
        bind:value={leadStore.dateWindowFilter}
        options={dateWindowOptions}
      />
    </div>

    <!-- Outreach Dropdown -->
    <div class="w-full lg:w-44 flex-shrink-0">
      <Select
        bind:value={leadStore.outreachFilter}
        options={outreachOptions}
      />
    </div>

    <!-- Quick Query Live Registry -->
    <Button
      variant="primary"
      size="md"
      onclick={handleQueryLiveRegistry}
      loading={isSearchingRegistry || leadStore.isSearchingRegistry}
      class="flex-shrink-0 whitespace-nowrap gap-1.5 font-semibold"
    >
      <Sparkles class="w-4 h-4 text-emerald-300" />
      <span>{isSearchingRegistry || leadStore.isSearchingRegistry ? 'Querying...' : 'Query Registry'}</span>
    </Button>
  </div>

  <!-- 13 Supported Industries Quick-Filter Strip -->
  <div class="pt-2 border-t border-slate-100 dark:border-slate-800/60">
    <div class="flex items-center gap-2 mb-2">
      <div class="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        <Filter class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>13 High-Value Sectors</span>
      </div>
      <span class="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Click sector chip to filter leads</span>
    </div>

    <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 -mx-1 px-1">
      {#each industryList as industry (industry.id)}
        <IndustryBadge
          profession={industry.id}
          variant="chip"
          size="sm"
          active={leadStore.professionFilter === industry.id}
          count={leadCountsByProfession[industry.id] || 0}
          useShortLabel={true}
          onclick={() => handleSelectIndustry(industry.id)}
        />
      {/each}
    </div>
  </div>
</div>

