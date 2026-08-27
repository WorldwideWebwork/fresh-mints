<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import { Upload, FileText, CheckCircle2 } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  let csvContent = $state('');
  let isImporting = $state(false);

  async function handleImport() {
    if (!csvContent.trim()) {
      toast.warning('Please paste CSV contents or upload a file first.');
      return;
    }

    isImporting = true;
    try {
      const count = await leadStore.importFromCSV(csvContent);
      toast.success(`Successfully imported ${count} leads!`);
      csvContent = '';
      open = false;
      onclose?.();
    } catch (e: any) {
      toast.error('Import failed', e.message);
    } finally {
      isImporting = false;
    }
  }

  function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      csvContent = (event.target?.result as string) || '';
    };
    reader.readAsText(file);
  }
</script>

<Dialog bind:open {onclose} title="Import Leads via CSV" description="Bulk upload newly licensed practitioner rosters" maxWidth="max-w-2xl">
  <div class="space-y-4">
    <!-- File Drop Area -->
    <label class="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-950/60 group">
      <Upload class="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors mb-2" />
      <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Click to upload or drag .csv file here</span>
      <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supports Full Name, State, City, License Number, School, Profession</span>
      <input type="file" accept=".csv" class="hidden" onchange={handleFileUpload} />
    </label>

    <!-- Paste Box -->
    <div>
      <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Or paste raw CSV text:</label>
      <textarea
        bind:value={csvContent}
        rows={7}
        placeholder="Full Name,Profession,State,City,License Number,College / Board School..."
        class="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-emerald-500/80 custom-scrollbar"
      ></textarea>
    </div>

    <!-- Actions -->
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
      <Button variant="primary" size="sm" onclick={handleImport} loading={isImporting} class="gap-1.5 text-xs">
        <CheckCircle2 class="w-3.5 h-3.5" />
        <span>Import Leads</span>
      </Button>
    </div>
  </div>
</Dialog>
