<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { CRMExportService } from '../../services/crm-export-service';
  import Card from '../atoms/Card.svelte';
  import Button from '../atoms/Button.svelte';
  import Tooltip from '../atoms/Tooltip.svelte';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import ContactBadgeList from './ContactBadgeList.svelte';
  import { Search, Globe, PhoneCall, UserPlus, UserCheck, Send, MapPin, Building, Award } from 'lucide-svelte';

  interface Props {
    lead: Lead;
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { lead, onopenmodal }: Props = $props();

  const profMeta = $derived(PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate);

  let isSyncingCrm = $state(false);

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
</script>

<Card class="flex flex-col justify-between h-full hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-150 group">
  <div>
    <!-- Header: Name & Status -->
    <div
      class="flex items-start justify-between gap-2 mb-2.5 cursor-pointer"
      onclick={() => onopenmodal?.('lead_detail', lead)}
    >
      <div>
        <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {lead.fullName}
        </h4>
        <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          {lead.professionTitle}
        </div>
      </div>
      <StatusIndicator status={lead.outreachStatus} />
    </div>

    <!-- Location & School -->
    <div class="space-y-1 my-3 text-xs text-slate-600 dark:text-slate-300">
      <div class="flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 flex-shrink-0" />
        <span class="truncate">{lead.city}, {lead.state}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <Building class="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 flex-shrink-0" />
        <span class="truncate">{lead.collegeOrSchool}</span>
      </div>
      <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 dark:text-slate-400">
        <Award class="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 flex-shrink-0" />
        <span>Lic: {lead.licenseNumber} ({lead.issueDate})</span>
      </div>
    </div>

    <!-- Contacts -->
    <div class="my-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
      <ContactBadgeList data={lead.skipTraceData} />
    </div>
  </div>

  <!-- Footer: Value & Actions -->
  <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
    <div>
      <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">${(lead.estimatedDealValue || 0).toLocaleString()}</div>
      <div class="text-[10px] text-slate-400 dark:text-slate-400">2-Yr Package</div>
    </div>

    <div class="flex items-center gap-1">
      <Tooltip text="Audit Website Presence" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_audit', lead)}
          class="p-1.5 text-slate-400 dark:text-slate-400 hover:text-emerald-400"
        >
          <Search class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="View Turnkey Site Preview" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_builder', lead)}
          class="p-1.5 text-slate-400 dark:text-slate-400 hover:text-cyan-400"
        >
          <Globe class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Call Script & Pitch" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('call_script', lead)}
          class="p-1.5 text-slate-400 dark:text-slate-400 hover:text-purple-400"
        >
          <PhoneCall class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip text="Generate AI Outreach Pitch" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('outreach_generator', lead)}
          class="p-1.5 text-slate-400 dark:text-slate-400 hover:text-amber-400"
        >
          <Send class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      {#if lead.crmContactId}
        <Tooltip text="Synced to Questbook CRM (ID: #{lead.crmContactId}) - Click to View" position="top">
          <Button
            variant="outline"
            size="sm"
            onclick={handleOpenCrm}
            class="p-1.5 text-cyan-400 border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/50"
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
            class="p-1.5 text-emerald-400 border-emerald-800/70 hover:bg-emerald-950/40"
          >
            <UserPlus class="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
      {/if}
    </div>
  </div>
</Card>
