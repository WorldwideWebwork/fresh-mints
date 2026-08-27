<script lang="ts">
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import { AlertTriangle } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    onconfirm?: () => void;
    oncancel?: () => void;
  }

  let {
    open = $bindable(false),
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onconfirm,
    oncancel,
  }: Props = $props();

  function handleConfirm() {
    onconfirm?.();
    open = false;
  }

  function handleCancel() {
    oncancel?.();
    open = false;
  }
</script>

<Dialog bind:open {title} maxWidth="max-w-md" onclose={handleCancel}>
  <div class="flex items-start gap-4">
    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
      <AlertTriangle class="w-6 h-6" />
    </div>
    <div>
      <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </div>
  </div>

  <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
    <Button variant="secondary" size="sm" onclick={handleCancel}>
      {cancelText}
    </Button>
    <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" onclick={handleConfirm}>
      {confirmText}
    </Button>
  </div>
</Dialog>
