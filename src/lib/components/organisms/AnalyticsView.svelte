<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { PROFESSION_CONFIGS, type ProfessionCategory } from '../../types/lead';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import StatCard from '../molecules/StatCard.svelte';
  import { TrendingUp, Users, DollarSign, Award, Send, CheckCircle2, PieChart, BarChart3 } from 'lucide-svelte';

  const stats = $derived(leadStore.analytics);

  const professionDistribution = $derived.by(() => {
    const counts: Partial<Record<ProfessionCategory, number>> = {};
    for (const lead of leadStore.leads) {
      counts[lead.profession] = (counts[lead.profession] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([prof, count]) => ({
        prof: prof as ProfessionCategory,
        label: PROFESSION_CONFIGS[prof as ProfessionCategory]?.label || prof,
        count: count || 0,
        percentage: leadStore.leads.length > 0 ? Math.round(((count || 0) / leadStore.leads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  });
</script>

<div class="space-y-6">
  <!-- Key Metric Stat Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      title="Total Pipeline Value"
      value={`$${stats.totalPipelineValue.toLocaleString()}`}
      subtext={`${stats.totalLeads} active practitioner leads`}
      icon={DollarSign}
      accentColor="emerald"
    />

    <StatCard
      title="Won Revenue"
      value={`$${stats.wonRevenue.toLocaleString()}`}
      subtext={`${stats.clientsWonCount} 2-Year packages sold`}
      icon={Award}
      accentColor="purple"
    />

    <StatCard
      title="Pitches Sent"
      value={stats.pitchesSentCount}
      subtext={`${stats.sitesBuiltCount} turnkey mockups built`}
      icon={Send}
      accentColor="cyan"
    />

    <StatCard
      title="Conversion Rate"
      value={`${stats.conversionRate}%`}
      subtext="Won deals / Pitches sent"
      icon={TrendingUp}
      accentColor="amber"
    />
  </div>

  <!-- Pipeline Funnel & Industry Breakdown -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Pipeline Funnel -->
    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Practitioner Pipeline Funnel</span>
      </h3>

      <div class="space-y-3 text-xs">
        <div>
          <div class="flex justify-between py-1 text-slate-700 dark:text-slate-300">
            <span>1. Total Registry Leads Minted</span>
            <span class="font-bold font-mono">{stats.totalLeads}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between py-1 text-slate-700 dark:text-slate-300">
            <span>2. Skip-Traced Contact Verified</span>
            <span class="font-bold font-mono">{stats.skipTracedCount}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full bg-cyan-500 rounded-full"
              style="width: {stats.totalLeads > 0 ? (stats.skipTracedCount / stats.totalLeads) * 100 : 0}%"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between py-1 text-slate-700 dark:text-slate-300">
            <span>3. Turnkey Mockup Built</span>
            <span class="font-bold font-mono">{stats.sitesBuiltCount}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full bg-purple-500 rounded-full"
              style="width: {stats.totalLeads > 0 ? (stats.sitesBuiltCount / stats.totalLeads) * 100 : 0}%"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between py-1 text-slate-700 dark:text-slate-300">
            <span>4. Outreach Pitch Dispatched</span>
            <span class="font-bold font-mono">{stats.pitchesSentCount}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full bg-amber-500 rounded-full"
              style="width: {stats.totalLeads > 0 ? (stats.pitchesSentCount / stats.totalLeads) * 100 : 0}%"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between py-1 text-emerald-700 dark:text-emerald-300 font-semibold">
            <span>5. Closed Won (2-Year w4 Package)</span>
            <span class="font-bold font-mono">{stats.clientsWonCount}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full bg-emerald-400 rounded-full"
              style="width: {stats.totalLeads > 0 ? (stats.clientsWonCount / stats.totalLeads) * 100 : 0}%"
            ></div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Industry Distribution -->
    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
        <PieChart class="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Industry Distribution</span>
      </h3>

      <div class="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {#each professionDistribution as item}
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div class="truncate">
              <span class="font-semibold text-slate-800 dark:text-slate-200 block truncate">{item.label}</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">{item.count} leads ({item.percentage}%)</span>
            </div>
            <Badge variant="default" class="font-mono">{item.count}</Badge>
          </div>
        {:else}
          <div class="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            No sector records available.
          </div>
        {/each}
      </div>
    </Card>
  </div>
</div>
