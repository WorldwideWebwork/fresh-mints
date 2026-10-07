<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    onsubmit?: () => void;
    children?: Snippet;
    actions?: Snippet;
  }

  let { onsubmit, children, actions }: Props = $props();

  // Validation messages come from the caller, so native browser bubbles are off.
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onsubmit?.();
  }
</script>

<form novalidate class="space-y-4" onsubmit={handleSubmit}>
  {#if children}
    {@render children()}
  {/if}

  {#if actions}
    <div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--fm-border)]/80">
      {@render actions()}
    </div>
  {/if}
</form>
