<script lang="ts">
  import { formatCount } from '../../services/pilot-report/pilot-report-format';
  import type { PilotAgents } from '../../services/pilot-report/types';

  interface Props {
    agents: PilotAgents;
  }

  let { agents }: Props = $props();
</script>

{#if agents.available}
  <div class="overflow-x-auto">
    <table class="w-full text-xs">
      <thead>
        <tr class="border-b border-[var(--fm-border)] text-[var(--fm-text-muted)] uppercase tracking-wider">
          <th scope="col" class="px-3 py-2 text-left font-semibold">Week starting (Monday)</th>
          <th scope="col" class="px-3 py-2 text-right font-semibold">Agents delivered</th>
        </tr>
      </thead>
      <tbody>
        {#each agents.weeks as week (week.weekStart)}
          <tr class="border-b border-[var(--fm-border)]/60 text-[var(--fm-text)]">
            <th scope="row" class="px-3 py-2.5 text-left font-mono font-normal">{week.weekStart}</th>
            <td class="px-3 py-2.5 text-right font-mono tabular-nums">{formatCount(week.delivered)}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="text-[var(--fm-text)] font-bold">
          <th scope="row" class="px-3 py-2.5 text-left">Month total</th>
          <td class="px-3 py-2.5 text-right font-mono tabular-nums">{formatCount(agents.total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  {#if agents.total === 0}
    <p class="text-xs text-[var(--fm-text-muted)] mt-3">No agents were delivered in this month.</p>
  {/if}
{:else}
  <p class="text-sm text-[var(--fm-text-muted)]">
    Not available yet. {agents.reason}
  </p>
{/if}
