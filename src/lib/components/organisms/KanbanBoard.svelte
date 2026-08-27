<script lang="ts">
  import { type Lead, OUTREACH_STAGES, type OutreachStatus } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import LeadCard from '../molecules/LeadCard.svelte';
  import Badge from '../atoms/Badge.svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  function getLeadsByStage(stage: OutreachStatus): Lead[] {
    return leadStore.filteredLeads.filter((l) => l.outreachStatus === stage);
  }

  function handleDrop(e: DragEvent, targetStage: OutreachStatus) {
    e.preventDefault();
    const leadId = e.dataTransfer?.getData('text/plain');
    if (!leadId) return;

    leadStore.updateLead(leadId, { outreachStatus: targetStage });
    toast.success(`Moved lead to ${targetStage}`);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDragStart(e: DragEvent, leadId: string) {
    e.dataTransfer?.setData('text/plain', leadId);
  }
</script>

<div class="overflow-x-auto pb-4 custom-scrollbar">
  <div class="flex items-start gap-4 min-w-[1200px]">
    {#each OUTREACH_STAGES as stage}
      {@const stageLeads = getLeadsByStage(stage)}
      <!-- Kanban Column -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex-1 min-w-[280px] rounded-2xl glass-panel p-3.5 border border-slate-200 dark:border-slate-800/80 flex flex-col max-h-[calc(100vh-280px)]"
        ondrop={(e) => handleDrop(e, stage)}
        ondragover={handleDragOver}
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
            <Badge variant="default" class="text-[10px] font-mono">{stageLeads.length}</Badge>
          </div>

          {#if stage === 'Client Won'}
            <Badge variant="success" class="text-[10px]">Closed Won</Badge>
          {/if}
        </div>

        <!-- Cards List -->
        <div class="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-[160px]">
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
            <div class="h-28 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-center p-3">
              <span class="text-xs text-slate-400 dark:text-slate-500 italic">Drop leads here</span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
