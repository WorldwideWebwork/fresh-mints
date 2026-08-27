<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface OptionItem {
    value: string;
    label: string;
  }

  interface Props {
    value?: string;
    options?: OptionItem[];
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
    children?: Snippet;
  }

  let {
    value = $bindable(''),
    options = [],
    placeholder = '',
    disabled = false,
    class: className = '',
    onchange,
    children,
  }: Props = $props();

  const classes = $derived(
    twMerge(
      clsx(
        'w-full bg-[var(--fm-surface)] text-[var(--fm-text)] border border-[var(--fm-border)] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20fill=\'none\'%20viewBox=\'0 0%2020%2020\'%3E%3Cpath%20stroke=\'%2394a3b8\'%20stroke-linecap=\'round\'%20stroke-linejoin=\'round\'%20stroke-width=\'1.5\'%20d=\'m6%208%204%204%204-4\'/%3E%3C/svg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8',
        className
      )
    )
  );
</script>

<select
  bind:value={value}
  {disabled}
  class={classes}
  {onchange}
>
  {#if placeholder}
    <option value="" disabled selected={!value} class="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">{placeholder}</option>
  {/if}
  {#each options as opt}
    <option value={opt.value} selected={opt.value === value} class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{opt.label}</option>
  {/each}
  {#if children}
    {@render children()}
  {/if}
</select>
