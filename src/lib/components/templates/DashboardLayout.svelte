<script lang="ts">
  import type { Snippet } from "svelte";
  import { themeStore } from "../../stores/theme.svelte";
  import { leadStore } from "../../stores/lead-store.svelte";
  import Button from "../atoms/Button.svelte";
  import Badge from "../atoms/Badge.svelte";
  import {
    Sparkles,
    Database,
    Table,
    Kanban,
    PhoneCall,
    Server,
    BarChart3,
    Upload,
    Plus,
    Settings,
    Layers,
    X,
    Trash2,
    Info,
    Sun,
    Moon
  } from "lucide-svelte";

  interface Props {
    children?: Snippet;
    onopenmodal?: (modalName: string) => void;
    onopenconfirmclear?: () => void;
  }

  let { children, onopenmodal, onopenconfirmclear }: Props = $props();

  const navTabs = [
    {
      id: "search",
      label: "Search & Discovery",
      icon: Database,
      badge: "Live",
      badgeType: "live"
    },
    {
      id: "leads",
      label: "Minted Leads",
      icon: Table,
      badge: "count",
      badgeType: "count"
    },
    {
      id: "kanban",
      label: "CRM Pipeline",
      icon: Kanban,
      badge: null,
      badgeType: null
    },
    {
      id: "rephub",
      label: "Rep Hub & Calls",
      icon: PhoneCall,
      badge: null,
      badgeType: "bounty"
    },
    {
      id: "economics",
      label: "w4 Economics",
      icon: Server,
      badge: null,
      badgeType: null
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
      badgeType: null
    }
  ];

  function handleClearStorage() {
    if (onopenconfirmclear) {
      onopenconfirmclear();
    } else {
      onopenmodal?.("confirm_clear");
    }
  }
</script>

<div
  class="min-h-screen bg-[var(--fm-bg)] text-[var(--fm-text)] flex flex-col md:flex-row selection:bg-emerald-500 selection:text-white pb-20 md:pb-0 transition-colors duration-300"
>
  <!-- Desktop Left Sidebar Navigation Menu -->
  <aside
    class="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-[var(--fm-border)] bg-[var(--fm-sidebar-bg)] dark:bg-[#090e17] backdrop-blur-xl sticky top-0 h-screen overflow-y-auto custom-scrollbar p-4 flex-shrink-0 z-30 select-none shadow-sm dark:shadow-2xl dark:shadow-black/60"
  >
    <!-- Top Area: Brand Header & Primary Nav Links -->
    <div class="space-y-6">
      <!-- App Brand Logo & Title -->
      <div class="flex items-center gap-3 px-2 py-1">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/25 dark:shadow-emerald-950/70 flex-shrink-0"
        >
          <Sparkles class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span
              class="text-sm font-black tracking-tight text-[var(--fm-text)] uppercase font-mono"
              >Fresh Mints</span
            >
            <Badge
              variant="success"
              class="text-[9px] uppercase font-mono px-1 py-0 font-bold">Pro</Badge
            >
          </div>
          <p class="text-[11px] text-[var(--fm-text-muted)] truncate font-medium">
            Newly Minted Leads &amp; Pitch Studio
          </p>
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <nav class="space-y-1">
        {#each navTabs as tab}
          {@const Icon = tab.icon}
          {@const isActive = leadStore.activeTab === tab.id}
          <button
            type="button"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer {isActive
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface-sunken)]'}"
            onclick={() => leadStore.setActiveTab(tab.id)}
          >
            <div class="flex items-center gap-2.5 min-w-0 truncate">
              <Icon
                class="w-4 h-4 shrink-0 {isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--fm-text-muted)]'}"
              />
              <span class="truncate">{tab.label}</span>
            </div>

            {#if tab.badgeType === "count"}
              <span
                class="px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 ml-1.5"
              >
                {leadStore.leads.length}
              </span>
            {:else if tab.badgeType === "live"}
              <Badge
                variant="success"
                class="text-[9px] uppercase font-mono px-1.5 py-0 font-bold shrink-0 ml-1.5"
                >Live</Badge
              >
            {:else if tab.badgeType === "bounty"}
              <span
                class="px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0 ml-1.5"
              >
                {tab.badge}
              </span>
            {/if}
          </button>
        {/each}
      </nav>

      <!-- Custom Saved Views Section -->
      <div class="space-y-2 pt-3 border-t border-[var(--fm-border-subtle)]">
        <div
          class="flex items-center justify-between px-2 text-[10px] font-bold tracking-wider text-[var(--fm-text-muted)] uppercase"
        >
          <span>Custom Saved Views</span>
          <button
            type="button"
            onclick={() => onopenmodal?.("custom_tab")}
            class="p-1 text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface-sunken)] rounded-md transition-colors cursor-pointer"
            title="Create Custom Saved View"
          >
            <Plus class="w-3.5 h-3.5" />
          </button>
        </div>

        {#if leadStore.customTabs.length > 0}
          <div class="space-y-1">
            {#each leadStore.customTabs as cTab (cTab.id)}
              {@const isCustomActive = leadStore.activeTab === cTab.id}
              <div
                class="flex items-center justify-between rounded-xl px-2 py-1.5 transition-all text-xs font-semibold {isCustomActive
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80'
                  : 'text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface-sunken)]'}"
              >
                <button
                  type="button"
                  class="flex items-center gap-2 flex-1 min-w-0 text-left truncate cursor-pointer"
                  onclick={() => {
                    leadStore.setActiveTab(cTab.id);
                    leadStore.setFilters({
                      profession: cTab.professionFilter,
                      state: cTab.stateFilter
                    });
                  }}
                >
                  <Layers class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span class="truncate">{cTab.label}</span>
                </button>
                <button
                  type="button"
                  onclick={() => leadStore.removeCustomTab(cTab.id)}
                  class="p-1 text-[var(--fm-text-muted)] hover:text-rose-500 rounded cursor-pointer shrink-0 ml-1"
                  title="Remove View"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <button
          type="button"
          onclick={() => onopenmodal?.("custom_tab")}
          class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--fm-text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--fm-surface-sunken)] rounded-xl transition-all cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>+ Create Custom Tab</span>
        </button>
      </div>
    </div>

    <!-- Bottom Area: Clear Storage & Deal Potential Widget -->
    <div class="space-y-3 pt-4 border-t border-[var(--fm-border-subtle)]">
      <!-- Clear Local Storage Button -->
      <button
        type="button"
        onclick={handleClearStorage}
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--fm-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
      >
        <Trash2 class="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
        <span class="truncate">Clear Local Storage ({leadStore.leads.length})</span>
      </button>

      <!-- Turnkey Deal Potential Card -->
      <div
        class="rounded-2xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border-subtle)] p-3.5 space-y-2 shadow-xs"
      >
        <div
          class="flex items-center justify-between text-[11px] font-semibold text-[var(--fm-text-muted)]"
        >
          <span>Turnkey Deal Potential</span>
          <button
            type="button"
            onclick={() => leadStore.setActiveTab("economics")}
            class="text-cyan-500 hover:text-cyan-400 cursor-pointer"
            title="View w4 Unit Economics"
          >
            <Info class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="text-xl font-black tracking-tight text-[var(--fm-text)]">
          ${leadStore.analytics.totalPipelineValue.toLocaleString()}
        </div>

        <div class="flex items-center justify-between text-[10px] text-[var(--fm-text-muted)]">
          <span>{leadStore.leads.length} Saved Leads</span>
          <button
            type="button"
            onclick={() => leadStore.setActiveTab("economics")}
            class="font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            w4 math &rarr;
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main Content Column -->
  <div class="flex-1 flex flex-col min-w-0 bg-[var(--fm-main-bg)]">
    <!-- Top Navigation Header -->
    <header class="glass-header sticky top-0 z-40 bg-[var(--fm-main-bg)]/90 backdrop-blur-xl">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Mobile Brand Logo (hidden on desktop) -->
          <div class="flex md:hidden items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/60 flex-shrink-0"
            >
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-extrabold tracking-tight text-[var(--fm-text)]"
                  >Fresh Mints</span
                >
                <Badge
                  variant="success"
                  class="text-[10px] uppercase font-mono">Pro</Badge
                >
              </div>
            </div>
          </div>

          <!-- Desktop View Breadcrumb / Status -->
          <div class="hidden md:flex items-center gap-2">
            <span
              class="text-xs font-bold uppercase tracking-wider text-[var(--fm-text-muted)] font-mono"
            >
              Command Deck
            </span>
            <span class="text-[var(--fm-text-muted)] text-xs">/</span>
            <span class="text-sm font-extrabold text-[var(--fm-text)]">
              {navTabs.find((t) => t.id === leadStore.activeTab)?.label ||
                leadStore.customTabs.find((t) => t.id === leadStore.activeTab)?.label ||
                "Discovery"}
            </span>
            <Badge
              variant="success"
              class="text-[10px] uppercase font-mono ml-2">w<sup>4</sup> Cloud Live</Badge
            >
          </div>

          <!-- Action Tools -->
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onclick={() => onopenmodal?.("import_csv")}
              class="hidden sm:inline-flex gap-1.5 text-xs"
            >
              <Upload class="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onclick={() => onopenmodal?.("custom_tab")}
              class="hidden md:inline-flex gap-1.5 text-xs"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Save Preset View</span>
            </Button>

            <!-- Theme Toggle -->
            <button
              type="button"
              onclick={() => themeStore.toggle()}
              class="p-2 rounded-xl text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface-raised)] transition-all cursor-pointer"
              title={themeStore.isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {#if themeStore.isDark}
                <Sun class="w-4 h-4" />
              {:else}
                <Moon class="w-4 h-4" />
              {/if}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onclick={() => onopenmodal?.("settings")}
              class="text-xs p-2"
              title="Settings"
            >
              <Settings class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main
      class="flex-grow w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 bg-[var(--fm-main-bg)]"
    >
      {#if children}
        {@render children()}
      {/if}
    </main>

    <!-- Footer -->
    <footer
      class="border-t border-[var(--fm-border)] py-6 text-xs text-[var(--fm-text-muted)] bg-[var(--fm-main-bg)]/80 backdrop-blur-xs"
    >
      <div
        class="px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
      >
        <div class="space-y-1">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
            <span
              >&copy; {new Date().getFullYear()}
              <a
                href="https://www.worldwidewebwork.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-[var(--fm-text)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-emerald-500/30 hover:decoration-emerald-500"
                >World Wide Web Work</a
              >
              (W<sup>4</sup>). All rights reserved.</span
            >
            <span class="hidden md:inline text-[var(--fm-text-muted)]">&bull;</span>
            <span class="font-medium text-[var(--fm-text)]">w<sup>4</sup> Fresh Mints</span>
          </div>
          <div class="text-[11px] text-[var(--fm-text-muted)]">
            Powered by Google Gemini, CMS Federal NPPES Registry &amp; w<sup>4</sup> High-Speed Cloud
          </div>
        </div>
        <div
          class="flex flex-wrap items-center justify-center gap-4 text-[var(--fm-text-secondary)]"
        >
          <a
            href="https://www.worldwidewebwork.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            worldwidewebwork.com
          </a>
          <a
            href="/wp-admin/admin.php?page=xophz-compass#/questbook"
            class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Questbook CRM
          </a>
          <a
            href="/wp-admin/admin.php?page=xophz-compass#/fresh-mints"
            class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            My COMPASS Command Hub
          </a>
        </div>
      </div>
    </footer>
  </div>

  <!-- Mobile Fixed Bottom Navigation Bar -->
  <nav
    id="mobile-bottom-nav"
    class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 flex items-center justify-evenly shadow-2xl safe-bottom"
  >
    <!-- 1. Discovery / Search -->
    <button
      type="button"
      id="mobile-nav-search"
      onclick={() => leadStore.setActiveTab("search")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'search'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <Database class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Discovery</span>
    </button>

    <!-- 2. Leads Table -->
    <button
      type="button"
      id="mobile-nav-leads"
      onclick={() => leadStore.setActiveTab("leads")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'leads'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <Table class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Leads</span>
    </button>

    <!-- 3. Pipeline -->
    <button
      type="button"
      id="mobile-nav-pipeline"
      onclick={() => leadStore.setActiveTab("kanban")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'kanban'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <Kanban class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Pipeline</span>
    </button>

    <!-- 4. Rep Hub -->
    <button
      type="button"
      id="mobile-nav-rephub"
      onclick={() => leadStore.setActiveTab("rephub")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'rephub'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <PhoneCall class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Rep Hub</span>
    </button>

    <!-- 5. Economics -->
    <button
      type="button"
      id="mobile-nav-economics"
      onclick={() => leadStore.setActiveTab("economics")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'economics'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <Server class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Economics</span>
    </button>

    <!-- 6. Analytics -->
    <button
      type="button"
      id="mobile-nav-analytics"
      onclick={() => leadStore.setActiveTab("analytics")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] {leadStore.activeTab ===
      'analytics'
        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-900/80'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
    >
      <BarChart3 class="w-4 h-4 shrink-0" />
      <span class="text-[10px] mt-0.5 truncate text-center w-full">Analytics</span>
    </button>

    <!-- 7. Save Custom View -->
    <button
      type="button"
      id="mobile-nav-add-tab"
      onclick={() => onopenmodal?.("custom_tab")}
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-900/60 transition-all cursor-pointer min-w-0 min-h-[44px]"
      title="Save Preset View"
    >
      <div
        class="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center shrink-0"
      >
        <Plus class="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
      </div>
      <span class="text-[10px] mt-0.5 font-bold truncate text-center w-full">New View</span>
    </button>
  </nav>
</div>
