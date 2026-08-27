<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Card from '../atoms/Card.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { PhoneCall, DollarSign, Award, CheckCircle2, ChevronRight, Zap, Target, ExternalLink } from 'lucide-svelte';

  interface Props {
    onopenmodal?: (modalName: string, lead: Lead) => void;
  }

  let { onopenmodal }: Props = $props();

  const wonCount = $derived(
    leadStore.leads.filter((l) => l.outreachStatus === 'Client Won').length
  );

  const totalCommissionsEarned = $derived(wonCount * 300);

  const uncontactedLeads = $derived(
    leadStore.leads.filter((l) => ['Uncontacted', 'Skip Traced'].includes(l.outreachStatus))
  );
</script>

<div class="space-y-6">
  <!-- Rep Performance Dashboard Top Header -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card class="p-5 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/60 to-white dark:to-slate-900 border-slate-200 dark:border-emerald-800/40">
      <div class="flex items-center justify-between gap-3 mb-2">
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Rep Cash Bounties Earned</span>
        <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <DollarSign class="w-4 h-4" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">${totalCommissionsEarned.toLocaleString()}</div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">$300.00 cash per closed 2-yr deal</div>
    </Card>

    <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between gap-3 mb-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deals Closed Won</span>
        <div class="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
          <Award class="w-4 h-4" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{wonCount}</div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">2-Year Turnkey Packages Sold</div>
    </Card>

    <Card class="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between gap-3 mb-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ready to Call Queue</span>
        <div class="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
          <PhoneCall class="w-4 h-4" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{uncontactedLeads.length}</div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Uncontacted & Skip-Traced Leads</div>
    </Card>
  </div>

  <!-- Rep Workstation: Queue & Objection Matrix -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left 2 Cols: Calling Queue -->
    <div class="lg:col-span-2 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Zap class="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Priority Outbound Dialing Queue</span>
        </h3>
      </div>

      <div class="space-y-3">
        {#each uncontactedLeads.slice(0, 10) as lead (lead.id)}
          <Card class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">{lead.fullName}</h4>
                <Badge variant={lead.skipTraceData?.verifiedPhone ? 'success' : 'default'} class="text-[10px]">
                  {lead.skipTraceData?.verifiedPhone || 'No Phone Verified'}
                </Badge>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                {lead.professionTitle} | {lead.city}, {lead.state}
              </div>
              <div class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Deal Value: ${lead.estimatedDealValue.toLocaleString()} ($300 Rep Bounty)
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="primary"
                size="sm"
                onclick={() => onopenmodal?.('call_script', lead)}
                class="gap-1.5 text-xs font-semibold"
              >
                <PhoneCall class="w-3.5 h-3.5" />
                <span>Launch Pitch</span>
              </Button>
            </div>
          </Card>
        {:else}
          <Card class="p-10 text-center text-slate-500 dark:text-slate-400 text-xs">
            No uncontacted leads in queue. Query the live registry to fill your outbound calling roster.
          </Card>
        {/each}
      </div>
    </div>

    <!-- Right Col: Quick Objection Matrix -->
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
        <Target class="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Quick Rebuttal Matrix</span>
      </h3>

      <div class="space-y-3 text-xs">
        <Card class="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div class="font-bold text-rose-600 dark:text-rose-300">"I already have a firm / brokerage."</div>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
            "Awesome! Top producers still keep their personal digital brand so referrals, reviews, and client inquiries belong to them directly."
          </p>
        </Card>

        <Card class="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div class="font-bold text-rose-600 dark:text-rose-300">"I'll build it myself on Squarespace."</div>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
            "DIY builders charge $35/mo and take 40+ hours. Our turnkey package is live in 24 hours with 2 full years of hosting and custom tools completely paid."
          </p>
        </Card>

        <Card class="p-4 space-y-2 border-slate-200 dark:border-slate-800">
          <div class="font-bold text-rose-600 dark:text-rose-300">"What happens after the 2-year promo?"</div>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
            "It simply continues at our base w4 rate ($34.99/mo) with no lock-in contracts, or you can buy out the unencumbered domain asset for $999."
          </p>
        </Card>
      </div>
    </div>
  </div>
</div>
