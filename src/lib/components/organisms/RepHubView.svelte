<script lang="ts">
  import {
    type Lead,
    type OutreachStatus,
    type SkipTraceResult,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { generateColdCallScript, type ColdCallScriptData } from '../../services/outreach-generator';
  import { getPreviewLink } from '../../services/website-templates';
  import { CRMExportService } from '../../services/crm-export-service';
  import Card from '../atoms/Card.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Tooltip from '../atoms/Tooltip.svelte';
  import StatusIndicator from '../atoms/StatusIndicator.svelte';
  import {
    PhoneCall,
    Phone,
    PhoneOff,
    Mail,
    Globe,
    Award,
    Sparkles,
    DollarSign,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Zap,
    Target,
    ExternalLink,
    Copy,
    Check,
    Search,
    UserPlus,
    UserCheck,
    Clock,
    Flame,
    ShieldCheck,
    AlertCircle,
    Calendar,
    Edit3,
    Send,
    RefreshCw,
    Building,
    MapPin,
    Tag,
    HelpCircle,
    MessageSquare,
    TrendingUp,
  } from 'lucide-svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  // Queue filtering state
  let queueFilter = $state<'dialable' | 'uncontacted' | 'discussion' | 'high_value' | 'all'>('dialable');
  let queueSearch = $state('');
  let activeLeadIndex = $state(0);
  let callNotesInput = $state('');
  let isTracing = $state(false);
  let isSyncingCrm = $state(false);
  let activeScriptTab = $state<'hook' | 'value' | 'offer' | 'close'>('hook');
  let selectedObjectionIndex = $state<number | null>(null);

  // Performance metrics
  const wonLeads = $derived(leadStore.leads.filter((l) => l.outreachStatus === 'Client Won'));
  const totalBountiesEarned = $derived(wonLeads.length * 300);
  const totalDialsLogged = $derived(
    leadStore.leads.reduce(
      (sum, l) => sum + (l.outreachLogs || []).filter((log) => log.type === 'sms' || log.type === 'email' || log.subject?.includes('Call')).length,
      0
    )
  );

  // Filtered queue calculation
  const activeQueue = $derived.by<Lead[]>(() => {
    let list = leadStore.leads;

    if (queueFilter === 'dialable') {
      list = list.filter((l) => Boolean(l.skipTraceData?.verifiedPhone) && l.outreachStatus !== 'Client Won' && l.outreachStatus !== 'Declined');
    } else if (queueFilter === 'uncontacted') {
      list = list.filter((l) => ['Uncontacted', 'Skip Traced'].includes(l.outreachStatus));
    } else if (queueFilter === 'discussion') {
      list = list.filter((l) => ['In Discussion', 'Outreach Sent'].includes(l.outreachStatus));
    } else if (queueFilter === 'high_value') {
      list = list.filter((l) => (l.estimatedDealValue || 0) >= 2500 && l.outreachStatus !== 'Client Won');
    }

    if (queueSearch.trim().length > 0) {
      const q = queueSearch.toLowerCase();
      list = list.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.professionTitle.toLowerCase().includes(q) ||
          l.licenseNumber.toLowerCase().includes(q) ||
          Boolean(l.skipTraceData?.verifiedPhone?.toLowerCase().includes(q))
      );
    }

    return list;
  });

  // Active Lead in Cockpit
  const activeLead = $derived<Lead | null>(activeQueue[activeLeadIndex] || activeQueue[0] || null);

  // Dynamic Cold Call Script for Active Lead
  const scriptData = $derived<ColdCallScriptData | null>(
    activeLead ? generateColdCallScript(activeLead, activeLead.estimatedDealValue) : null
  );

  const profMeta = $derived(
    activeLead ? PROFESSION_CONFIGS[activeLead.profession] || PROFESSION_CONFIGS.real_estate : null
  );

  const hostingPlan = $derived(
    profMeta ? W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze : null
  );

  // Sync notes when active lead changes
  $effect(() => {
    if (activeLead) {
      callNotesInput = activeLead.notes || '';
      selectedObjectionIndex = null;
    }
  });

  function handleNextLead() {
    if (activeLeadIndex < activeQueue.length - 1) {
      activeLeadIndex++;
    } else {
      activeLeadIndex = 0;
    }
  }

  function handlePrevLead() {
    if (activeLeadIndex > 0) {
      activeLeadIndex--;
    } else {
      activeLeadIndex = activeQueue.length - 1;
    }
  }

  function handleSelectLead(lead: Lead) {
    const idx = activeQueue.findIndex((l) => l.id === lead.id);
    if (idx !== -1) {
      activeLeadIndex = idx;
    }
  }

  async function handlePerformSkipTrace() {
    if (!activeLead || isTracing) return;
    isTracing = true;
    try {
      const res = await leadStore.performSkipTrace(activeLead.id);
      if (res && res.verifiedPhone) {
        toast.success(`Phone Located for ${activeLead.fullName}`, `${res.verifiedPhone} (${res.phoneType || 'Mobile'})`);
      } else {
        toast.warning('No direct phone located', 'Public directory records checked.');
      }
    } finally {
      isTracing = false;
    }
  }

  function handleSaveNotes() {
    if (!activeLead) return;
    leadStore.updateLead(activeLead.id, { notes: callNotesInput });
    toast.success('Call notes saved');
  }

  function handleAppendTag(tag: string) {
    if (!activeLead) return;
    const separator = callNotesInput.trim().length > 0 ? '\n' : '';
    callNotesInput = `${callNotesInput}${separator}[${new Date().toLocaleDateString()}] ${tag}`;
    leadStore.updateLead(activeLead.id, { notes: callNotesInput });
  }

  async function handleDisposition(status: OutreachStatus, note: string, advance: boolean = true) {
    if (!activeLead) return;

    await leadStore.recordOutreachLog(activeLead.id, {
      type: 'sms',
      subject: `Call Outcome: ${status}`,
      content: `${note} ${callNotesInput ? `| Notes: ${callNotesInput}` : ''}`,
      status: 'sent',
      toneUsed: 'Direct Phone Pitch',
    });

    await leadStore.updateLead(activeLead.id, {
      outreachStatus: status,
      notes: callNotesInput,
    });

    if (status === 'Client Won') {
      toast.success(
        `🏆 Deal Closed Won!`,
        `Congratulations! $300.00 cash bounty locked for ${activeLead.fullName} ($${activeLead.estimatedDealValue.toLocaleString()})`
      );
    } else {
      toast.success(`Logged: ${status}`, `${activeLead.fullName} updated`);
    }

    if (advance) {
      handleNextLead();
    }
  }

  import { copyTextToClipboard } from '../../services/clipboard';

  async function handleCopyPhone() {
    if (!activeLead?.skipTraceData?.verifiedPhone) return;
    const success = await copyTextToClipboard(activeLead.skipTraceData.verifiedPhone);
    if (success) toast.success('Phone copied to clipboard');
  }

  async function handleCopyScript() {
    if (!scriptData) return;
    const fullText = `HOOK:\n${scriptData.openingHook}\n\nVALUE PITCH:\n${scriptData.valuePitch}\n\n2-YEAR OFFER:\n${scriptData.twoYearOffer}\n\nDOMAIN EQUITY:\n${scriptData.domainEquityClause}`;
    const success = await copyTextToClipboard(fullText);
    if (success) toast.success('Full cold call script copied');
  }

  async function handleCopyPitchLink() {
    if (!activeLead) return;
    const link = getPreviewLink(activeLead);
    const success = await copyTextToClipboard(link);
    if (success) toast.success('Preview pitch link copied to clipboard');
  }

  function handleGoogleSearch() {
    if (!activeLead) return;
    const query = encodeURIComponent(`${activeLead.fullName} ${activeLead.professionTitle} ${activeLead.city} ${activeLead.state}`.trim());
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  }

  async function handleQuickCrmSync() {
    if (!activeLead) return;
    isSyncingCrm = true;
    try {
      const res = await leadStore.syncLeadToCRM(activeLead.id);
      if (res.success) {
        toast.success('Synced to Questbook CRM', res.message);
      } else {
        toast.error('Sync Failed', res.message);
      }
    } finally {
      isSyncingCrm = false;
    }
  }

  function handleOpenCrm() {
    if (!activeLead?.crmContactId) return;
    CRMExportService.openQuestbookRecord(activeLead.crmContactId);
  }
</script>

<div class="space-y-5">
  <!-- Top Rep Command Performance Bar -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
    <Card class="p-4 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/60 to-white dark:to-slate-900 border-slate-200 dark:border-emerald-800/40">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Cash Bounties Won</span>
        <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <DollarSign class="w-3.5 h-3.5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
        ${totalBountiesEarned.toLocaleString()}
      </div>
      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
        {wonLeads.length} Deals &bull; $300.00/deal
      </div>
    </Card>

    <Card class="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Queue Roster</span>
        <div class="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
          <Zap class="w-3.5 h-3.5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
        {activeQueue.length}
      </div>
      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        Filtered Outbound Queue
      </div>
    </Card>

    <Card class="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queue Value</span>
        <div class="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
          <TrendingUp class="w-3.5 h-3.5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
        ${activeQueue.reduce((sum, l) => sum + (l.estimatedDealValue || 1650), 0).toLocaleString()}
      </div>
      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        ${(activeQueue.length * 300).toLocaleString()} Rep Bounty Pool
      </div>
    </Card>

    <Card class="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dials & Outreaches</span>
        <div class="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
          <PhoneCall class="w-3.5 h-3.5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
        {totalDialsLogged}
      </div>
      <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        Activity Logs Recorded
      </div>
    </Card>
  </div>

  <!-- Queue Filter Tabs & Search Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onclick={() => { queueFilter = 'dialable'; activeLeadIndex = 0; }}
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {queueFilter === 'dialable' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}"
      >
        <Phone class="w-3 h-3 inline mr-1" />
        Ready to Dial (Phone Verified)
      </button>

      <button
        type="button"
        onclick={() => { queueFilter = 'uncontacted'; activeLeadIndex = 0; }}
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {queueFilter === 'uncontacted' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}"
      >
        Uncontacted Queue
      </button>

      <button
        type="button"
        onclick={() => { queueFilter = 'discussion'; activeLeadIndex = 0; }}
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {queueFilter === 'discussion' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}"
      >
        In Discussion / Follow-ups
      </button>

      <button
        type="button"
        onclick={() => { queueFilter = 'high_value'; activeLeadIndex = 0; }}
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {queueFilter === 'high_value' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}"
      >
        High Value ($2.5k+)
      </button>

      <button
        type="button"
        onclick={() => { queueFilter = 'all'; activeLeadIndex = 0; }}
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {queueFilter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}"
      >
        All Leads ({leadStore.leads.length})
      </button>
    </div>

    <div class="relative min-w-[200px]">
      <input
        type="text"
        placeholder="Filter queue by name, city, phone..."
        bind:value={queueSearch}
        class="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
    </div>
  </div>

  {#if activeLead}
    <!-- Main Rep Workstation Cockpit -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <!-- Left 7 Cols: Active Lead Cockpit & Call Dispositions -->
      <div class="lg:col-span-7 space-y-4">
        <!-- Lead Header & Queue Step Controller -->
        <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <!-- Queue Progress Counter & Prev/Next Buttons -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Lead {activeLeadIndex + 1} of {activeQueue.length}
              </span>
              <span class="text-slate-300 dark:text-slate-700">&bull;</span>
              <span class="text-xs text-teal-600 dark:text-teal-400 font-semibold font-mono">
                {activeLead.state} Registry
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                onclick={handlePrevLead}
                class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onclick={handleNextLead}
                class="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span>Next Lead</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Active Lead Profile Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="space-y-1 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeLead.fullName}
                </h2>
                <StatusIndicator status={activeLead.outreachStatus} />
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {activeLead.professionTitle} &bull; {activeLead.city}, {activeLead.state}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Building class="w-3.5 h-3.5 text-slate-400" />
                <span>{activeLead.collegeOrSchool}</span>
                <span class="font-mono">&bull; Lic #{activeLead.licenseNumber}</span>
              </p>
            </div>

            <!-- Value Badge -->
            <div class="text-left sm:text-right flex-shrink-0 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div class="text-xs text-slate-500 dark:text-slate-400">2-Yr Package Value</div>
              <div class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                ${activeLead.estimatedDealValue.toLocaleString()}
              </div>
              <div class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-start sm:justify-end gap-1 mt-0.5">
                <Flame class="w-3 h-3 text-amber-500" />
                <span>$300 Cash Bounty</span>
              </div>
            </div>
          </div>

          <!-- Contact Telephony Cockpit Bar -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <!-- Phone -->
              <div class="flex items-center gap-2">
                {#if activeLead.skipTraceData?.verifiedPhone}
                  <a
                    href="tel:{activeLead.skipTraceData.verifiedPhone}"
                    class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-98"
                  >
                    <PhoneCall class="w-4 h-4 animate-bounce" />
                    <span>Call {activeLead.skipTraceData.verifiedPhone}</span>
                  </a>

                  <button
                    type="button"
                    onclick={handleCopyPhone}
                    title="Copy Phone"
                    class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>

                  <Badge variant="success" class="text-[10px]">
                    {activeLead.skipTraceData.phoneType || 'Verified Mobile'} ({activeLead.skipTraceData.confidenceScore}%)
                  </Badge>
                {:else}
                  <button
                    type="button"
                    onclick={handlePerformSkipTrace}
                    disabled={isTracing}
                    class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw class="w-3.5 h-3.5 {isTracing ? 'animate-spin' : ''}" />
                    <span>{isTracing ? 'Searching Registries...' : 'Run Skip Trace (Find Phone)'}</span>
                  </button>
                {/if}
              </div>

              <!-- Email / Web Presence -->
              <div class="flex items-center gap-2 text-xs">
                {#if activeLead.skipTraceData?.primaryEmail}
                  <a
                    href="mailto:{activeLead.skipTraceData.primaryEmail}"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Mail class="w-3.5 h-3.5 text-teal-600" />
                    <span class="max-w-[140px] truncate">{activeLead.skipTraceData.primaryEmail}</span>
                  </a>
                {/if}
              </div>
            </div>

            <!-- Quick Action Links -->
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <button
                type="button"
                onclick={() => onopenmodal?.('website_builder', activeLead)}
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Globe class="w-3.5 h-3.5" />
                <span>Turnkey Preview</span>
              </button>

              <button
                type="button"
                onclick={handleCopyPitchLink}
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>Copy Pitch Link</span>
              </button>

              <button
                type="button"
                onclick={() => onopenmodal?.('outreach_generator', activeLead)}
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Send class="w-3.5 h-3.5" />
                <span>AI Outreach</span>
              </button>

              <button
                type="button"
                onclick={handleGoogleSearch}
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Search class="w-3.5 h-3.5" />
                <span>Google Dossier</span>
              </button>

              {#if activeLead.crmContactId}
                <button
                  type="button"
                  onclick={handleOpenCrm}
                  class="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400 flex items-center gap-1.5 cursor-pointer font-mono text-[11px]"
                >
                  <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
                  <span>CRM #{activeLead.crmContactId}</span>
                </button>
              {:else}
                <button
                  type="button"
                  onclick={handleQuickCrmSync}
                  disabled={isSyncingCrm}
                  class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus class="w-3.5 h-3.5" />
                  <span>Sync Questbook</span>
                </button>
              {/if}
            </div>
          </div>

          <!-- 1-Click Call Outcome Dispositions -->
          <div class="space-y-2.5 pt-1">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              1-Click Call Outcome &amp; Pipeline Disposition
            </span>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onclick={() => handleDisposition('In Discussion', 'Connected and actively pitching turnkey package.', false)}
                class="p-2.5 rounded-xl border border-teal-500/40 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <PhoneCall class="w-4 h-4 text-teal-600" />
                <span>Connected &bull; Pitching</span>
              </button>

              <button
                type="button"
                onclick={() => handleDisposition('Outreach Sent', 'Left professional voicemail and text with practice preview link.')}
                class="p-2.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <MessageSquare class="w-4 h-4 text-amber-600" />
                <span>Left Voicemail / No Ans</span>
              </button>

              <button
                type="button"
                onclick={() => handleDisposition('In Discussion', 'Callback scheduled with decision maker.', false)}
                class="p-2.5 rounded-xl border border-purple-500/40 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <Calendar class="w-4 h-4 text-purple-600" />
                <span>Callback Requested</span>
              </button>

              <button
                type="button"
                onclick={() => handleDisposition('Client Won', '2-Year w4 Package Sold & Paid!', false)}
                class="p-2.5 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-sm col-span-2 sm:col-span-2"
              >
                <Sparkles class="w-4 h-4 text-amber-300" />
                <span>Deal Closed Won! ($300 Bounty)</span>
              </button>

              <button
                type="button"
                onclick={() => handleDisposition('Declined', 'Practitioner not interested at this time.')}
                class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PhoneOff class="w-3.5 h-3.5 text-rose-500" />
                <span>Not Interested</span>
              </button>
            </div>
          </div>

          <!-- Call Notes & Quick Tags Input -->
          <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <label for="rep-call-notes" class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Call Notes &amp; Activity Log
              </label>
              <button
                type="button"
                onclick={handleSaveNotes}
                class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Save Notes
              </button>
            </div>

            <textarea
              id="rep-call-notes"
              rows="2"
              bind:value={callNotesInput}
              onblur={handleSaveNotes}
              placeholder="Type call notes, objections raised, specific practitioner requests..."
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            ></textarea>

            <!-- Quick Tag Insertion Pills -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Tag class="w-3 h-3" /> Quick Tags:
              </span>
              {#each ['Wants Custom Domain', 'Sent Live Preview', 'Price Sensitive', 'Spouse Decision Maker', 'Call After 5pm'] as tag}
                <button
                  type="button"
                  onclick={() => handleAppendTag(tag)}
                  class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              {/each}
            </div>
          </div>
        </Card>

        <!-- Integrated 4-Step Call Pitch Flow -->
        {#if scriptData}
          <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded-lg bg-teal-500/20 text-teal-600">
                  <PhoneCall class="w-3.5 h-3.5" />
                </div>
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Live Telemarketing Pitch Assistant
                </h3>
              </div>

              <button
                type="button"
                onclick={handleCopyScript}
                class="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>Copy Full Script</span>
              </button>
            </div>

            <!-- Script Step Tabs -->
            <div class="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onclick={() => (activeScriptTab = 'hook')}
                class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer {activeScriptTab === 'hook' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}"
              >
                1. Hook
              </button>
              <button
                type="button"
                onclick={() => (activeScriptTab = 'value')}
                class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer {activeScriptTab === 'value' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}"
              >
                2. Portal
              </button>
              <button
                type="button"
                onclick={() => (activeScriptTab = 'offer')}
                class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer {activeScriptTab === 'offer' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}"
              >
                3. 2-Yr Offer
              </button>
              <button
                type="button"
                onclick={() => (activeScriptTab = 'close')}
                class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer {activeScriptTab === 'close' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}"
              >
                4. Equity
              </button>
            </div>

            <!-- Active Script Body -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-sans italic min-h-[100px]">
              {#if activeScriptTab === 'hook'}
                <div class="space-y-1.5">
                  <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 not-italic block">
                    Step 1: Board Pass Congratulatory Hook
                  </span>
                  <p>{scriptData.openingHook}</p>
                </div>
              {:else if activeScriptTab === 'value'}
                <div class="space-y-1.5">
                  <span class="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 not-italic block">
                    Step 2: Turnkey Practice Portal Presentation
                  </span>
                  <p>{scriptData.valuePitch}</p>
                </div>
              {:else if activeScriptTab === 'offer'}
                <div class="space-y-1.5">
                  <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 not-italic block">
                    Step 3: 24-Month Zero-Overhead Launch Package
                  </span>
                  <p>{scriptData.twoYearOffer}</p>
                </div>
              {:else if activeScriptTab === 'close'}
                <div class="space-y-1.5">
                  <span class="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 not-italic block">
                    Step 4: Domain Equity &amp; Lease-to-Own Buyout
                  </span>
                  <p>{scriptData.domainEquityClause}</p>
                </div>
              {/if}
            </div>
          </Card>
        {/if}
      </div>

      <!-- Right 5 Cols: Quick Objection Matrix & Queue Lead Roster -->
      <div class="lg:col-span-5 space-y-4">
        <!-- Interactive Objection Rebuttal Matrix -->
        {#if scriptData}
          <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div class="flex items-center gap-2">
                <Target class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Live Objection Rebuttal Matrix
                </h3>
              </div>
            </div>

            <div class="space-y-2.5">
              {#each scriptData.objections as obj, idx}
                {@const isOpen = selectedObjectionIndex === idx}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="rounded-xl border transition-all cursor-pointer overflow-hidden {isOpen ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300'}"
                  onclick={() => (selectedObjectionIndex = isOpen ? null : idx)}
                >
                  <div class="p-3 flex items-start justify-between gap-2 text-xs">
                    <span class="font-bold text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                      <HelpCircle class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {obj.objection}
                    </span>
                    <ChevronRight class="w-3.5 h-3.5 text-slate-400 transition-transform {isOpen ? 'rotate-90 text-purple-600' : ''}" />
                  </div>

                  {#if isOpen}
                    <div class="px-3 pb-3 pt-1 border-t border-purple-200 dark:border-purple-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-white/80 dark:bg-slate-900/80">
                      <div class="flex items-start gap-1.5">
                        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Rebuttal:</strong> {obj.rebuttal}</span>
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </Card>
        {/if}

        <!-- Active Calling Queue Roster -->
        <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap class="w-3.5 h-3.5 text-amber-500" />
              <span>Queue Roster ({activeQueue.length} leads)</span>
            </h3>
          </div>

          <div class="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {#each activeQueue as lead, idx (lead.id)}
              {@const isSelected = activeLead?.id === lead.id}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs {isSelected ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'}"
                onclick={() => handleSelectLead(lead)}
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {lead.fullName}
                    </span>
                    {#if lead.skipTraceData?.verifiedPhone}
                      <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Phone verified"></span>
                    {/if}
                  </div>
                  <div class="text-[11px] text-slate-500 truncate">
                    {lead.professionTitle} &bull; {lead.city}, {lead.state}
                  </div>
                </div>

                <div class="text-right flex-shrink-0">
                  <div class="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    ${lead.estimatedDealValue.toLocaleString()}
                  </div>
                  <StatusIndicator status={lead.outreachStatus} />
                </div>
              </div>
            {:else}
              <div class="py-8 text-center text-xs text-slate-400">
                No matching leads in active filter.
              </div>
            {/each}
          </div>
        </Card>
      </div>
    </div>
  {:else}
    <Card class="p-12 text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
        <PhoneCall class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Calling Queue is Empty</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Query the state licensing registry to load fresh practitioner leads into your outbound dialer queue.
      </p>
      <div class="pt-2">
        <Button variant="primary" size="sm" onclick={() => leadStore.setActiveTab('search')}>
          Go to Registry Search
        </Button>
      </div>
    </Card>
  {/if}
</div>
