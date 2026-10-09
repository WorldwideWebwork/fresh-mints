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

  let dialogEl = $state<HTMLElement | null>(null);
  let previousActiveElement: HTMLElement | null = null;

  const titleId = `dialog-title-${Math.random().toString(36).substring(2, 8)}`;
  const descId = `dialog-desc-${Math.random().toString(36).substring(2, 8)}`;

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function close() {
    open = false;
    onclose?.();
  }

  $effect(() => {
    if (open) {
      if (typeof document !== 'undefined') {
        previousActiveElement = document.activeElement as HTMLElement | null;
      }
      requestAnimationFrame(() => {
        if (!dialogEl) return;
        const focusable = dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogEl.focus();
        }
      });
    } else {
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
        previousActiveElement = null;
      }
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;

    if (e.key === 'Escape') {
      close();
      return;
    }

    if (e.key === 'Tab' && dialogEl) {
      const focusable = Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !dialogEl.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !dialogEl.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
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
      bind:this={dialogEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      tabindex="-1"
      class="relative w-full {maxWidth} bg-[var(--fm-surface)] border border-[var(--fm-border)]/90 rounded-2xl shadow-2xl dark:shadow-black/80 z-10 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-dialog-enter outline-none"
    >
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--fm-border)]/80 bg-[var(--fm-surface)]/60">
          <div>
            <h3 id={titleId} class="text-base font-semibold text-[var(--fm-text)]">{title}</h3>
            {#if description}
              <p id={descId} class="text-xs text-[var(--fm-text-secondary)] mt-0.5">{description}</p>
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
