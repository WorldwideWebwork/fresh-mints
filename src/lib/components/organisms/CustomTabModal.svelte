<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { PROFESSION_CONFIGS, type ProfessionCategory } from '../../types/lead';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import IndustryIcon from '../atoms/IndustryIcon.svelte';
  import IndustryBadge from '../atoms/IndustryBadge.svelte';
  import { Plus } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  let tabLabel = $state('');
  let professionFilter = $state<ProfessionCategory | 'all'>('all');
  let stateFilter = $state('all');

  const professionOptions = [
    { value: 'all', label: 'All Industries (13 High-Value Sectors)' },
    ...Object.values(PROFESSION_CONFIGS).map((p) => ({ value: p.id, label: p.label })),
  ];

  function handleSaveTab() {
    if (!tabLabel.trim()) {
      toast.warning('Please enter a tab title');
      return;
    }

    leadStore.addCustomTab({
      id: `tab-${Date.now()}`,
      label: tabLabel.trim(),
      iconName: 'Bookmark',
      professionFilter,
      stateFilter: stateFilter !== 'all' ? stateFilter : undefined,
    });

    toast.success(`Custom tab "${tabLabel}" created!`);
    tabLabel = '';
    open = false;
    onclose?.();
  }
</script>

<Dialog bind:open {onclose} title="Create Custom View / Preset Tab" description="Save custom filter sets for instant 1-click access" maxWidth="max-w-md">
  <div class="space-y-4">
    <div>
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tab Name:</label>
      <Input bind:value={tabLabel} placeholder="e.g. CA Nurses, Florida Real Estate..." class="text-xs" />
    </div>

    <div>
      <div class="flex items-center justify-between gap-2 mb-1">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Target Sector / Profession:</label>
        {#if professionFilter !== 'all'}
          <IndustryBadge profession={professionFilter} variant="badge" size="sm" />
        {/if}
      </div>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <IndustryIcon profession={professionFilter} class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <Select bind:value={professionFilter} options={professionOptions} class="text-xs pl-9" />
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          open = false;
          onclose?.();
        }}
        class="text-xs text-slate-500 dark:text-slate-400"
      >
        Cancel
      </Button>
      <Button variant="primary" size="sm" onclick={handleSaveTab} class="gap-1.5 text-xs">
        <Plus class="w-3.5 h-3.5" />
        <span>Create Tab</span>
      </Button>
    </div>
  </div>
</Dialog>
