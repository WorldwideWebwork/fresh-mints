<script lang="ts">
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { Sparkles, ArrowRight, Database, ShieldCheck, Zap } from "lucide-svelte";
  import Badge from "../atoms/Badge.svelte";

  interface Props {
    isReady?: boolean;
    oncomplete?: () => void;
  }

  let { isReady = false, oncomplete }: Props = $props();

  let progress = $state(0);
  let statusText = $state("Initializing IndexedDB NoSQL lead storage...");
  let canEnter = $state(false);

  onMount(() => {
    const timer1 = setTimeout(() => {
      progress = 35;
      statusText = "Connecting to NPPES & State Professional Registries...";
    }, 250);

    const timer2 = setTimeout(() => {
      progress = 75;
      statusText = "Calibrating Skip-Trace & Turnkey Website Engine...";
    }, 650);

    const timer3 = setTimeout(() => {
      progress = 100;
      statusText = "w⁴ Fresh Mints Ready!";
      canEnter = true;
    }, 1100);

    const timer4 = setTimeout(() => {
      oncomplete?.();
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  });
</script>

<div
  out:fade={{ duration: 400 }}
  class="fixed inset-0 z-[500] flex items-center justify-center bg-[var(--fm-bg)] text-[var(--fm-text)] p-6 transition-colors duration-300 select-none overflow-hidden"
>
  <!-- Ambient background glow elements -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
    <div class="w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
    <div class="w-[300px] h-[300px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-2xl"></div>
  </div>

  <div class="max-w-md w-full flex flex-col items-center text-center relative z-10">
    <!-- Animated App Emblem -->
    <div
      in:scale={{ duration: 500, start: 0.85 }}
      class="mb-6 relative flex items-center justify-center"
    >
      <!-- Glowing Emblem Box -->
      <div
        class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-xl shadow-emerald-500/30 dark:shadow-emerald-950/60 relative z-10"
      >
        <Sparkles class="w-10 h-10 animate-pulse" />
      </div>

      <!-- Rotating Accent Orbit Ring -->
      <div
        class="absolute -inset-3.5 rounded-3xl border-2 border-dashed border-emerald-400/40 dark:border-emerald-500/30 pointer-events-none animate-[spin_10s_linear_infinite]"
      ></div>
    </div>

    <!-- Title & Brand Header -->
    <div class="flex items-center justify-center gap-2 mb-1.5">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--fm-text)] m-0">
        w<sup>4</sup> Fresh Mints
      </h1>
      <Badge variant="success" class="text-[10px] uppercase font-mono tracking-wider">
        w<sup>4</sup> Live
      </Badge>
    </div>

    <p class="text-xs sm:text-sm text-[var(--fm-text-muted)] font-medium max-w-sm">
      Turnkey Practice Launch &amp; Lead Skip-Tracing Platform
    </p>

    <!-- Subsystem Highlights -->
    <div class="mt-6 flex items-center gap-3 px-3 py-1.5 rounded-full bg-[var(--fm-surface)] border border-[var(--fm-border)] shadow-xs">
      <div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <Database class="w-3 h-3" />
        <span>NPPES / FINRA</span>
      </div>
      <span class="text-[var(--fm-border)]">·</span>
      <div class="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
        <ShieldCheck class="w-3 h-3" />
        <span>IndexedDB NoSQL</span>
      </div>
      <span class="text-[var(--fm-border)]">·</span>
      <div class="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        <Zap class="w-3 h-3" />
        <span>AI Pitch Engine</span>
      </div>
    </div>

    <!-- Progress Bar Container -->
    <div class="w-full max-w-xs mt-7">
      <div
        class="h-2 w-full bg-emerald-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-200 dark:border-slate-700 shadow-inner"
      >
        <div
          class="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm"
          style="width: {progress}%"
        ></div>
      </div>
      <p class="text-[11px] font-bold text-[var(--fm-text-muted)] mt-2.5 h-4 transition-all tracking-tight">
        {statusText}
      </p>
    </div>

    <!-- Enter / Skip Action -->
    <button
      type="button"
      onclick={() => oncomplete?.()}
      class="mt-7 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
    >
      <span>Enter Dashboard</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </button>
  </div>
</div>
