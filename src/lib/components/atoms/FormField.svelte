<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    error?: string;
    required?: boolean;
    children?: Snippet;
  }

  let { label, error = '', required = false, children }: Props = $props();
</script>

<div class="space-y-1">
  <!-- The control sits inside its label, so the pair is associated without ids. -->
  <label class="block">
    <span class="block text-xs font-semibold text-[var(--fm-text-secondary)] mb-1">
      {label}
      {#if required}
        <span class="text-rose-600 dark:text-rose-400" aria-hidden="true">*</span>
        <span class="sr-only">(required)</span>
      {/if}
    </span>
    {#if children}
      {@render children()}
    {/if}
  </label>

  {#if error}
    <p role="alert" class="text-xs text-rose-600 dark:text-rose-400">{error}</p>
  {/if}
</div>
