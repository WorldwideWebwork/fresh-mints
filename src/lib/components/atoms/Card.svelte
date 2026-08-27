<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    class?: string;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    class: className = '',
    children,
    onclick,
  }: Props = $props();

  const classes = $derived(
    twMerge(
      clsx(
        'rounded-2xl p-5 bg-[var(--fm-surface)] border border-[var(--fm-border)] shadow-sm dark:shadow-lg dark:shadow-black/40',
        className
      )
    )
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={classes} {onclick}>
  {#if children}
    {@render children()}
  {/if}
</div>
