<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'outline';
    size?: 'sm' | 'md';
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children,
  }: Props = $props();

  const variantStyles = {
    default: 'bg-[var(--fm-surface)] text-[var(--fm-text)] border-[var(--fm-border)]/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80',
    outline: 'bg-transparent text-[var(--fm-text-secondary)] border-[var(--fm-border)]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'inline-flex items-center gap-1 border transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.sm,
        className
      )
    )
  );
</script>

<span class={classes}>
  {#if children}
    {@render children()}
  {/if}
</span>
