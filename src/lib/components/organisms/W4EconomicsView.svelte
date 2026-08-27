<script lang="ts">
  import { W4_HOSTING_PLANS, GLOBAL_PLAN_INCLUSIONS, type W4HostingPlan } from '../../types/lead';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import {
    Server,
    DollarSign,
    ShieldCheck,
    Check,
    Sparkles,
    TrendingUp,
    Layers,
    Cpu,
    Shield,
    Globe,
    Mail,
    HardDrive,
    Zap,
    Lock,
    Headphones,
    RefreshCw
  } from 'lucide-svelte';

  const allPlans = Object.values(W4_HOSTING_PLANS);

  type TrackCategory = 'all' | 'micro' | 'macro' | 'omni';
  let activeTrack = $state<TrackCategory>('all');

  const getTrack = (id: string): TrackCategory => {
    if (['quantum', 'bronze', 'silver', 'silver_enhanced'].includes(id)) return 'micro';
    if (['gold', 'gold_enhanced', 'platinum', 'platinum_enhanced'].includes(id)) return 'macro';
    return 'omni';
  };

  const getTrackInfo = (id: string) => {
    const track = getTrack(id);
    if (track === 'micro') {
      return {
        label: 'Micro Track',
        badgeVariant: 'default' as const,
        borderAccent: 'hover:border-sky-500/50',
      };
    }
    if (track === 'macro') {
      return {
        label: 'Macro Track',
        badgeVariant: 'info' as const,
        borderAccent: 'hover:border-indigo-500/50',
      };
    }
    return {
      label: 'Omni Sovereign',
      badgeVariant: 'warning' as const,
      borderAccent: 'hover:border-emerald-500/50 ring-1 ring-emerald-500/20',
    };
  };

  const filteredPlans = $derived(
    activeTrack === 'all' 
      ? allPlans 
      : allPlans.filter(p => getTrack(p.id) === activeTrack)
  );

  const counts = $derived({
    all: allPlans.length,
    micro: allPlans.filter(p => getTrack(p.id) === 'micro').length,
    macro: allPlans.filter(p => getTrack(p.id) === 'macro').length,
    omni: allPlans.filter(p => getTrack(p.id) === 'omni').length,
  });
</script>

<div class="space-y-6">
  <!-- Header Card -->
  <Card class="p-6 bg-gradient-to-r from-white dark:from-slate-900 via-white dark:via-slate-900 to-emerald-50 dark:to-emerald-950/40 border-slate-200 dark:border-slate-800">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="max-w-3xl space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Server class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>w<sup>4</sup> Cloud High-Speed Hosting &amp; Infrastructure Economics</span>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          2-Year Promotional Turnkey Package &amp; Box Economics Matrix
        </h2>
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Practitioners receive full portal engineering, custom domain registration, dedicated isolated IPs, 10 professional email accounts, and 24 full months of high-speed w<sup>4</sup> cloud hosting with zero ongoing monthly fees.
        </p>
      </div>

      <!-- Track Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
        <Button
          size="sm"
          variant={activeTrack === 'all' ? 'primary' : 'ghost'}
          class="text-xs h-8 px-3"
          onclick={() => (activeTrack = 'all')}
        >
          All Boxes ({counts.all})
        </Button>
        <Button
          size="sm"
          variant={activeTrack === 'micro' ? 'primary' : 'ghost'}
          class="text-xs h-8 px-3"
          onclick={() => (activeTrack = 'micro')}
        >
          Micro ({counts.micro})
        </Button>
        <Button
          size="sm"
          variant={activeTrack === 'macro' ? 'primary' : 'ghost'}
          class="text-xs h-8 px-3"
          onclick={() => (activeTrack = 'macro')}
        >
          Macro ({counts.macro})
        </Button>
        <Button
          size="sm"
          variant={activeTrack === 'omni' ? 'primary' : 'ghost'}
          class="text-xs h-8 px-3"
          onclick={() => (activeTrack = 'omni')}
        >
          Omni ({counts.omni})
        </Button>
      </div>
    </div>
  </Card>

  <!-- Global Baseline Features Banner -->
  <Card class="p-5 bg-slate-900 text-white border-slate-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-emerald-400" />
        <h3 class="text-sm font-bold text-white tracking-wide uppercase">
          Standard Sovereign Infrastructure (Included on Every Plus &amp; Max Plan)
        </h3>
      </div>
      <span class="text-[11px] text-slate-400">
        *Quantum plan lacks WAF, staging, and live analytics
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 pt-1">
      {#each GLOBAL_PLAN_INCLUSIONS as inc}
        <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <Check class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-slate-200">{inc.title}</h4>
            <p class="text-[11px] text-slate-400 leading-tight">{inc.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Plans Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {#each filteredPlans as plan}
      {@const trackInfo = getTrackInfo(plan.id)}
      <Card class="flex flex-col justify-between p-6 border-slate-200 dark:border-slate-800 {trackInfo.borderAccent} transition-all">
        <div class="space-y-4">
          <!-- Tier Header -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Badge variant={trackInfo.badgeVariant} class="text-[10px] uppercase font-bold tracking-wider">
                {trackInfo.label}
              </Badge>
              <Badge variant="success" class="text-xs font-mono font-bold">${plan.monthlyBaseRate}/mo post-2yr</Badge>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{plan.hardwareSpecs}</p>
            </div>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[44px]">{plan.description}</p>

          <!-- 2-Yr Package Price & Margin Highlight -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">2-Year Flat Package</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                +${plan.netConsultingProfit.toLocaleString()} Net Profit
              </span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${plan.twoYearFlatPackagePrice.toLocaleString()}</div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block">24 Months High-Speed Hosting Included ($0/mo)</span>
          </div>

          <!-- Cost & Margin Breakdown -->
          <div class="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">Caller Rep Bounty:</span>
              <span class="text-purple-600 dark:text-purple-300 font-mono font-semibold">${plan.callerCommission}.00 Cash</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">Wholesale Infra Cost (24 Mo):</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${plan.twoYearHostingCost.toFixed(2)} (${plan.wholesaleMonthlyCost}/mo)</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">2-Yr Wholesale Domain:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${plan.twoYearDomainCost.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Real Consulting Profit:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">${plan.netConsultingProfit.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500 dark:text-slate-400">Domain Equity Buyout:</span>
              <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">${plan.domainBuyoutPrice}.00</span>
            </div>
          </div>

          <!-- Included Suite Features -->
          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Included Features</span>
            <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {#each plan.includedSuiteFeatures as feat}
                <li class="flex items-center gap-2">
                  <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span class="line-clamp-1">{feat}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </Card>
    {/each}
  </div>
</div>

