<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children?: Snippet;
  }

  let { text, position = 'top', children }: Props = $props();

  const positionStyles = {
    top: 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
    left: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
    right: 'left-full ml-1.5 top-1/2 -translate-y-1/2',
  };
</script>

<div class="relative group/tooltip inline-flex items-center">
  {#if children}
    {@render children()}
  {/if}
  {#if text}
    <div
      role="tooltip"
      class="pointer-events-none absolute {positionStyles[position]} opacity-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-all duration-75 ease-out scale-95 group-hover/tooltip:scale-100 z-50 px-2 py-1 text-[11px] font-medium text-[var(--fm-text)] bg-[var(--fm-surface)]/95 border border-[var(--fm-border)]/90 rounded-md shadow-2xl whitespace-nowrap backdrop-blur-md"
    >
      {text}
    </div>
  {/if}
</div>
