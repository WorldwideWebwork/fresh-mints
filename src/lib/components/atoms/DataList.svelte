<script lang="ts">
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Row {
    label: string;
    value: string;
    hint?: string;
    isEmphasized?: boolean;
  }

  interface Props {
    rows: Row[];
    title?: string;
    class?: string;
  }

  let { rows, title = '', class: className = '' }: Props = $props();

  const valueStyles = {
    regular: 'text-sm tabular-nums text-[var(--fm-text)]',
    emphasized: 'text-sm tabular-nums font-bold text-emerald-700 dark:text-emerald-300',
  };

  const classes = $derived(twMerge(clsx('space-y-1', className)));
</script>

<div class={classes}>
  {#if title}
    <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--fm-text-secondary)]">{title}</h4>
  {/if}

  <dl class="divide-y divide-[var(--fm-border)]/60">
    {#each rows as row (row.label)}
      <div class="flex items-baseline justify-between gap-4 py-2">
        <dt class="text-xs text-[var(--fm-text-secondary)]">
          {row.label}
          {#if row.hint}
            <span class="block text-[11px] text-[var(--fm-text-muted)]">{row.hint}</span>
          {/if}
        </dt>
        <dd class={valueStyles[row.isEmphasized ? 'emphasized' : 'regular']}>{row.value}</dd>
      </div>
    {/each}
  </dl>
</div>
