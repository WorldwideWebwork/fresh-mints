<script lang="ts">
  import type { ProfessionCategory } from '../../types/lead';
  import { PROFESSION_CONFIGS } from '../../types/lead';
  import IndustryIcon from './IndustryIcon.svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export interface IndustryVisualConfig {
    id: ProfessionCategory | 'all';
    label: string;
    shortLabel: string;
    color: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    activeClass: string;
    badgeBgClass: string;
  }

  export const INDUSTRY_VISUAL_CONFIGS: Record<string, IndustryVisualConfig> = {
    all: {
      id: 'all',
      label: 'All Industries (13 High-Value Sectors)',
      shortLabel: 'All Industries',
      color: '#10b981',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200/80 dark:border-emerald-800/60',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-slate-950 shadow-md shadow-emerald-500/20',
      badgeBgClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
    },
    real_estate: {
      id: 'real_estate',
      label: 'Real Estate Agents & Brokers',
      shortLabel: 'Real Estate',
      color: '#f59e0b',
      textClass: 'text-amber-700 dark:text-amber-300',
      bgClass: 'bg-amber-50/80 dark:bg-amber-950/40',
      borderClass: 'border-amber-200/80 dark:border-amber-800/60',
      activeClass: 'bg-amber-500 text-white border-amber-500 dark:bg-amber-400 dark:text-slate-950 shadow-md shadow-amber-500/20',
      badgeBgClass: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
    },
    nursing: {
      id: 'nursing',
      label: 'Nurses & Concierge Healthcare',
      shortLabel: 'Nursing & Health',
      color: '#f43f5e',
      textClass: 'text-rose-700 dark:text-rose-300',
      bgClass: 'bg-rose-50/80 dark:bg-rose-950/40',
      borderClass: 'border-rose-200/80 dark:border-rose-800/60',
      activeClass: 'bg-rose-500 text-white border-rose-500 dark:bg-rose-400 dark:text-slate-950 shadow-md shadow-rose-500/20',
      badgeBgClass: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
    },
    dental: {
      id: 'dental',
      label: 'Dentists & Orthodontists',
      shortLabel: 'Dentistry',
      color: '#06b6d4',
      textClass: 'text-cyan-700 dark:text-cyan-300',
      bgClass: 'bg-cyan-50/80 dark:bg-cyan-950/40',
      borderClass: 'border-cyan-200/80 dark:border-cyan-800/60',
      activeClass: 'bg-cyan-500 text-white border-cyan-500 dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20',
      badgeBgClass: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200'
    },
    chiropractic: {
      id: 'chiropractic',
      label: 'Chiropractors & Physio',
      shortLabel: 'Chiropractic',
      color: '#0d9488',
      textClass: 'text-teal-700 dark:text-teal-300',
      bgClass: 'bg-teal-50/80 dark:bg-teal-950/40',
      borderClass: 'border-teal-200/80 dark:border-teal-800/60',
      activeClass: 'bg-teal-600 text-white border-teal-600 dark:bg-teal-400 dark:text-slate-950 shadow-md shadow-teal-500/20',
      badgeBgClass: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
    },
    therapy: {
      id: 'therapy',
      label: 'Therapists & Psychologists',
      shortLabel: 'Mental Health',
      color: '#8b5cf6',
      textClass: 'text-violet-700 dark:text-violet-300',
      bgClass: 'bg-violet-50/80 dark:bg-violet-950/40',
      borderClass: 'border-violet-200/80 dark:border-violet-800/60',
      activeClass: 'bg-violet-600 text-white border-violet-600 dark:bg-violet-400 dark:text-slate-950 shadow-md shadow-violet-500/20',
      badgeBgClass: 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200'
    },
    beauty: {
      id: 'beauty',
      label: 'Cosmetology & Esthetics',
      shortLabel: 'Beauty & Skin',
      color: '#d946ef',
      textClass: 'text-fuchsia-700 dark:text-fuchsia-300',
      bgClass: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/40',
      borderClass: 'border-fuchsia-200/80 dark:border-fuchsia-800/60',
      activeClass: 'bg-fuchsia-500 text-white border-fuchsia-500 dark:bg-fuchsia-400 dark:text-slate-950 shadow-md shadow-fuchsia-500/20',
      badgeBgClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-800 dark:text-fuchsia-200'
    },
    veterinary: {
      id: 'veterinary',
      label: 'Veterinarians & Animal Care',
      shortLabel: 'Veterinary',
      color: '#059669',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200/80 dark:border-emerald-800/60',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-400 dark:text-slate-950 shadow-md shadow-emerald-500/20',
      badgeBgClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
    },
    legal: {
      id: 'legal',
      label: 'Attorneys & Legal Counsel',
      shortLabel: 'Legal Counsel',
      color: '#4f46e5',
      textClass: 'text-indigo-700 dark:text-indigo-300',
      bgClass: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      borderClass: 'border-indigo-200/80 dark:border-indigo-800/60',
      activeClass: 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-400 dark:text-slate-950 shadow-md shadow-indigo-500/20',
      badgeBgClass: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
    },
    financial_advisor: {
      id: 'financial_advisor',
      label: 'Financial Advisors & Wealth Planners',
      shortLabel: 'Wealth & CFP',
      color: '#16a34a',
      textClass: 'text-green-700 dark:text-green-300',
      bgClass: 'bg-green-50/80 dark:bg-green-950/40',
      borderClass: 'border-green-200/80 dark:border-green-800/60',
      activeClass: 'bg-green-600 text-white border-green-600 dark:bg-green-400 dark:text-slate-950 shadow-md shadow-green-500/20',
      badgeBgClass: 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200'
    },
    finance: {
      id: 'finance',
      label: 'CPAs & Tax Strategists',
      shortLabel: 'CPAs & Tax',
      color: '#0284c7',
      textClass: 'text-sky-700 dark:text-sky-300',
      bgClass: 'bg-sky-50/80 dark:bg-sky-950/40',
      borderClass: 'border-sky-200/80 dark:border-sky-800/60',
      activeClass: 'bg-sky-600 text-white border-sky-600 dark:bg-sky-400 dark:text-slate-950 shadow-md shadow-sky-500/20',
      badgeBgClass: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200'
    },
    insurance: {
      id: 'insurance',
      label: 'Insurance & Risk Brokers',
      shortLabel: 'Insurance',
      color: '#2563eb',
      textClass: 'text-blue-700 dark:text-blue-300',
      bgClass: 'bg-blue-50/80 dark:bg-blue-950/40',
      borderClass: 'border-blue-200/80 dark:border-blue-800/60',
      activeClass: 'bg-blue-600 text-white border-blue-600 dark:bg-blue-400 dark:text-slate-950 shadow-md shadow-blue-500/20',
      badgeBgClass: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
    },
    trade: {
      id: 'trade',
      label: 'Electricians, Plumbers & HVAC',
      shortLabel: 'Master Trades',
      color: '#ea580c',
      textClass: 'text-orange-700 dark:text-orange-300',
      bgClass: 'bg-orange-50/80 dark:bg-orange-950/40',
      borderClass: 'border-orange-200/80 dark:border-orange-800/60',
      activeClass: 'bg-orange-600 text-white border-orange-600 dark:bg-orange-400 dark:text-slate-950 shadow-md shadow-orange-500/20',
      badgeBgClass: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200'
    },
    architecture: {
      id: 'architecture',
      label: 'Architects & Interior Designers',
      shortLabel: 'Architecture',
      color: '#9333ea',
      textClass: 'text-purple-700 dark:text-purple-300',
      bgClass: 'bg-purple-50/80 dark:bg-purple-950/40',
      borderClass: 'border-purple-200/80 dark:border-purple-800/60',
      activeClass: 'bg-purple-600 text-white border-purple-600 dark:bg-purple-400 dark:text-slate-950 shadow-md shadow-purple-500/20',
      badgeBgClass: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200'
    }
  };

  interface Props {
    profession?: ProfessionCategory | 'all' | string;
    variant?: 'badge' | 'chip' | 'pill' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    active?: boolean;
    count?: number;
    showLabel?: boolean;
    useShortLabel?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    profession = 'all',
    variant = 'badge',
    size = 'sm',
    active = false,
    count,
    showLabel = true,
    useShortLabel = true,
    class: className = '',
    onclick
  }: Props = $props();

  const config = $derived(
    INDUSTRY_VISUAL_CONFIGS[profession] || {
      id: profession as any,
      label: PROFESSION_CONFIGS[profession as ProfessionCategory]?.label || profession,
      shortLabel: PROFESSION_CONFIGS[profession as ProfessionCategory]?.label || profession,
      color: '#10b981',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200 dark:border-emerald-800/60',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-slate-950',
      badgeBgClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
    }
  );

  const displayLabel = $derived(
    useShortLabel ? config.shortLabel : config.label
  );

  const sizeClasses = $derived({
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size]);

  const iconSizes = $derived({
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5'
  }[size]);
</script>

{#if variant === 'icon-only'}
  <div
    class={twMerge(
      clsx(
        'inline-flex items-center justify-center rounded-lg border transition-all shrink-0',
        active ? config.activeClass : `${config.bgClass} ${config.textClass} ${config.borderClass}`,
        size === 'sm' ? 'w-6 h-6 p-1' : size === 'md' ? 'w-8 h-8 p-1.5' : 'w-10 h-10 p-2',
        className
      )
    )}
    title={config.label}
  >
    <IndustryIcon {profession} class={iconSizes} />
  </div>
{:else if variant === 'chip'}
  <button
    type="button"
    {onclick}
    class={twMerge(
      clsx(
        'inline-flex items-center rounded-xl font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap select-none shrink-0',
        sizeClasses,
        active
          ? `${config.activeClass} font-bold ring-2 ring-emerald-500/20`
          : `${config.bgClass} ${config.textClass} ${config.borderClass} hover:opacity-90 hover:shadow-xs active:scale-98`,
        className
      )
    )}
    title={config.label}
  >
    <IndustryIcon {profession} class="{iconSizes} shrink-0" />
    {#if showLabel}
      <span>{displayLabel}</span>
    {/if}
    {#if count !== undefined}
      <span
        class={clsx(
          'ml-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold leading-tight',
          active
            ? 'bg-white/20 text-white dark:bg-black/30 dark:text-slate-950'
            : config.badgeBgClass
        )}
      >
        {count}
      </span>
    {/if}
  </button>
{:else}
  <span
    class={twMerge(
      clsx(
        'inline-flex items-center rounded-lg font-medium border transition-colors shrink-0',
        sizeClasses,
        `${config.bgClass} ${config.textClass} ${config.borderClass}`,
        className
      )
    )}
  >
    <IndustryIcon {profession} class="{iconSizes} shrink-0" />
    {#if showLabel}
      <span class="truncate">{displayLabel}</span>
    {/if}
  </span>
{/if}
