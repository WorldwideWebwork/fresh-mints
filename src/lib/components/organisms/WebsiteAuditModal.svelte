<script lang="ts">
  import type { Lead, ExistingWebsiteAudit } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import {
    Globe,
    Search,
    ShieldCheck,
    AlertCircle,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    FileCheck,
    Check,
    X,
    Layers,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
  } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onopenpreview?: (lead: Lead) => void;
    onopenpitch?: (lead: Lead) => void;
    onclose?: () => void;
  }

  let {
    open = $bindable(false),
    lead = null,
    onopenpreview,
    onopenpitch,
    onclose,
  }: Props = $props();

  let isAuditing = $state(false);
  let activeStep = $state(0);
  let showMethodology = $state(false);

  const activeLead = $derived(
    lead ? leadStore.leads.find((l) => l.id === lead.id) || lead : null
  );
  const audit = $derived(activeLead?.websiteAudit || null);

  const scanSteps = [
    { title: 'Querying Google Search Index & State Board Registries', detail: 'Target: Name, license, city & state records' },
    { title: 'Checking Standalone Domain Names & DNS Records', detail: 'Evaluating .com / .org / custom branded practice TLDs' },
    { title: 'Filtering Static Aggregators vs Solo Practice Sites', detail: 'Separating official state registries & Yelp from standalone websites' },
    { title: 'Synthesizing Strategic Outreach Pitch Angle', detail: 'Formulating highest-conversion turnkey package recommendation' },
  ];

  async function handleRunAudit() {
    const target = activeLead || lead;
    if (!target) return;
    isAuditing = true;
    activeStep = 1;

    const timer1 = setTimeout(() => (activeStep = 2), 500);
    const timer2 = setTimeout(() => (activeStep = 3), 1000);
    const timer3 = setTimeout(() => (activeStep = 4), 1600);

    try {
      const res = await leadStore.checkLeadWebsiteLive(target.id);
      if (res) {
        toast.success('Live audit completed!');
      }
    } catch (e: any) {
      toast.error('Audit failed', e.message);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      isAuditing = false;
      activeStep = 0;
    }
  }

  function handleOpenPreview() {
    const target = activeLead || lead;
    if (!target) return;
    open = false;
    onclose?.();
    if (onopenpreview) {
      onopenpreview(target);
    }
  }

  function handleOpenPitch() {
    const target = activeLead || lead;
    if (!target) return;
    open = false;
    onclose?.();
    if (onopenpitch) {
      onopenpitch(target);
    }
  }
</script>

<Dialog
  bind:open
  {onclose}
  title="Website Presence Audit & Grounding"
  description="Live Google Search grounding & domain footprint verification"
  maxWidth="max-w-2xl"
>
  {#if activeLead}
    <div class="space-y-5">
      <!-- Lead Context Bar -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeLead.fullName}</span>
            <Badge variant="default" class="text-[10px]">{activeLead.professionTitle}</Badge>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {activeLead.city}, {activeLead.state} &bull; License #{activeLead.licenseNumber}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onclick={handleRunAudit}
          loading={isAuditing}
          class="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800"
        >
          <RefreshCw class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 {isAuditing ? 'animate-spin' : ''}" />
          <span>{isAuditing ? 'Auditing Live...' : 'Re-Run Live Audit'}</span>
        </Button>
      </div>

      <!-- Active Live Scanner Animation -->
      {#if isAuditing}
        <div class="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-5 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-spin">
              <Search class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-200">
                Scanning Live Web &amp; Domain Footprint...
              </h4>
              <p class="text-xs text-emerald-600 dark:text-emerald-400">
                Verifying official standalone website status across public search engines
              </p>
            </div>
          </div>

          <div class="space-y-2.5 pt-1">
            {#each scanSteps as step, idx}
              {@const stepNumber = idx + 1}
              {@const isDone = activeStep > stepNumber}
              {@const isCurrent = activeStep === stepNumber}
              <div class="flex items-start gap-2.5 text-xs">
                <div class="mt-0.5 shrink-0">
                  {#if isDone}
                    <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {:else if isCurrent}
                    <span class="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin inline-block"></span>
                  {:else}
                    <span class="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                      {stepNumber}
                    </span>
                  {/if}
                </div>
                <div>
                  <p class="font-semibold {isCurrent ? 'text-emerald-700 dark:text-emerald-300' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">
                    {step.title}
                  </p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">{step.detail}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Audit Findings -->
      {#if audit && !isAuditing}
        <div class="space-y-4">
          <!-- Primary Findings Banner -->
          <div
            class="p-4 rounded-xl border flex items-start gap-3 {!audit.hasWebsite
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-800/80 text-emerald-700 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-800/80 text-amber-200'}"
          >
            <div class="mt-0.5">
              {#if !audit.hasWebsite}
                <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {:else}
                <AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              {/if}
            </div>

            <div class="space-y-1 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">
                  {!audit.hasWebsite ? 'High Opportunity Lead: 0 Active Website Found' : 'Existing Website Detected'}
                </h4>
                <Badge variant={!audit.hasWebsite ? 'success' : 'warning'} class="text-[10px]">
                  {audit.status}
                </Badge>
              </div>

              <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                {audit.summary}
              </p>

              {#if audit.existingUrl}
                <div class="pt-2">
                  <a
                    href={audit.existingUrl.startsWith('http') ? audit.existingUrl : `https://${audit.existingUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-800/60 hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                    <span>{audit.existingUrl}</span>
                  </a>
                </div>
              {/if}
            </div>
          </div>

          <!-- Qualification Criteria Matrix -->
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <FileCheck class="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Website Qualification Breakdown
                </h4>
              </div>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Audit Date: {new Date(audit.checkedAt).toLocaleDateString()}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <!-- Custom Domain Metric -->
              <div class="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                {#if audit.qualifications?.hasCustomDomain || audit.hasWebsite}
                  <Check class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                {:else}
                  <X class="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                {/if}
                <div>
                  <p class="font-bold text-slate-800 dark:text-slate-200">Standalone Custom Domain</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    {audit.qualifications?.domainCheckSummary || (!audit.hasWebsite ? 'No dedicated .com or root domain' : 'Live root domain registered')}
                  </p>
                </div>
              </div>

              <!-- Direct Intake / Booking Funnel -->
              <div class="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                {#if audit.qualifications?.hasDirectBookingPortal}
                  <Check class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                {:else}
                  <X class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                {/if}
                <div>
                  <p class="font-bold text-slate-800 dark:text-slate-200">Online Intake / Booking Portal</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    {audit.qualifications?.hasDirectBookingPortal ? 'Direct client booking system active' : 'Zero booking system or calendar'}
                  </p>
                </div>
              </div>

              <!-- Digital Footprint Rating -->
              <div class="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 sm:col-span-2">
                <Layers class="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p class="font-bold text-slate-800 dark:text-slate-200">Digital Footprint Classification</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    {audit.qualifications?.digitalFootprintRating || (!audit.hasWebsite ? 'Registry / Board Listing Only' : 'Custom Independent Practice')}: {!audit.hasWebsite ? 'Appears exclusively on passive state registers or directory stubs; has no personal control of their client acquisition funnel.' : 'Controls their own branded web property.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pitch Strategy Recommendation -->
          <div class="bg-purple-950/40 border border-purple-800/60 rounded-xl p-4 space-y-2">
            <div class="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <Sparkles class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Recommended Turnkey Pitch Strategy</span>
            </div>
            <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {audit.pitchStrategy}
            </p>
          </div>
        </div>
      {:else if !isAuditing}
        <div class="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-xs">
          <Globe class="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p class="font-semibold text-slate-700 dark:text-slate-300">No live audit completed yet for this practitioner.</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Click &quot;Re-Run Live Audit&quot; above to search public indexing and domain registers.</p>
        </div>
      {/if}

      <!-- Educational Qualification Methodology Accordion -->
      <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/60">
        <button
          type="button"
          onclick={() => (showMethodology = !showMethodology)}
          class="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:bg-slate-900 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <HelpCircle class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>How Fresh Mints Qualifies Website Presence</span>
          </div>
          {#if showMethodology}
            <ChevronUp class="w-4 h-4 text-slate-500 dark:text-slate-400" />
          {:else}
            <ChevronDown class="w-4 h-4 text-slate-500 dark:text-slate-400" />
          {/if}
        </button>

        {#if showMethodology}
          <div class="p-4 pt-0 text-xs text-slate-500 dark:text-slate-400 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div class="space-y-1">
              <p class="font-bold text-emerald-600 dark:text-emerald-400">1. What Qualifies as &quot;No Website&quot; (Hot Lead):</p>
              <ul class="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <li><strong>No Standalone Root Domain:</strong> No active <code>.com</code>, <code>.co</code>, or dedicated domain registered under their name or practice.</li>
                <li><strong>Directory-Only Presence:</strong> Appearing exclusively on passive licensing registers (State Board, NPPES NPI index, Yelp stubs) with zero custom branding.</li>
                <li><strong>Missing Conversion Funnel:</strong> No discovery call scheduler, custom contact intake form, or mobile-optimized services showcase.</li>
              </ul>
            </div>

            <div class="space-y-1">
              <p class="font-bold text-amber-600 dark:text-amber-400">2. What Qualifies as &quot;Has Existing Website&quot;:</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                A live, dedicated personal or business domain matching the professional&apos;s name, city, and credentials. In these cases, you can pitch a <strong>Website Modernization &amp; Performance Redesign</strong> instead of a new build.
              </p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer Actions -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => {
            open = false;
            onclose?.();
          }}
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          Close
        </Button>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={handleOpenPreview}
            class="gap-1.5 text-xs text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800"
          >
            <Globe class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Preview Turnkey Site</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onclick={handleOpenPitch}
            class="gap-1.5 text-xs font-semibold"
          >
            <span>Outreach &amp; Pitch Offer</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  {/if}
</Dialog>
