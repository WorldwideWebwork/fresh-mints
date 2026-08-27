<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    maxWidth?: string;
    onclose?: () => void;
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    title = '',
    description = '',
    maxWidth = 'max-w-2xl',
    onclose,
    children,
  }: Props = $props();

  function close() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      onclick={close}
    ></div>

    <!-- Modal Content -->
    <div
      class="relative w-full {maxWidth} bg-[var(--fm-surface)] border border-[var(--fm-border)]/90 rounded-2xl shadow-2xl dark:shadow-black/80 z-10 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-dialog-enter"
    >
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--fm-border)]/80 bg-[var(--fm-surface)]/60">
          <div>
            <h3 class="text-base font-semibold text-[var(--fm-text)]">{title}</h3>
            {#if description}
              <p class="text-xs text-[var(--fm-text-secondary)] mt-0.5">{description}</p>
            {/if}
          </div>
          <button
            type="button"
            onclick={close}
            class="p-1.5 rounded-lg text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      {/if}

      <div class="p-6 overflow-y-auto custom-scrollbar flex-grow">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}
