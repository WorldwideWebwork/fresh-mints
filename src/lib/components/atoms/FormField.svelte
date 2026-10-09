<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    error?: string;
    required?: boolean;
    children?: Snippet;
  }

  let { label, error = '', required = false, children }: Props = $props();

  const errorId = `field-error-${Math.random().toString(36).substring(2, 8)}`;

  function wireAria(node: HTMLElement, currentError: string) {
    function apply(err: string) {
      const control = node.querySelector<HTMLElement>('input, select, textarea');
      if (!control) return;
      if (err) {
        control.setAttribute('aria-describedby', errorId);
        control.setAttribute('aria-invalid', 'true');
      } else {
        control.removeAttribute('aria-describedby');
        control.removeAttribute('aria-invalid');
      }
    }

    requestAnimationFrame(() => apply(currentError));

    return {
      update(newError: string) {
        apply(newError);
      },
      destroy() {
        const control = node.querySelector<HTMLElement>('input, select, textarea');
        if (control) {
          control.removeAttribute('aria-describedby');
          control.removeAttribute('aria-invalid');
        }
      },
    };
  }
</script>

<div class="space-y-1">
  <!-- The control sits inside its label, so the pair is associated without ids. -->
  <label class="block" use:wireAria={error}>
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
    <p id={errorId} role="alert" class="text-xs text-rose-600 dark:text-rose-400">{error}</p>
  {/if}
</div>
