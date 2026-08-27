<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { BombBagService, type BombBagList } from '../../services/bomb-bag-service';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Settings, Save, Trash2, CheckCircle2, ShieldCheck, Mail, Globe, Sparkles } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onopenconfirmclear?: () => void;
    onclose?: () => void;
  }

  let { open = $bindable(false), onopenconfirmclear, onclose }: Props = $props();

  let tempQuantity = $state(leadStore.fetchQuantity);
  let tempWebhook = $state(leadStore.webhookUrl);
  let bombBagLists = $state<BombBagList[]>([]);
  let selectedBombBagList = $state<string>('');
  let autoSyncBombBag = $state(false);

  $effect(() => {
    if (open) {
      tempQuantity = leadStore.fetchQuantity;
      tempWebhook = leadStore.webhookUrl;
      loadBombBagLists();
    }
  });

  async function loadBombBagLists() {
    try {
      bombBagLists = await BombBagService.getLists();
    } catch (e) {
      // Ignore
    }
  }

  const quantityOptions = [
    { value: '10', label: '10 Leads per query' },
    { value: '25', label: '25 Leads per query' },
    { value: '50', label: '50 Leads per query' },
    { value: '100', label: '100 Leads per query' },
  ];

  const listOptions = $derived.by(() => {
    const defaultOpt = [{ value: '', label: 'Master List: Fresh Mints: All Leads (Auto)' }];
    const fetchedOpts = bombBagLists.map((l) => ({
      value: String(l.id),
      label: `${l.name} (${l.subscriber_count} contacts)`,
    }));
    return [...defaultOpt, ...fetchedOpts];
  });

  function handleSave() {
    leadStore.setFetchQuantity(tempQuantity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('licensify_crm_webhook', tempWebhook);
      localStorage.setItem('fm_default_bomb_bag_list', selectedBombBagList);
    }
    toast.success('Settings saved successfully!');
    open = false;
    onclose?.();
  }
</script>

<Dialog bind:open {onclose} title="Fresh Mints Application Settings" description="Configure registry discovery defaults, Bomb Bag marketing, and Questbook CRM connection" maxWidth="max-w-lg">
  <div class="space-y-5">
    <!-- Questbook CRM & Bomb Bag Status Badges -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Questbook CRM</span>
          <Badge variant="success">Connected</Badge>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Syncs leads directly to <code class="text-emerald-600 dark:text-emerald-400 font-mono">questbook_contact</code>.
        </p>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Bomb Bag News Flash</span>
          <Badge variant="info">Journeys Active</Badge>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Syncs subscribers and triggers marketing automation.
        </p>
      </div>
    </div>

    <!-- Bomb Bag Target List -->
    <div>
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Bomb Bag Marketing List:</label>
      <Select
        bind:value={selectedBombBagList}
        options={listOptions}
        class="text-xs"
      />
    </div>

    <!-- Default Fetch Size -->
    <div>
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Batch Discovery Limit:</label>
      <Select
        bind:value={tempQuantity as any}
        options={quantityOptions}
        class="text-xs"
      />
    </div>

    <!-- External Webhook URL -->
    <div>
      <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">External Webhook URL (Zapier, HubSpot, Make):</label>
      <Input
        bind:value={tempWebhook}
        placeholder="https://hooks.zapier.com/hooks/catch/..."
        class="text-xs"
      />
    </div>

    <!-- Clear All Data -->
    <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div>
        <div class="text-xs font-semibold text-slate-700 dark:text-slate-300">Local Database Storage</div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400">IndexedDB ({leadStore.leads.length} leads stored)</div>
      </div>
      <Button
        variant="danger"
        size="sm"
        onclick={() => {
          open = false;
          onclose?.();
          onopenconfirmclear?.();
        }}
        class="text-xs px-2.5"
      >
        <Trash2 class="w-3.5 h-3.5 mr-1" />
        <span>Clear All Leads</span>
      </Button>
    </div>

    <!-- Action Buttons -->
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
      <Button variant="primary" size="sm" onclick={handleSave} class="gap-1.5 text-xs font-semibold">
        <Save class="w-3.5 h-3.5" />
        <span>Save Settings</span>
      </Button>
    </div>
  </div>
</Dialog>
