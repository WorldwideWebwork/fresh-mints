<script lang="ts">
  import { type Lead, type OutreachStatus, OUTREACH_STAGES, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { CRMExportService } from '../../services/crm-export-service';
  import Card from '../atoms/Card.svelte';
  import Button from '../atoms/Button.svelte';
  import Tooltip from '../atoms/Tooltip.svelte';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import ContactBadgeList from './ContactBadgeList.svelte';
  import {
    Search,
    Globe,
    PhoneCall,
    UserPlus,
    UserCheck,
    Send,
    MapPin,
    Building,
    Award,
    ChevronRight,
    ChevronLeft,
    Flame,
    Phone,
    MoveRight,
  } from 'lucide-svelte';

  interface Props {
    lead: Lead;
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { lead, onopenmodal }: Props = $props();

  const profMeta = $derived(PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate);

  let isSyncingCrm = $state(false);

  const stageIndex = $derived(OUTREACH_STAGES.indexOf(lead.outreachStatus));
  const canAdvance = $derived(stageIndex >= 0 && stageIndex < OUTREACH_STAGES.length - 2); // Exclude Declined & Won from forward arrow if at end
  const canRegress = $derived(stageIndex > 0);
  const nextStage = $derived(canAdvance ? OUTREACH_STAGES[stageIndex + 1] : null);
  const prevStage = $derived(canRegress ? OUTREACH_STAGES[stageIndex - 1] : null);

  function handleOpenCrm(e: MouseEvent) {
    e.stopPropagation();
    CRMExportService.openQuestbookRecord(lead.crmContactId);
  }

  async function handleQuickCrmSync(e: MouseEvent) {
    e.stopPropagation();
    isSyncingCrm = true;
    try {
      const res = await leadStore.syncLeadToCRM(lead.id);
      if (res.success) {
        toast.success('Synced to Questbook CRM', res.message);
      } else {
        toast.error('Sync Failed', res.message);
      }
    } finally {
      isSyncingCrm = false;
    }
  }

  function handleAdvanceStage(e: MouseEvent) {
    e.stopPropagation();
    if (!nextStage) return;
    leadStore.updateLead(lead.id, { outreachStatus: nextStage });
    toast.success(`Advanced ${lead.fullName}`, `Moved to stage: ${nextStage}`);
  }

  function handleRegressStage(e: MouseEvent) {
    e.stopPropagation();
    if (!prevStage) return;
    leadStore.updateLead(lead.id, { outreachStatus: prevStage });
    toast.info(`Moved ${lead.fullName}`, `Returned to stage: ${prevStage}`);
  }

  function handleOpenRepHub(e: MouseEvent) {
    e.stopPropagation();
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('rephub');
    toast.info('Loaded in Rep Hub', `${lead.fullName} ready for live dial`);
  }

  function handleStageSelect(e: Event) {
    e.stopPropagation();
    const select = e.target as HTMLSelectElement;
    const newStage = select.value as OutreachStatus;
    if (newStage && newStage !== lead.outreachStatus) {
      leadStore.updateLead(lead.id, { outreachStatus: newStage });
      if (newStage === 'Client Won') {
        toast.success('🏆 Deal Closed Won!', `$300.00 cash bounty locked for ${lead.fullName}`);
      } else {
        toast.success(`Stage Updated`, `${lead.fullName} is now in ${newStage}`);
      }
    }
  }
</script>

<Card class="flex flex-col justify-between h-full hover:border-teal-500/50 dark:hover:border-teal-500/40 transition-all duration-150 group shadow-xs hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
  <div>
    <!-- Header: Industry Badge, Name & Status -->
    <div
      class="flex items-start justify-between gap-2 mb-2 cursor-pointer"
      onclick={() => onopenmodal?.('lead_detail', lead)}
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-1.5">
          <IndustryBadge profession={lead.profession} variant="badge" size="sm" />
        </div>
        <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
          {lead.fullName}
        </h4>
        <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          {lead.professionTitle}
        </div>
      </div>
      <StatusIndicator status={lead.outreachStatus} />
    </div>

    <!-- Quick Stage Navigator Control Bar -->
    <div class="flex items-center justify-between gap-1.5 py-1.5 px-2 mb-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800/80 text-[11px]">
      <button
        type="button"
        disabled={!canRegress}
        onclick={handleRegressStage}
        title={prevStage ? `Move back to ${prevStage}` : 'At initial stage'}
        class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
      </button>

      <div class="flex-1 px-1">
        <select
          value={lead.outreachStatus}
          onchange={handleStageSelect}
          onclick={(e) => e.stopPropagation()}
          class="w-full bg-transparent text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer border-none py-0.5"
        >
          {#each OUTREACH_STAGES as stage}
            <option value={stage} class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {stage}
            </option>
          {/each}
        </select>
      </div>

      <button
        type="button"
        disabled={!canAdvance}
        onclick={handleAdvanceStage}
        title={nextStage ? `Advance to ${nextStage}` : 'At final stage'}
        class="p-1 rounded text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Location & School -->
    <div class="space-y-1 my-2.5 text-xs text-slate-600 dark:text-slate-300">
      <div class="flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span class="truncate">{lead.city}, {lead.state}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <Building class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span class="truncate">{lead.collegeOrSchool}</span>
      </div>
      <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
        <Award class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>Lic #{lead.licenseNumber}</span>
      </div>
    </div>

    <!-- Contacts -->
    <div class="my-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      <ContactBadgeList data={lead.skipTraceData} />
    </div>
  </div>

  <!-- Footer: Deal Value, Bounty & Quick Actions -->
  <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
    <div>
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          ${(lead.estimatedDealValue || 0).toLocaleString()}
        </span>
        <span class="text-[10px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded font-semibold font-mono">
          $300 Bounty
        </span>
      </div>
      <div class="text-[10px] text-slate-400">2-Yr w4 Cloud</div>
    </div>

    <div class="flex items-center gap-0.5">
      <!-- 0. Dial in Rep Hub -->
      <Tooltip text="Start Live Dial in Rep Hub" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={handleOpenRepHub}
          class="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
        >
          <PhoneCall class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Audit Website" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_audit', lead)}
          class="p-1.5 text-slate-400 hover:text-emerald-500"
        >
          <Search class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Live Site Preview" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_builder', lead)}
          class="p-1.5 text-slate-400 hover:text-teal-500"
        >
          <Globe class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Call Script & Pitch" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('call_script', lead)}
          class="p-1.5 text-slate-400 hover:text-purple-500"
        >
          <PhoneCall class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Generate AI Outreach" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('outreach_generator', lead)}
          class="p-1.5 text-slate-400 hover:text-amber-500"
        >
          <Send class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      {#if lead.crmContactId}
        <Tooltip text="View in Questbook CRM (#{lead.crmContactId})" position="top">
          <Button
            variant="outline"
            size="sm"
            onclick={handleOpenCrm}
            class="p-1 text-teal-400 border-teal-800/80 bg-teal-950/40 hover:bg-teal-900/50"
          >
            <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
          </Button>
        </Tooltip>
      {:else}
        <Tooltip text="Sync to Questbook CRM" position="top">
          <Button
            variant="outline"
            size="sm"
            onclick={handleQuickCrmSync}
            loading={isSyncingCrm}
            class="p-1 text-emerald-500 border-emerald-800/70 hover:bg-emerald-950/40"
          >
            <UserPlus class="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
      {/if}
    </div>
  </div>
</Card>
