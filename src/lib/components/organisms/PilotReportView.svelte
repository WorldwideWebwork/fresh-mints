<script lang="ts">
  import Card from '../atoms/Card.svelte';
  import Button from '../atoms/Button.svelte';
  import Select from '../atoms/Select.svelte';
  import StatCard from '../molecules/StatCard.svelte';
  import PilotPlatformTable from '../molecules/PilotPlatformTable.svelte';
  import PilotAgentsWeekly from '../molecules/PilotAgentsWeekly.svelte';
  import { saveTextFile } from '../../services/pilot-report/csv-download';
  import { currentMonth, monthLabel, recentMonths } from '../../services/pilot-report/pilot-report-months';
  import {
    PILOT_RATE_PER_LEAD,
    describeWindow,
    formatCount,
    formatInvoice,
    hasActivity,
  } from '../../services/pilot-report/pilot-report-format';
  import { fetchBillableExport, fetchPilotReport } from '../../services/pilot-report/pilot-report-service';
  import type { PilotReport } from '../../services/pilot-report/types';
  import { ClipboardCheck, Download, FileText, Mail, MessageSquareReply, RefreshCw, Search } from 'lucide-svelte';

  type ViewState =
    | { status: 'loading' }
    | { status: 'ready'; report: PilotReport }
    | { status: 'forbidden' | 'failed'; reason: string };

  const monthOptions = recentMonths(new Date());

  let month = $state(currentMonth(new Date()));
  let view = $state<ViewState>({ status: 'loading' });
  let isExporting = $state(false);
  let exportProblem = $state('');
  let latestRequest = 0;

  const load = async (target: string) => {
    const request = ++latestRequest;
    view = { status: 'loading' };
    exportProblem = '';
    const outcome = await fetchPilotReport(target);
    const isStale = request !== latestRequest;
    if (isStale) {
      return;
    }
    view = outcome.status === 'ok' ? { status: 'ready', report: outcome.report } : outcome;
  };

  $effect(() => {
    void load(month);
  });

  const downloadBillable = async () => {
    isExporting = true;
    exportProblem = '';
    const outcome = await fetchBillableExport(month);
    isExporting = false;
    const isMade = outcome.status === 'ok';
    if (isMade) {
      saveTextFile(outcome.export.filename, outcome.export.csv);
      return;
    }
    exportProblem = outcome.reason;
  };

  const billable = $derived(view.status === 'ready' ? view.report.totals.billableLeads : null);
  const canExport = $derived(billable !== null && billable > 0 && !isExporting);
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="space-y-1">
      <h2 class="text-lg font-black tracking-tight text-[var(--fm-text)] flex items-center gap-2">
        <ClipboardCheck class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <span>Pilot report</span>
      </h2>
      <p class="text-xs text-[var(--fm-text-muted)]">
        Posts found, replies sent, opt-ins and billable leads for the month. Real counts only.
      </p>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <label class="space-y-1 block">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-[var(--fm-text-muted)]">Month</span>
        <Select bind:value={month} options={monthOptions} class="min-w-44" />
      </label>
      <Button variant="outline" onclick={() => load(month)} disabled={view.status === 'loading'}>
        <RefreshCw class="w-4 h-4" />
        <span>Refresh</span>
      </Button>
      <Button onclick={downloadBillable} disabled={!canExport} loading={isExporting}>
        <Download class="w-4 h-4" />
        <span>Billable leads (CSV)</span>
      </Button>
    </div>
  </div>

  {#if exportProblem}
    <p role="alert" class="text-xs text-rose-600 dark:text-rose-400">The CSV could not be made: {exportProblem}</p>
  {/if}

  {#if view.status === 'loading'}
    <Card class="p-6 text-sm text-[var(--fm-text-muted)]">Loading {monthLabel(month)}...</Card>
  {:else if view.status === 'forbidden' || view.status === 'failed'}
    <Card class="p-6 space-y-2">
      <h3 class="text-sm font-bold text-[var(--fm-text)]">
        {view.status === 'forbidden' ? 'Administrator access needed' : 'The report could not be loaded'}
      </h3>
      <p role="alert" class="text-sm text-[var(--fm-text-muted)]">{view.reason}</p>
    </Card>
  {:else}
    {@const report = view.report}
    {@const totals = report.totals}

    {#if !hasActivity(report)}
      <Card class="p-6 space-y-1">
        <h3 class="text-sm font-bold text-[var(--fm-text)]">Nothing recorded for {monthLabel(month)}</h3>
        <p class="text-sm text-[var(--fm-text-muted)]">
          No searches, replies, opt-ins or delivered agents were counted in this month. The table below shows the
          zeros.
        </p>
      </Card>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Posts found"
        value={formatCount(totals.postsFound)}
        subtext={`${formatCount(totals.searches)} searches on the server`}
        icon={Search}
        accentColor="cyan"
      />
      <StatCard
        title="Replies sent"
        value={formatCount(totals.repliesSent)}
        subtext={`${formatCount(totals.repliesViaWebhook)} through the dispatch webhook`}
        icon={MessageSquareReply}
        accentColor="purple"
      />
      <StatCard
        title="Opt-ins"
        value={formatCount(totals.optIns)}
        subtext={`${formatCount(totals.optInsCallText)} agreed to calls and texts`}
        icon={Mail}
        accentColor="amber"
      />
      <StatCard
        title="Billable leads"
        value={formatCount(totals.billableLeads)}
        subtext={`${formatInvoice(totals.billableLeads)} at $${PILOT_RATE_PER_LEAD} a lead`}
        icon={FileText}
        accentColor="emerald"
      />
    </div>

    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-[var(--fm-text)] uppercase tracking-wider">By source, {monthLabel(month)}</h3>
      <PilotPlatformTable platforms={report.platforms} {totals} />
      <p class="text-[11px] text-[var(--fm-text-muted)]">
        Counted from {describeWindow(report.range)}. "n/a" means the report cannot know that number: the source is not
        connected, or that platform's searches do not run on the server.
      </p>
      {#if !report.sources.events.available}
        <p class="text-xs text-rose-600 dark:text-rose-400">Posts and replies are not available: {report.sources.events.reason}</p>
      {/if}
      {#if !report.sources.leadMagnet.available}
        <p class="text-xs text-rose-600 dark:text-rose-400">Opt-ins and billable leads are not available: {report.sources.leadMagnet.reason}</p>
      {/if}
    </Card>

    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-[var(--fm-text)] uppercase tracking-wider">Agents delivered per week</h3>
      <PilotAgentsWeekly agents={report.agents} />
    </Card>

    <Card class="p-6 space-y-2">
      <h3 class="text-sm font-bold text-[var(--fm-text)] uppercase tracking-wider">How these are counted</h3>
      <ul class="list-disc pl-5 space-y-1 text-xs text-[var(--fm-text-muted)]">
        <li>Posts found: posts each search returned, added up per search. A post that two searches both return counts twice.</li>
        <li>Replies sent: social leads whose reply was dispatched, once per lead. If no dispatch webhook is set up, the reply is copied for you to paste and still counts.</li>
        <li>Opt-ins: leads the Lead Magnet capture page stored in the month. Replies bring them in through the guide link; every other sign-up shows as "Other sources".</li>
        <li>Billable leads: opt-ins that agreed to calls and texts, with a valid US phone and email, once per email address in the month{totals.duplicatesExcluded ? ` (${formatCount(totals.duplicatesExcluded)} repeat sign-ups left out)` : ''}. Remove test sign-ups before invoicing.</li>
      </ul>
    </Card>
  {/if}
</div>
