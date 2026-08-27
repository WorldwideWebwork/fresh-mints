<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { generateColdCallScript } from '../../services/outreach-generator';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import {
    PhoneCall,
    DollarSign,
    ShieldCheck,
    HelpCircle,
    CheckCircle2,
    Copy,
    Kanban,
    FileText,
    ExternalLink,
  } from 'lucide-svelte';
  import { toast } from '../../stores/toast.svelte';
  import { copyTextToClipboard } from '../../services/clipboard';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { open = $bindable(false), lead = null, onclose, onopenmodal }: Props = $props();

  const scriptData = $derived(
    lead ? generateColdCallScript(lead, lead.estimatedDealValue) : null
  );

  async function copyScript() {
    if (!scriptData) return;
    const fullText = `
HOOK:
${scriptData.openingHook}

VALUE PITCH:
${scriptData.valuePitch}

2-YEAR OFFER:
${scriptData.twoYearOffer}

DOMAIN EQUITY CLAUSE:
${scriptData.domainEquityClause}
    `.trim();
    const success = await copyTextToClipboard(fullText);
    if (success) toast.success('Call script copied to clipboard!');
  }

  function handleOpenRepHub() {
    if (!lead) return;
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('rephub');
    open = false;
    onclose?.();
    toast.info('Loaded in Rep Hub', `${lead.fullName} ready for live dial`);
  }

  function handleOpenPipeline() {
    if (!lead) return;
    leadStore.setSelectedLeadId(lead.id);
    leadStore.setActiveTab('kanban');
    open = false;
    onclose?.();
  }

  function handleOpenDossier() {
    if (!lead) return;
    onopenmodal?.('lead_detail', lead);
  }
</script>

<Dialog
  bind:open
  {onclose}
  title="Telemarketing Cold Call Script & Objection Handling"
  description="Specialized 2-year w4 hosting pitch and turnkey practice portal presentation"
  maxWidth="max-w-3xl"
>
  {#if lead && scriptData}
    <div class="space-y-6">
      <!-- Rep Commission Bounty & Navigation Header -->
      <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <DollarSign class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-emerald-700 dark:text-emerald-300">Caller Commission Bounty: $300.00 Cash</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Pipeline Deal Value: ${lead.estimatedDealValue.toLocaleString()} ({lead.fullName})</div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="primary" size="sm" onclick={handleOpenRepHub} class="gap-1.5 text-xs font-bold shadow-xs">
            <PhoneCall class="w-3.5 h-3.5" />
            <span>Open in Rep Hub</span>
          </Button>

          <Button variant="outline" size="sm" onclick={copyScript} class="gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-800">
            <Copy class="w-3.5 h-3.5" />
            <span>Copy Script</span>
          </Button>
        </div>
      </div>

      <!-- Call Flow Sections -->
      <div class="space-y-4">
        <!-- 1. Opening Hook -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Step 1: Board Pass Congratulatory Hook</span>
          </div>
          <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800/60">
            {scriptData.openingHook}
          </p>
        </div>

        <!-- 2. Value Pitch -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Step 2: Turnkey Portal & Domain Reservation</span>
          </div>
          <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800/60">
            {scriptData.valuePitch}
          </p>
        </div>

        <!-- 3. 2-Year Promotional Package -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Step 3: 24-Month Zero-Overhead Launch Package</span>
          </div>
          <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800/60">
            {scriptData.twoYearOffer}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 pt-1">
            <strong class="text-slate-700 dark:text-slate-300">Equity Clause:</strong> {scriptData.domainEquityClause}
          </p>
        </div>

        <!-- 4. Objection Handling Matrix -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Objection Handling Matrix
          </div>
          <div class="space-y-2.5">
            {#each scriptData.objections as obj}
              <div class="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 space-y-1.5">
                <div class="text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                  <HelpCircle class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span>Objection: {obj.objection}</span>
                </div>
                <div class="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5 pl-5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Rebuttal:</strong> {obj.rebuttal}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Bottom Jump Links -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" onclick={handleOpenDossier} class="gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <FileText class="w-3.5 h-3.5 text-teal-600" />
            <span>View Lead Dossier</span>
          </Button>

          <Button variant="outline" size="sm" onclick={handleOpenPipeline} class="gap-1.5 text-xs text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800">
            <Kanban class="w-3.5 h-3.5" />
            <span>View in Pipeline</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" onclick={() => { open = false; onclose?.(); }}>
          Close
        </Button>
      </div>
    </div>
  {/if}
</Dialog>
