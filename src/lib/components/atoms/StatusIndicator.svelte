<script lang="ts">
  import type { OutreachStatus, SkipTraceStatus } from '../../types/lead';

  interface Props {
    status: OutreachStatus | SkipTraceStatus | string;
    type?: 'outreach' | 'skiptrace';
  }

  let { status, type = 'outreach' }: Props = $props();

  const config = $derived.by(() => {
    switch (status) {
      case 'Uncontacted':
        return { dot: 'bg-[var(--fm-text-muted)]', text: 'text-[var(--fm-text-secondary)]', label: 'Uncontacted' };
      case 'Skip Traced':
      case 'Traced':
        return { dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-600 dark:text-emerald-400', label: 'Skip Traced' };
      case 'Site Built':
        return { dot: 'bg-cyan-400', text: 'text-cyan-600 dark:text-cyan-400', label: 'Site Built' };
      case 'Outreach Sent':
        return { dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400', label: 'Outreach Sent' };
      case 'In Discussion':
        return { dot: 'bg-purple-400', text: 'text-purple-600 dark:text-purple-400', label: 'In Discussion' };
      case 'Client Won':
        return { dot: 'bg-emerald-300', text: 'text-emerald-700 dark:text-emerald-300 font-bold', label: 'Client Won' };
      case 'Declined':
        return { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Declined' };
      case 'In Progress':
        return { dot: 'bg-amber-400 animate-ping', text: 'text-amber-600 dark:text-amber-300', label: 'Tracing...' };
      case 'Not Traced':
        return { dot: 'bg-[var(--fm-text-secondary)]', text: 'text-[var(--fm-text-muted)]', label: 'Untraced' };
      default:
        return { dot: 'bg-[var(--fm-text-muted)]', text: 'text-[var(--fm-text-secondary)]', label: status };
    }
  });
</script>

<div class="inline-flex items-center gap-1.5 text-xs font-medium {config.text}">
  <span class="w-2 h-2 rounded-full {config.dot}"></span>
  <span>{config.label}</span>
</div>
