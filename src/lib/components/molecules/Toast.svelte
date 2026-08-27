<script lang="ts">
  import { toast } from '../../stores/toast.svelte';
  import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Loader2 } from 'lucide-svelte';
</script>

{#if toast.toasts.length > 0}
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
    {#each toast.toasts as item (item.id)}
      <div
        class="pointer-events-auto relative flex items-start gap-3.5 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 {item.type === 'success' ? 'bg-white dark:bg-slate-950/95 border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-white shadow-emerald-950/30' : item.type === 'error' ? 'bg-white dark:bg-slate-950/95 border-rose-300 dark:border-rose-500/40 text-slate-900 dark:text-white shadow-rose-950/30' : item.type === 'warning' ? 'bg-white dark:bg-slate-950/95 border-amber-300 dark:border-amber-500/40 text-slate-900 dark:text-white shadow-amber-950/30' : item.type === 'loading' ? 'bg-white dark:bg-slate-950/95 border-emerald-200 dark:border-emerald-500/30 text-slate-900 dark:text-white shadow-emerald-950/20' : 'bg-white dark:bg-slate-950/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-black/60'}"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          {#if item.type === 'success'}
            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          {:else if item.type === 'error'}
            <AlertCircle class="w-4 h-4 text-rose-400" />
          {:else if item.type === 'warning'}
            <AlertTriangle class="w-4 h-4 text-amber-400" />
          {:else if item.type === 'loading'}
            <Loader2 class="w-4 h-4 text-emerald-400 animate-spin" />
          {:else}
            <Info class="w-4 h-4 text-sky-400" />
          {/if}
        </div>

        <!-- Content -->
        <div class="flex-grow min-w-0 pr-1">
          <div class="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">{item.title}</div>
          {#if item.description}
            <div class="text-[11px] text-slate-600 dark:text-slate-300/90 mt-0.5 leading-relaxed break-words font-sans">{item.description}</div>
          {/if}

          {#if item.action}
            <div class="mt-2">
              <button
                type="button"
                onclick={() => {
                  item.action?.onClick();
                  toast.dismiss(item.id);
                }}
                class="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {item.action.label}
              </button>
            </div>
          {/if}
        </div>

        <!-- Dismiss Button -->
        <button
          type="button"
          onclick={() => toast.dismiss(item.id)}
          aria-label="Dismiss notification"
          class="flex-shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer -mr-1 -mt-1"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    {/each}
  </div>
{/if}

