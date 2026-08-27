<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { CRMExportService } from '../../services/crm-export-service';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import ContactBadgeList from './ContactBadgeList.svelte';
  import Button from '../atoms/Button.svelte';
  import Tooltip from '../atoms/Tooltip.svelte';
  import { Search, Globe, PhoneCall, UserPlus, UserCheck, Send } from 'lucide-svelte';

  interface Props {
    lead: Lead;
    isSelected?: boolean;
    onselect?: () => void;
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { lead, isSelected = false, onselect, onopenmodal }: Props = $props();

  const profMeta = $derived(PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate);

  let isSyncingCrm = $state(false);

  function handleRowClick() {
    onselect?.();
    onopenmodal?.('lead_detail', lead);
  }

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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<tr
  class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer {isSelected ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''}"
  onclick={handleRowClick}
>
  <!-- Practitioner Name & Specialty with Industry Visual Indicator -->
  <td class="py-3.5 px-4 min-w-[240px]">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="font-semibold text-slate-900 dark:text-slate-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
        {lead.fullName}
      </span>
      <IndustryBadge profession={lead.profession} variant="badge" size="sm" />
    </div>
    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[260px]">
      {lead.professionTitle}
    </div>
  </td>

  <!-- Location & School -->
  <td class="py-3.5 px-4 min-w-[170px]">
    <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{lead.city}, {lead.state}</div>
    <div class="text-[11px] text-slate-400 dark:text-slate-400 truncate max-w-[180px] mt-0.5">{lead.collegeOrSchool}</div>
  </td>

  <!-- License Number & Date -->
  <td class="py-3.5 px-4 whitespace-nowrap">
    <div class="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">{lead.licenseNumber}</div>
    <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Issued: {lead.issueDate}</div>
  </td>

  <!-- Verified Contacts -->
  <td class="py-3.5 px-4 min-w-[200px]">
    <ContactBadgeList data={lead.skipTraceData} />
  </td>

  <!-- Outreach / Pipeline Stage -->
  <td class="py-3.5 px-4 whitespace-nowrap">
    <StatusIndicator status={lead.outreachStatus} />
  </td>

  <!-- Deal Value & 2-Yr Package -->
  <td class="py-3.5 px-4 whitespace-nowrap">
    <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">${(lead.estimatedDealValue || 0).toLocaleString()}</div>
    <div class="text-[10px] text-slate-400 dark:text-slate-400 font-mono">2-Yr w4 Cloud</div>
  </td>

  <!-- Action Buttons -->
  <td class="py-3.5 px-4 text-right whitespace-nowrap" onclick={(e) => e.stopPropagation()}>
    <div class="flex items-center justify-end gap-1.5">
      <!-- 1. Audit Website Presence -->
      <Tooltip text="Website Presence Audit" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_audit', lead)}
          class="text-xs px-2 text-slate-400 dark:text-slate-400 hover:text-emerald-400"
        >
          <Search class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <!-- 2. Website Preview & Customizer -->
      <Tooltip text="View Turnkey Site Preview & Customizer" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('website_builder', lead)}
          class="text-xs px-2 text-slate-400 dark:text-slate-400 hover:text-cyan-400"
        >
          <Globe class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <!-- 3. Cold Call Script -->
      <Tooltip text="Cold Call Script & 2-Yr Pitch" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('call_script', lead)}
          class="text-xs px-2 text-slate-400 dark:text-slate-400 hover:text-purple-400"
        >
          <PhoneCall class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <!-- 4. Outreach Generator -->
      <Tooltip text="Generate AI Outreach Pitch" position="top">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => onopenmodal?.('outreach_generator', lead)}
          class="text-xs px-2 text-slate-400 dark:text-slate-400 hover:text-amber-400"
        >
          <Send class="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <!-- 5. Questbook CRM Sync / View Record -->
      {#if lead.crmContactId}
        <Tooltip text="Synced to Questbook CRM (ID: #{lead.crmContactId}) - Click to View" position="top">
          <Button
            variant="outline"
            size="sm"
            onclick={handleOpenCrm}
            class="text-xs px-2 text-cyan-400 border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/50"
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
            class="text-xs px-2 text-emerald-400 border-emerald-800/70 hover:bg-emerald-950/40"
          >
            <UserPlus class="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
      {/if}
    </div>
  </td>
</tr>
