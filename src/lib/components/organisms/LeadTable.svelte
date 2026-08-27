<script lang="ts">
  import type { Lead } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import LeadRow from '../molecules/LeadRow.svelte';
  import Button from '../atoms/Button.svelte';
  import { Download, UserPlus, Sparkles, RefreshCw, Layers, Users } from 'lucide-svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  let isSyncingAll = $state(false);

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

<div class="space-y-4">
  <!-- Table Actions Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Users class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      <span class="font-medium">
        Showing <strong class="text-slate-900 dark:text-slate-100">{leadStore.filteredLeads.length}</strong> of {leadStore.leads.length} total practitioner leads
      </span>
    </div>

    <div class="flex items-center gap-2">
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
          {#each leadStore.filteredLeads as lead (lead.id)}
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
  </div>
</div>
