<script lang="ts">
  import Card from '../atoms/Card.svelte';
  import type { Component } from 'svelte';

  interface Props {
    title: string;
    value: string | number;
    subtext?: string;
    icon?: Component<{ class?: string }>;
    accentColor?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';
    class?: string;
    onclick?: () => void;
  }

  let {
    title,
    value,
    subtext,
    icon: IconComponent,
    accentColor = 'emerald',
    class: className = '',
    onclick,
  }: Props = $props();

  const colorStyles = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  };
</script>

<Card class="flex flex-col justify-between {className} {onclick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all' : ''}" {onclick}>
  <div class="flex items-center justify-between gap-3 mb-3">
    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
    {#if IconComponent}
      <div class="p-2 rounded-xl border {colorStyles[accentColor]} flex-shrink-0">
        <IconComponent class="w-4 h-4" />
      </div>
    {/if}
  </div>

  <div>
    <div class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
    {#if subtext}
      <div class="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">{subtext}</div>
    {/if}
  </div>
</Card>
