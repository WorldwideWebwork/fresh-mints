<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {#if children}
    {@render children()}
  {/if}
</div>
