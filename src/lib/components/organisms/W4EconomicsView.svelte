<script lang="ts">
  import { W4_HOSTING_PLANS } from '../../types/lead';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Server, DollarSign, ShieldCheck, Check, Sparkles, TrendingUp } from 'lucide-svelte';

  const plans = Object.values(W4_HOSTING_PLANS);
</script>

<div class="space-y-6">
  <!-- Header Card -->
  <Card class="p-6 bg-gradient-to-r from-white dark:from-slate-900 via-white dark:via-slate-900 to-emerald-50 dark:to-emerald-950/40 border-slate-200 dark:border-slate-800">
    <div class="max-w-3xl space-y-2">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
        <Server class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>w<sup>4</sup> Cloud High-Speed Hosting &amp; Infrastructure Economics</span>
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        2-Year Promotional Turnkey Package &amp; Unit Economics
      </h2>
      <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        Practitioners receive full portal engineering, custom domain registration, and 24 full months of high-speed w<sup>4</sup> cloud hosting with zero ongoing monthly fees.
      </p>
    </div>
  </Card>

  <!-- Plans Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each plans as plan}
      <Card class="flex flex-col justify-between p-6 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all">
        <div class="space-y-4">
          <!-- Tier Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
            <Badge variant="success" class="text-xs font-mono font-bold">${plan.monthlyBaseRate}/mo base</Badge>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">{plan.description}</p>

          <!-- 2-Yr Package Price -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">2-Year Flat Package Price</span>
            <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${plan.twoYearFlatPackagePrice.toLocaleString()}</div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">24 Months Hosting Included ($0/mo)</span>
          </div>

          <!-- Cost & Margin Breakdown -->
          <div class="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">Caller Rep Bounty:</span>
              <span class="text-purple-600 dark:text-purple-300 font-mono font-semibold">${plan.callerCommission}.00 Cash</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">24-Mo Cloud Cost:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${plan.twoYearHostingCost.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400">2-Yr Wholesale Domain:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${plan.twoYearDomainCost.toFixed(2)}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Net Consulting Profit:</span>
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
