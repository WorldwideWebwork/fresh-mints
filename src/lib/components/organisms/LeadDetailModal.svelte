<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { CRMExportService } from '../../services/crm-export-service';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import { User, MapPin, Building, Award, Phone, Mail, Linkedin, UserPlus, UserCheck, ExternalLink, Send, Trash2, Clock, Search } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
  }

  let { open = $bindable(false), lead = null, onclose }: Props = $props();

  const profMeta = $derived(
    lead ? PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate : null
  );

  let isSyncingCrm = $state(false);

  function handleGoogleSearch() {
    if (!lead) return;
    const query = encodeURIComponent(`${lead.fullName} ${lead.professionTitle || lead.profession} ${lead.city || ''} ${lead.state || ''}`.trim());
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  }

  function handleOpenCRM() {
    if (!lead) return;
    CRMExportService.openQuestbookRecord(lead.crmContactId);
  }

  async function handleSyncCRM() {
    if (!lead) return;
    isSyncingCrm = true;
    try {
      const res = await leadStore.syncLeadToCRM(lead.id);
      if (res.success) {
        toast.success('Synced to Questbook CRM', res.message);
      } else {
        toast.error('CRM Sync Failed', res.message);
      }
    } finally {
      isSyncingCrm = false;
    }
  }

  async function handleDelete() {
    if (!lead) return;
    await leadStore.deleteLead(lead.id);
    toast.success(`Removed ${lead.fullName}`);
    open = false;
    onclose?.();
  }
</script>

<Dialog bind:open {onclose} title="Practitioner Lead Dossier" description="Official state board registry data, skip-trace intelligence, and pitch history" maxWidth="max-w-3xl">
  {#if lead}
    <div class="space-y-6">
      <!-- Header Overview Card -->
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{lead.fullName}</h3>
            <StatusIndicator status={lead.outreachStatus} />
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{lead.professionTitle}</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="outline" size="sm" onclick={handleGoogleSearch} class="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40">
            <Search class="w-3.5 h-3.5" />
            <span>Search Google</span>
            <ExternalLink class="w-3 h-3 text-blue-500 dark:text-blue-400 ml-0.5" />
          </Button>

          {#if lead.crmContactId}
            <Button variant="outline" size="sm" onclick={handleOpenCRM} class="text-xs text-cyan-400 border-cyan-800 bg-cyan-950/40 hover:bg-cyan-900/50">
              <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
              <span>View in Questbook (#{lead.crmContactId})</span>
              <ExternalLink class="w-3 h-3 text-cyan-400 ml-0.5" />
            </Button>
          {:else}
            <Button variant="outline" size="sm" onclick={handleSyncCRM} loading={isSyncingCrm} class="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-800">
              <UserPlus class="w-3.5 h-3.5" />
              <span>Sync Questbook</span>
            </Button>
          {/if}

          <Button variant="danger" size="sm" onclick={handleDelete} class="text-xs px-2.5">
            <Trash2 class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <!-- Grid Information Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 1. Board Registry Info -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>State Licensing Board Data</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
              <span class="text-slate-500 dark:text-slate-400">License Number:</span>
              <span class="font-mono text-slate-800 dark:text-slate-200 font-bold">{lead.licenseNumber}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
              <span class="text-slate-500 dark:text-slate-400">Jurisdiction:</span>
              <span class="text-slate-800 dark:text-slate-200 font-medium">{lead.city}, {lead.state}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
              <span class="text-slate-500 dark:text-slate-400">School / Board:</span>
              <span class="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">{lead.collegeOrSchool}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
              <span class="text-slate-500 dark:text-slate-400">Issue Date:</span>
              <span class="text-slate-800 dark:text-slate-200">{lead.issueDate}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500 dark:text-slate-400">Estimated 2-Yr Deal:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold font-mono">${(lead.estimatedDealValue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- 2. Skip Trace Records -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Skip Trace Contact Record</span>
          </div>

          {#if lead.skipTraceData}
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Phone:</span>
                <span class="text-slate-800 dark:text-slate-200 font-medium">{lead.skipTraceData.verifiedPhone || 'Not Found'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Email:</span>
                <span class="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">{lead.skipTraceData.primaryEmail || 'Not Found'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Confidence:</span>
                <Badge variant="success">{lead.skipTraceData.confidenceScore}% Score</Badge>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-500 dark:text-slate-400">Address:</span>
                <span class="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{lead.skipTraceData.currentAddress || 'N/A'}</span>
              </div>
            </div>
          {:else}
            <div class="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
              No skip-trace enrichment run yet.
            </div>
          {/if}
        </div>
      </div>

      <!-- 3. Outreach History -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Outreach History ({(lead.outreachLogs || []).length} events)</span>
        </div>

        {#if (lead.outreachLogs || []).length > 0}
          <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {#each lead.outreachLogs || [] as log}
              <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs flex items-start justify-between gap-2">
                <div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Badge variant={log.type === 'email' ? 'info' : 'success'}>{log.type.toUpperCase()}</Badge>
                    {#if log.subject}<span>{log.subject}</span>{/if}
                  </div>
                  <p class="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{log.content}</p>
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-4 text-slate-500 dark:text-slate-400 text-xs">
            No outreach recorded yet.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</Dialog>
