<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    class: className = '',
    onclick,
    children,
    ...rest
  }: Props = $props();

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 border border-emerald-500/30',
    secondary: 'bg-[var(--fm-surface)] hover:bg-[var(--fm-surface)]/80 text-[var(--fm-text)] border border-[var(--fm-border)]/60',
    outline: 'bg-transparent hover:bg-[var(--fm-surface)]/60 text-[var(--fm-text)] border border-[var(--fm-border)]/70',
    ghost: 'bg-transparent hover:bg-[var(--fm-surface)]/50 text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30',
    success: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
    icon: 'p-2 rounded-xl aspect-square',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none active:scale-[0.98]',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )
    )
  );
</script>

<button
  {type}
  class={classes}
  disabled={disabled || loading}
  {onclick}
  {...rest}
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>
