<script lang="ts">
  import { type Lead, OUTREACH_STAGES, type OutreachStatus } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import LeadCard from '../molecules/LeadCard.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Flame, DollarSign, ArrowRight } from 'lucide-svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  let dragOverStage = $state<OutreachStatus | null>(null);

  function getLeadsByStage(stage: OutreachStatus): Lead[] {
    return leadStore.filteredLeads.filter((l) => l.outreachStatus === stage);
  }

  function getStageDealTotal(stage: OutreachStatus): number {
    return getLeadsByStage(stage).reduce((sum, l) => sum + (l.estimatedDealValue || 1650), 0);
  }

  function handleDrop(e: DragEvent, targetStage: OutreachStatus) {
    e.preventDefault();
    dragOverStage = null;
    const leadId = e.dataTransfer?.getData('text/plain');
    if (!leadId) return;

    leadStore.updateLead(leadId, { outreachStatus: targetStage });
    toast.success(`Pipeline Updated`, `Moved lead to ${targetStage}`);
  }

  function handleDragOver(e: DragEvent, stage: OutreachStatus) {
    e.preventDefault();
    dragOverStage = stage;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragOverStage = null;
  }

  function handleDragStart(e: DragEvent, leadId: string) {
    e.dataTransfer?.setData('text/plain', leadId);
  }
</script>

<div class="overflow-x-auto pb-4 custom-scrollbar">
  <div class="flex items-start gap-4 min-w-[1400px]">
    {#each OUTREACH_STAGES as stage}
      {@const stageLeads = getLeadsByStage(stage)}
      {@const stageValue = getStageDealTotal(stage)}
      {@const bountyTotal = stageLeads.length * 300}
      {@const isDragOver = dragOverStage === stage}

      <!-- Kanban Column -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex-1 min-w-[290px] rounded-2xl p-3.5 border transition-all flex flex-col max-h-[calc(100vh-250px)] {isDragOver ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-950/30 ring-2 ring-teal-500/40' : 'bg-slate-50/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'}"
        ondrop={(e) => handleDrop(e, stage)}
        ondragover={(e) => handleDragOver(e, stage)}
        ondragleave={handleDragLeave}
      >
        <!-- Column Header -->
        <div class="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0 space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
              <Badge variant={stage === 'Client Won' ? 'success' : 'default'} class="text-[10px] font-mono">
                {stageLeads.length}
              </Badge>
            </div>

            {#if stage === 'Client Won'}
              <Badge variant="success" class="text-[10px] font-semibold">
                ${bountyTotal.toLocaleString()} Bounties Won
              </Badge>
            {:else if stageLeads.length > 0}
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ${stageValue.toLocaleString()}
              </span>
            {/if}
          </div>

          <!-- Secondary Stage Stats -->
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span>2-Yr Packages</span>
            {#if stage !== 'Client Won' && stageLeads.length > 0}
              <span class="text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                <Flame class="w-3 h-3 text-amber-500" />
                ${bountyTotal.toLocaleString()} bounty pool
              </span>
            {/if}
          </div>
        </div>

        <!-- Cards List -->
        <div class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-[180px]">
          {#each stageLeads as lead (lead.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              draggable="true"
              ondragstart={(e) => handleDragStart(e, lead.id)}
              class="cursor-grab active:cursor-grabbing"
            >
              <LeadCard {lead} {onopenmodal} />
            </div>
          {:else}
            <div class="h-32 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-3 space-y-1">
              <span class="text-xs text-slate-400 dark:text-slate-500 italic">No leads in {stage}</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-600">Drag cards or use card arrow controls</span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
