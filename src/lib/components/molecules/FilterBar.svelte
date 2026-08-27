<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { PROFESSION_CONFIGS, OUTREACH_STAGES } from '../../types/lead';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import Button from '../atoms/Button.svelte';
  import { Search, Sparkles, Filter, RefreshCw, X } from 'lucide-svelte';

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

  async function handleQueryLiveRegistry() {
    isSearchingRegistry = true;
    try {
      const targetProf = leadStore.professionFilter !== 'all' ? leadStore.professionFilter : undefined;
      const targetState = leadStore.stateFilter !== 'all' ? leadStore.stateFilter : undefined;
      await leadStore.fetchLiveOpenRegistryData(targetProf, targetState);
    } finally {
      isSearchingRegistry = false;
    }
  }

  function clearSearch() {
    leadStore.searchFilter = '';
  }
</script>

<div class="bg-white dark:bg-slate-900/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm dark:shadow-md dark:shadow-black/40 border border-slate-200 dark:border-slate-800/80">
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

    <!-- Profession Dropdown -->
    <div class="w-full lg:w-64 flex-shrink-0">
      <Select
        bind:value={leadStore.professionFilter}
        options={professionOptions}
      />
    </div>

    <!-- State Dropdown -->
    <div class="w-full lg:w-44 flex-shrink-0">
      <Select
        bind:value={leadStore.stateFilter}
        options={stateOptions}
      />
    </div>

    <!-- Outreach Dropdown -->
    <div class="w-full lg:w-48 flex-shrink-0">
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
</div>
