<script lang="ts">
  import type { Lead } from '../../types/lead';
  import { buildValuationBreakdown } from '../../services/valuation-breakdown';
  import { buildValuationNotices, buildValuationRows } from '../../services/valuation-rows';
  import Dialog from '../atoms/Dialog.svelte';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import DataList from '../atoms/DataList.svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
  }

  let { open = $bindable(false), lead = null, onclose }: Props = $props();

  const breakdown = $derived(lead ? buildValuationBreakdown(lead) : null);
  const rows = $derived(breakdown ? buildValuationRows(breakdown) : null);
  const notices = $derived(lead && breakdown ? buildValuationNotices(lead, breakdown) : []);
  const description = $derived(lead ? `${lead.fullName}: how the deal value and your margin add up` : '');

  function handleClose() {
    open = false;
    onclose?.();
  }
</script>

<Dialog bind:open {onclose} title="Why this value?" {description} maxWidth="max-w-xl">
  {#if rows}
    {#each notices as notice (notice.id)}
      <Card class="mb-4 p-4 text-xs leading-relaxed">
        <Badge variant={notice.variant} class="mr-2">{notice.badge}</Badge>
        {notice.message}
      </Card>
    {/each}

    <Card class="mb-4 p-4">
      <DataList title="Deal value" rows={rows.deal} />
    </Card>

    <Card class="mb-4 p-4">
      <DataList title="Margin on the standard package" rows={rows.margin} />
    </Card>

    <Button variant="ghost" size="sm" onclick={handleClose} class="w-full">Close</Button>
  {/if}
</Dialog>
