<script lang="ts">
  import { type Lead, type OutreachStatus, OUTREACH_STAGES, PROFESSION_CONFIGS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { CRMExportService } from '../../services/crm-export-service';
  import { BombBagService } from '../../services/bomb-bag-service';
  import { getPreviewLink, getSubdomainPreviewLink } from '../../services/website-templates';
  import { copyTextToClipboard } from '../../services/clipboard';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import {
    User,
    MapPin,
    Building,
    Award,
    Phone,
    PhoneCall,
    Mail,
    Linkedin,
    UserPlus,
    UserCheck,
    ExternalLink,
    Send,
    Trash2,
    Clock,
    Search,
    Kanban,
    Table,
    Globe,
    ChevronLeft,
    ChevronRight,
    Copy,
    RefreshCw,
    Flame,
    CheckCircle2,
    FileText,
    Sparkles,
    DollarSign,
  } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { open = $bindable(false), lead = $bindable(null), onclose, onopenmodal }: Props = $props();

  let isSyncingCrm = $state(false);
  let isSyncingBombBag = $state(false);
  let isTracing = $state(false);
  let notesInput = $state('');

  const profMeta = $derived(
    lead ? PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate : null
  );

  const currentIdx = $derived(
    lead ? leadStore.filteredLeads.findIndex((l) => l.id === lead?.id) : -1
  );

  const totalFilteredLeads = $derived(leadStore.filteredLeads.length);

  const stageIndex = $derived(
    lead ? OUTREACH_STAGES.indexOf(lead.outreachStatus) : -1
  );
  const canAdvance = $derived(stageIndex >= 0 && stageIndex < OUTREACH_STAGES.length - 2);
  const canRegress = $derived(stageIndex > 0);
  const nextStage = $derived(canAdvance ? OUTREACH_STAGES[stageIndex + 1] : null);
  const prevStage = $derived(canRegress ? OUTREACH_STAGES[stageIndex - 1] : null);

  $effect(() => {
    if (lead) {
      notesInput = lead.notes || '';
    }
  });

  function handlePrevLead() {
    if (totalFilteredLeads === 0) return;
    const newIdx = currentIdx > 0 ? currentIdx - 1 : totalFilteredLeads - 1;
    const nextTarget = leadStore.filteredLeads[newIdx];
    if (nextTarget) {
      lead = nextTarget;
      leadStore.setSelectedLeadId(nextTarget.id);
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const [path, query] = hash.split('?');
        const params = new URLSearchParams(query || '');
        params.set('lead', nextTarget.id);
        const newQuery = params.toString();
        const targetHash = newQuery ? `${path}?${newQuery}` : path;
        window.history.replaceState(null, '', targetHash);
      }
    }
  }

  function handleNextLead() {
    if (totalFilteredLeads === 0) return;
    const newIdx = currentIdx < totalFilteredLeads - 1 ? currentIdx + 1 : 0;
    const nextTarget = leadStore.filteredLeads[newIdx];
    if (nextTarget) {
      lead = nextTarget;
      leadStore.setSelectedLeadId(nextTarget.id);
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const [path, query] = hash.split('?');
        const params = new URLSearchParams(query || '');
        params.set('lead', nextTarget.id);
        const newQuery = params.toString();
        const targetHash = newQuery ? `${path}?${newQuery}` : path;
        window.history.replaceState(null, '', targetHash);
      }
    }
  }

  function handleNavigateToRepHub() {
    if (!lead) return;
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('rephub');
    open = false;
    onclose?.();
    toast.info('Loaded in Rep Hub', `${lead.fullName} ready for live dial`);
  }

  function handleNavigateToPipeline() {
    if (!lead) return;
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('kanban');
    open = false;
    onclose?.();
    toast.info('View in Pipeline', `Showing ${lead.fullName} in CRM Pipeline`);
  }

  function handleNavigateToTable() {
    if (!lead) return;
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('leads');
    open = false;
    onclose?.();
  }

  async function handleSetStage(targetStage: OutreachStatus) {
    if (!lead || lead.outreachStatus === targetStage) return;
    await leadStore.updateLead(lead.id, { outreachStatus: targetStage });
    if (targetStage === 'Client Won') {
      toast.success(
        '🏆 Deal Closed Won!',
        `$300.00 cash bounty locked for ${lead.fullName} ($${(lead.estimatedDealValue || 1650).toLocaleString()})`
      );
    } else {
      toast.success('Pipeline Stage Updated', `${lead.fullName} moved to ${targetStage}`);
    }
  }

  function handleAdvanceStage() {
    if (!nextStage) return;
    handleSetStage(nextStage);
  }

  function handleRegressStage() {
    if (!prevStage) return;
    handleSetStage(prevStage);
  }

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

  function handleOpenBombBag() {
    if (!lead) return;
    BombBagService.openBombBagSubscriber(lead.bombBagSubscriberId);
  }

  function handleComposeBombBag() {
    if (!lead) return;
    BombBagService.openBombBagComposer(lead);
  }

  async function handleSyncBombBag() {
    if (!lead) return;
    isSyncingBombBag = true;
    try {
      const res = await leadStore.syncLeadToBombBag(lead.id);
      if (res.success) {
        toast.success('Synced to Bomb Bag Marketing', res.message);
      } else {
        toast.error('Bomb Bag Sync Failed', res.message);
      }
    } finally {
      isSyncingBombBag = false;
    }
  }

  async function handlePerformSkipTrace() {
    if (!lead || isTracing) return;
    isTracing = true;
    try {
      const res = await leadStore.performSkipTrace(lead.id);
      if (res && res.verifiedPhone) {
        toast.success(`Phone Located for ${lead.fullName}`, `${res.verifiedPhone} (${res.phoneType || 'Mobile'})`);
      } else {
        toast.warning('No direct phone located', 'Public directory records checked.');
      }
    } finally {
      isTracing = false;
    }
  }

  async function handleCopyText(text: string, label: string) {
    const success = await copyTextToClipboard(text);
    if (success) toast.success(`${label} copied to clipboard`);
  }

  async function handleSaveNotes() {
    if (!lead) return;
    await leadStore.updateLead(lead.id, { notes: notesInput });
    toast.success('Lead notes updated');
  }

  async function handleDelete() {
    if (!lead) return;
    await leadStore.deleteLead(lead.id);
    toast.success(`Removed ${lead.fullName}`);
    open = false;
    onclose?.();
  }
</script>

<Dialog
  bind:open
  {onclose}
  title="Practitioner Lead Dossier & Action Hub"
  description="State board regulatory data, live skip-trace intelligence, and full CRM navigation"
  maxWidth="max-w-4xl"
>
  {#if lead}
    <div class="space-y-5">
      <!-- Carousel Lead Switcher & Navigation Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div class="flex items-center gap-2">
          {#if currentIdx !== -1}
            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">
              Lead {currentIdx + 1} of {totalFilteredLeads}
            </span>
            <span class="text-slate-300 dark:text-slate-700">&bull;</span>
          {/if}
          <span class="text-slate-500 dark:text-slate-400">
            {lead.state} Board Registry
          </span>
        </div>

        <!-- Carousel Step Arrows -->
        <div class="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onclick={handlePrevLead}
            class="text-xs px-2.5 py-1 gap-1"
            title="Previous Lead in Filtered Queue"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onclick={handleNextLead}
            class="text-xs px-2.5 py-1 gap-1"
            title="Next Lead in Filtered Queue"
          >
            <span>Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <!-- Practitioner Profile Banner -->
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1 flex-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{lead.fullName}</h3>
            <IndustryBadge profession={lead.profession} variant="badge" size="sm" />
            <StatusIndicator status={lead.outreachStatus} />
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {lead.professionTitle} &bull; {lead.city}, {lead.state}
          </p>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap pt-0.5">
            <span class="font-mono">Lic #{lead.licenseNumber}</span>
            <span>&bull;</span>
            <span>{lead.collegeOrSchool}</span>
            <span>&bull;</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              ${(lead.estimatedDealValue || 1650).toLocaleString()} 2-Yr Package
            </span>
          </div>
        </div>

        <!-- Global Destination Navigation Buttons -->
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <!-- 1. Open in Rep Hub -->
          <Button
            variant="primary"
            size="sm"
            onclick={handleNavigateToRepHub}
            class="text-xs gap-1.5 font-bold shadow-sm"
          >
            <PhoneCall class="w-3.5 h-3.5" />
            <span>Open in Rep Hub</span>
          </Button>

          <!-- 2. View in Pipeline -->
          <Button
            variant="outline"
            size="sm"
            onclick={handleNavigateToPipeline}
            class="text-xs gap-1.5 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <Kanban class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>View in Pipeline</span>
          </Button>

          <!-- 3. View in Table -->
          <Button
            variant="outline"
            size="sm"
            onclick={handleNavigateToTable}
            class="text-xs px-2.5 text-slate-600 dark:text-slate-300"
            title="View in Leads Table"
          >
            <Table class="w-3.5 h-3.5" />
          </Button>

          <!-- Delete -->
          <Button
            variant="danger"
            size="sm"
            onclick={handleDelete}
            class="text-xs px-2.5"
            title="Delete Lead"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <!-- Interactive CRM Pipeline Stage Stepper & Mover -->
      <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <Kanban class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              CRM Pipeline Stage
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">
              (Current: <strong class="text-emerald-600 dark:text-emerald-400">{lead.outreachStatus}</strong>)
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!canRegress}
              onclick={handleRegressStage}
              class="text-xs px-2 py-0.5 gap-1 disabled:opacity-40"
              title={prevStage ? `Regress to ${prevStage}` : 'At initial stage'}
            >
              <ChevronLeft class="w-3 h-3" />
              <span>Step Back</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!canAdvance}
              onclick={handleAdvanceStage}
              class="text-xs px-2 py-0.5 gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-40"
              title={nextStage ? `Advance to ${nextStage}` : 'At final stage'}
            >
              <span>Advance Stage</span>
              <ChevronRight class="w-3 h-3" />
            </Button>
          </div>
        </div>

        <!-- 7-Stage Clickable Pill Selector Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {#each OUTREACH_STAGES as stage}
            {@const isCurrent = lead.outreachStatus === stage}
            <button
              type="button"
              onclick={() => handleSetStage(stage)}
              class="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center select-none {isCurrent
                ? stage === 'Client Won'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/30'
                  : stage === 'Declined'
                  ? 'bg-rose-600 text-white shadow-xs font-bold ring-2 ring-rose-500/30'
                  : 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}"
            >
              <div class="truncate text-[11px]">{stage}</div>
              {#if isCurrent && stage === 'Client Won'}
                <div class="text-[9px] font-mono text-emerald-100">$300 Bounty</div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Quick Tool Launchers Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <!-- 1. Turnkey Website Preview -->
        <button
          type="button"
          onclick={() => onopenmodal?.('website_builder', lead!)}
          class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500/60 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <Globe class="w-4 h-4" />
            </div>
            <ExternalLink class="w-3 h-3 text-slate-400 group-hover:text-cyan-500" />
          </div>
          <div class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
            Turnkey Website Preview
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Live customized practice portal & demo
          </p>
        </button>

        <!-- 2. Cold Call Pitch Script -->
        <button
          type="button"
          onclick={() => onopenmodal?.('call_script', lead!)}
          class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500/60 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 text-left transition-all group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <PhoneCall class="w-4 h-4" />
            </div>
            <ExternalLink class="w-3 h-3 text-slate-400 group-hover:text-purple-500" />
          </div>
          <div class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Cold Call Pitch Script
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Hook, 2-yr offer & objection handling
          </p>
        </button>

        <!-- 3. AI Outreach Generator -->
        <button
          type="button"
          onclick={() => onopenmodal?.('outreach_generator', lead!)}
          class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/60 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Send class="w-4 h-4" />
            </div>
            <ExternalLink class="w-3 h-3 text-slate-400 group-hover:text-amber-500" />
          </div>
          <div class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
            AI Outreach Pitch
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Gemini personalized email & SMS
          </p>
        </button>

        <!-- 4. Website Audit -->
        <button
          type="button"
          onclick={() => onopenmodal?.('website_audit', lead!)}
          class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 text-left transition-all group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Search class="w-4 h-4" />
            </div>
            <ExternalLink class="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
          </div>
          <div class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            Website Presence Audit
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate existing domain & digital footprint
          </p>
        </button>
      </div>

      <!-- Grid Information Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 1. Board Registry Info -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <Award class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>State Licensing Board Data</span>
            </div>
            <Badge variant="default" class="text-[10px]">{lead.licenseStatus}</Badge>
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
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Skip Trace Contact Record</span>
            </div>
            {#if lead.skipTraceData}
              <Badge variant="success">{lead.skipTraceData.confidenceScore}% Score</Badge>
            {/if}
          </div>

          {#if lead.skipTraceData}
            <div class="space-y-2 text-xs">
              <!-- Phone with Direct Action -->
              <div class="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Phone:</span>
                {#if lead.skipTraceData.verifiedPhone}
                  <div class="flex items-center gap-1.5">
                    <a
                      href="tel:{lead.skipTraceData.verifiedPhone}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Phone class="w-3 h-3" />
                      <span>{lead.skipTraceData.verifiedPhone}</span>
                    </a>
                    <button
                      type="button"
                      onclick={() => handleCopyText(lead.skipTraceData!.verifiedPhone, 'Phone number')}
                      class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Phone"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                {:else}
                  <span class="text-slate-400 italic">Not Located</span>
                {/if}
              </div>

              <!-- Email with Direct Action -->
              <div class="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Email:</span>
                {#if lead.skipTraceData.primaryEmail}
                  <div class="flex items-center gap-1.5">
                    <a
                      href="mailto:{lead.skipTraceData.primaryEmail}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-medium text-teal-600 dark:text-teal-400 hover:underline truncate max-w-[170px]"
                    >
                      {lead.skipTraceData.primaryEmail}
                    </a>
                    <button
                      type="button"
                      onclick={() => handleCopyText(lead.skipTraceData!.primaryEmail, 'Email address')}
                      class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Email"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                {:else}
                  <span class="text-slate-400 italic">Not Located</span>
                {/if}
              </div>

              <!-- Address -->
              <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400">Address:</span>
                <span class="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{lead.skipTraceData.currentAddress || 'N/A'}</span>
              </div>

              <!-- Enrichment notes -->
              <div class="flex justify-between py-1">
                <span class="text-slate-500 dark:text-slate-400">Validation:</span>
                <span class="text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[180px]">{lead.skipTraceData.emailValidation || 'Grounding Verified'}</span>
              </div>
            </div>
          {:else}
            <div class="text-center py-5 text-slate-500 dark:text-slate-400 text-xs space-y-2">
              <p>No skip-trace enrichment run yet.</p>
              <Button
                variant="outline"
                size="sm"
                onclick={handlePerformSkipTrace}
                loading={isTracing}
                class="text-xs gap-1.5 text-cyan-600 dark:text-cyan-400 border-cyan-800"
              >
                <RefreshCw class="w-3.5 h-3.5 {isTracing ? 'animate-spin' : ''}" />
                <span>Run Live Skip Trace</span>
              </Button>
            </div>
          {/if}
        </div>
      </div>

      <!-- 3. COMPASS Ecosystem & Marketing Sync (Questbook CRM + Bomb Bag + Subdomain) -->
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <div class="flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
            <span>COMPASS Ecosystem & Marketing Journeys</span>
          </div>
          <span class="text-[11px] text-cyan-400 font-mono">Live Sync Active</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Questbook CRM Status -->
          <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-200 flex items-center gap-1.5">
                <UserCheck class="w-3.5 h-3.5 text-cyan-400" />
                <span>Questbook CRM</span>
              </span>
              {#if lead.crmContactId}
                <Badge variant="success">Synced #{lead.crmContactId}</Badge>
              {:else}
                <Badge variant="secondary">Not Synced</Badge>
              {/if}
            </div>
            <p class="text-slate-400 text-[11px]">
              {lead.crmContactId ? `Lead contact is active in Questbook deal pipeline.` : `Sync lead directly into Questbook contacts and sales pipeline.`}
            </p>
            <div class="flex items-center gap-2 pt-1">
              {#if lead.crmContactId}
                <Button variant="outline" size="sm" onclick={handleOpenCRM} class="text-xs w-full justify-center text-cyan-400 border-cyan-800/80 bg-cyan-950/30">
                  <span>Open Contact</span>
                  <ExternalLink class="w-3 h-3 ml-1" />
                </Button>
              {:else}
                <Button variant="outline" size="sm" onclick={handleSyncCRM} loading={isSyncingCrm} class="text-xs w-full justify-center text-emerald-400 border-emerald-800">
                  <UserPlus class="w-3 h-3 mr-1" />
                  <span>1-Click Sync CRM</span>
                </Button>
              {/if}
            </div>
          </div>

          <!-- Bomb Bag Marketing Status -->
          <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-200 flex items-center gap-1.5">
                <Mail class="w-3.5 h-3.5 text-purple-400" />
                <span>Bomb Bag News Flash</span>
              </span>
              {#if lead.bombBagSubscriberId}
                <Badge variant="info">Enrolled #{lead.bombBagSubscriberId}</Badge>
              {:else}
                <Badge variant="secondary">Unenrolled</Badge>
              {/if}
            </div>
            <p class="text-slate-400 text-[11px]">
              {lead.bombBagSubscriberId ? `Subscriber enrolled in Fresh Mints marketing journeys.` : `Enroll practitioner into automated cold outreach email journeys.`}
            </p>
            <div class="flex items-center gap-2 pt-1">
              {#if lead.bombBagSubscriberId}
                <Button variant="outline" size="sm" onclick={handleOpenBombBag} class="text-xs w-1/2 justify-center text-purple-400 border-purple-800 bg-purple-950/30">
                  <span>Subscriber</span>
                  <ExternalLink class="w-3 h-3 ml-1" />
                </Button>
                <Button variant="outline" size="sm" onclick={handleComposeBombBag} class="text-xs w-1/2 justify-center text-cyan-400 border-cyan-800 bg-cyan-950/30">
                  <span>Compose</span>
                  <Send class="w-3 h-3 ml-1" />
                </Button>
              {:else}
                <Button variant="outline" size="sm" onclick={handleSyncBombBag} loading={isSyncingBombBag} class="text-xs w-full justify-center text-purple-400 border-purple-800">
                  <Mail class="w-3 h-3 mr-1" />
                  <span>1-Click Sync Bomb Bag</span>
                </Button>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Notes & Follow-up Section -->
      <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <div class="flex items-center gap-1.5">
            <FileText class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Practitioner Call Notes & Follow-up Log</span>
          </div>
          <Button variant="outline" size="sm" onclick={handleSaveNotes} class="text-xs px-2.5 py-0.5">
            Save Notes
          </Button>
        </div>

        <textarea
          bind:value={notesInput}
          rows="2"
          placeholder="Record conversation details, objections, agreed 2-year package tier, or follow-up date..."
          class="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 custom-scrollbar"
        ></textarea>
      </div>

      <!-- 5. Outreach History Log -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Outreach History ({(lead.outreachLogs || []).length} events)</span>
        </div>

        {#if (lead.outreachLogs || []).length > 0}
          <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {#each lead.outreachLogs || [] as log}
              <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs flex items-start justify-between gap-2">
                <div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Badge variant={log.type === 'email' ? 'info' : 'success'}>{log.type.toUpperCase()}</Badge>
                    {#if log.subject}<span>{log.subject}</span>{/if}
                  </div>
                  <p class="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{log.content}</p>
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-3 text-slate-500 dark:text-slate-400 text-xs">
            No outreach recorded yet.
          </div>
        {/if}
      </div>

      <!-- Bottom External Connectors Bar -->
      <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onclick={handleGoogleSearch}
            class="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Search class="w-3.5 h-3.5" />
            <span>Google</span>
            <ExternalLink class="w-3 h-3 text-blue-500 dark:text-blue-400 ml-0.5" />
          </Button>

          {#if lead.crmContactId}
            <Button
              variant="outline"
              size="sm"
              onclick={handleOpenCRM}
              class="text-xs text-cyan-400 border-cyan-800 bg-cyan-950/40 hover:bg-cyan-900/50"
            >
              <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
              <span>Questbook (#{lead.crmContactId})</span>
              <ExternalLink class="w-3 h-3 text-cyan-400 ml-0.5" />
            </Button>
          {:else}
            <Button
              variant="outline"
              size="sm"
              onclick={handleSyncCRM}
              loading={isSyncingCrm}
              class="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-800"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>Sync CRM</span>
            </Button>
          {/if}

          {#if lead.bombBagSubscriberId}
            <Button
              variant="outline"
              size="sm"
              onclick={handleOpenBombBag}
              class="text-xs text-purple-400 border-purple-800 bg-purple-950/40 hover:bg-purple-900/50"
            >
              <Mail class="w-3.5 h-3.5 text-purple-400" />
              <span>Bomb Bag (#{lead.bombBagSubscriberId})</span>
              <ExternalLink class="w-3 h-3 text-purple-400 ml-0.5" />
            </Button>
          {:else}
            <Button
              variant="outline"
              size="sm"
              onclick={handleSyncBombBag}
              loading={isSyncingBombBag}
              class="text-xs text-purple-400 border-purple-800 hover:bg-purple-950/40"
            >
              <Mail class="w-3.5 h-3.5" />
              <span>Sync Bomb Bag</span>
            </Button>
          {/if}
        </div>

        <Button variant="ghost" size="sm" onclick={() => { open = false; onclose?.(); }} class="text-xs">
          Close Dossier
        </Button>
      </div>
    </div>
  {/if}
</Dialog>
