<script lang="ts">
  import { formatCount } from '../../services/pilot-report/pilot-report-format';
  import type { PilotPlatformRow, PilotTotals } from '../../services/pilot-report/types';

  interface Props {
    platforms: PilotPlatformRow[];
    totals: PilotTotals;
  }

  let { platforms, totals }: Props = $props();

  const columns = [
    { key: 'postsFound', label: 'Posts found' },
    { key: 'repliesSent', label: 'Replies sent' },
    { key: 'optIns', label: 'Opt-ins' },
    { key: 'optInsCallText', label: 'Call/text consent' },
    { key: 'billableLeads', label: 'Billable leads' },
  ] as const;

  const cellClass = 'px-3 py-2.5 text-right font-mono tabular-nums';
</script>

<div class="overflow-x-auto">
  <table class="w-full text-xs">
    <thead>
      <tr class="border-b border-[var(--fm-border)] text-[var(--fm-text-muted)] uppercase tracking-wider">
        <th scope="col" class="px-3 py-2 text-left font-semibold">Source</th>
        {#each columns as column}
          <th scope="col" class="px-3 py-2 text-right font-semibold">{column.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each platforms as row (row.platform)}
        <tr class="border-b border-[var(--fm-border)]/60 text-[var(--fm-text)]">
          <th scope="row" class="px-3 py-2.5 text-left font-semibold">{row.label}</th>
          {#each columns as column}
            <td class={cellClass}>{formatCount(row[column.key])}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr class="text-[var(--fm-text)] font-bold">
        <th scope="row" class="px-3 py-2.5 text-left">All sources</th>
        {#each columns as column}
          <td class={cellClass}>{formatCount(totals[column.key])}</td>
        {/each}
      </tr>
    </tfoot>
  </table>
</div>
