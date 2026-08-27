<script lang="ts">
  import type { Lead } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import LeadRow from '../molecules/LeadRow.svelte';
  import Button from '../atoms/Button.svelte';
  import {
    Download,
    UserPlus,
    Sparkles,
    RefreshCw,
    Layers,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from 'lucide-svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  let isSyncingAll = $state(false);
  let currentPage = $state(1);
  let pageSize = $state(25);
  let tableRef: HTMLDivElement | null = $state(null);

  const totalLeads = $derived(leadStore.filteredLeads.length);
  const totalPages = $derived(Math.max(1, Math.ceil(totalLeads / pageSize)));

  // Ensure currentPage stays within valid range when filters or page size change
  $effect(() => {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    } else if (currentPage < 1) {
      currentPage = 1;
    }
  });

  const startIndex = $derived(totalLeads === 0 ? 0 : (currentPage - 1) * pageSize);
  const endIndex = $derived(Math.min(startIndex + pageSize, totalLeads));
  const paginatedLeads = $derived(leadStore.filteredLeads.slice(startIndex, endIndex));

  const visiblePageNumbers = $derived.by<(number | string)[]>(() => {
    const total = totalPages;
    const current = currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    tableRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handlePageSizeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    pageSize = parseInt(select.value, 10) || 25;
    currentPage = 1;
  }

  async function handleSyncAll() {
    isSyncingAll = true;
    try {
      const result = await leadStore.syncAllFilteredToCRM();
      toast.success(`CRM Sync Complete`, `Synced ${result.synced} leads to Questbook CRM`);
    } finally {
      isSyncingAll = false;
    }
  }
</script>

<div class="space-y-4" bind:this={tableRef}>
  <!-- Table Actions Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Users class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      <span class="font-medium">
        {#if totalLeads > 0}
          Showing <strong class="text-slate-900 dark:text-slate-100">{startIndex + 1}&ndash;{endIndex}</strong> of <strong class="text-slate-900 dark:text-slate-100">{totalLeads}</strong> filtered leads ({leadStore.leads.length} total)
        {:else}
          Showing <strong class="text-slate-900 dark:text-slate-100">0</strong> leads
        {/if}
      </span>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onclick={() => leadStore.exportFilteredToCSV()}
        class="gap-1.5 text-xs"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Export CSV</span>
      </Button>

      <Button
        variant="primary"
        size="sm"
        onclick={handleSyncAll}
        loading={isSyncingAll}
        class="gap-1.5 text-xs font-semibold"
      >
        <UserPlus class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
        <span>Sync All to Questbook</span>
      </Button>
    </div>
  </div>

  <!-- Table Container -->
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden glass-panel shadow-xl shadow-slate-200/50 dark:shadow-black/50">
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-950/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th class="py-3.5 px-4">Practitioner & Specialty</th>
            <th class="py-3.5 px-4">Location / Board</th>
            <th class="py-3.5 px-4">License Record</th>
            <th class="py-3.5 px-4">Skip-Trace Verification</th>
            <th class="py-3.5 px-4">Outreach Stage</th>
            <th class="py-3.5 px-4">2-Yr Deal Value</th>
            <th class="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/40">
          {#each paginatedLeads as lead (lead.id)}
            <LeadRow
              {lead}
              isSelected={leadStore.selectedLeadId === lead.id}
              onselect={() => leadStore.setSelectedLeadId(lead.id)}
              {onopenmodal}
            />
          {:else}
            <tr>
              <td colspan="7" class="text-center py-16 px-4">
                <div class="max-w-md mx-auto space-y-3">
                  <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                    <Layers class="w-6 h-6" />
                  </div>
                  <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">No matching practitioner leads found</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Query the live federal & state registry or adjust your filter parameters above to discover newly licensed professionals.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={leadStore.isSearchingRegistry}
                    onclick={() => leadStore.fetchLiveOpenRegistryData()}
                    class="gap-1.5 text-xs mt-2"
                  >
                    <Sparkles class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                    <span>{leadStore.isSearchingRegistry ? 'Querying...' : 'Run Live Discovery Query'}</span>
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Table Pagination Footer Bar -->
    {#if totalLeads > 0}
      <div class="p-3.5 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <!-- Rows Per Page Selector -->
        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onchange={handlePageSizeChange}
            class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span class="text-slate-400 dark:text-slate-600 hidden sm:inline">&bull;</span>
          <span class="hidden sm:inline font-mono">
            {startIndex + 1}&ndash;{endIndex} of {totalLeads}
          </span>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-1">
          <!-- First Page -->
          <button
            type="button"
            disabled={currentPage === 1}
            onclick={() => goToPage(1)}
            class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="First Page"
          >
            <ChevronsLeft class="w-4 h-4" />
          </button>

          <!-- Prev Page -->
          <button
            type="button"
            disabled={currentPage === 1}
            onclick={() => goToPage(currentPage - 1)}
            class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <!-- Numbered Page Pills -->
          <div class="flex items-center gap-1 mx-1">
            {#each visiblePageNumbers as p}
              {#if typeof p === 'number'}
                <button
                  type="button"
                  onclick={() => goToPage(p)}
                  class="min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {currentPage === p
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                >
                  {p}
                </button>
              {:else}
                <span class="px-1 text-slate-400">...</span>
              {/if}
            {/each}
          </div>

          <!-- Next Page -->
          <button
            type="button"
            disabled={currentPage === totalPages}
            onclick={() => goToPage(currentPage + 1)}
            class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight class="w-4 h-4" />
          </button>

          <!-- Last Page -->
          <button
            type="button"
            disabled={currentPage === totalPages}
            onclick={() => goToPage(totalPages)}
            class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Last Page"
          >
            <ChevronsRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
