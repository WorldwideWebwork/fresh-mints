<script lang="ts">
  import { leadStore } from "../../stores/lead-store.svelte";
  import { authStore } from "../../stores/auth-store.svelte";
  import Button from "../atoms/Button.svelte";
  import Badge from "../atoms/Badge.svelte";
  import {
    Radio,
    Sparkles,
    Flame,
    ExternalLink,
    CheckCircle2,
    X,
    Plus,
    RefreshCw,
    Send,
    MessageSquare,
    Layers,
    User,
    Clock,
    Zap,
    Tag,
    Trash2,
    Filter,
    Key
  } from "lucide-svelte";
  import type { SocialLead, SocialPlatform } from "../../services/social-feed/types";
  import { SocialPostDispatcher } from "../../services/social-feed/social-post-dispatcher";
  import { toast } from "../../stores/toast.svelte";

  interface Props {
    onopenmodal?: (modalName: string, lead?: any) => void;
  }

  let { onopenmodal }: Props = $props();

  let isRuleModalOpen = $state(false);
  let newRuleName = $state("");
  let newRuleKeywords = $state("");
  let newRuleNegative = $state("");
  let selectedPlatforms = $state<SocialPlatform[]>(["hacker_news", "reddit"]);

  const userPlan = $derived(authStore.user?.plan || "free");
  const userPlanLimits = $derived(authStore.user?.planLimits || { maxRules: 2, scansPerDay: 10, maxCrmLeads: 25 });
  const activeRules = $derived(leadStore.socialRules.filter((r) => r.isActive));
  const visibleLeads = $derived(leadStore.socialLeads.filter((l) => l.status !== "dismissed"));

  async function handleScan() {
    await leadStore.scanSocialFeeds();
  }

  async function handleConvertLead(socialLead: SocialLead) {
    const createdLead = await leadStore.convertSocialLeadToCrmLead(socialLead.id);
    const hasLead = Boolean(createdLead);
    if (hasLead && onopenmodal) {
      onopenmodal("lead_detail", createdLead);
    }
  }

  async function handleAutoPost(lead: SocialLead) {
    const res = await SocialPostDispatcher.dispatchReply(lead);
    if (res.success) {
      toast.success('Pitch Dispatched', res.message);
      if (res.targetUrl && typeof window !== 'undefined') {
        window.open(res.targetUrl, '_blank');
      }
    } else {
      toast.error('Dispatch Failed', res.message);
    }
  }

  function handleCreateRule(e: SubmitEvent) {
    e.preventDefault();
    const trimmedName = newRuleName.trim();
    const hasName = trimmedName.length > 0;
    const keywords = newRuleKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    const hasKeywords = keywords.length > 0;

    const canCreate = hasName && hasKeywords;
    if (!canCreate) {
      return;
    }

    const negativeKeywords = newRuleNegative
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    leadStore.addSocialRule({
      name: trimmedName,
      keywords,
      negativeKeywords,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["hacker_news", "reddit"],
      minIntentScore: 50,
      isActive: true,
      autoConvertToCrm: false,
    });

    newRuleName = "";
    newRuleKeywords = "";
    newRuleNegative = "";
    isRuleModalOpen = false;
  }

  function togglePlatform(platform: SocialPlatform) {
    const isIncluded = selectedPlatforms.includes(platform);
    if (isIncluded) {
      selectedPlatforms = selectedPlatforms.filter((p) => p !== platform);
    } else {
      selectedPlatforms = [...selectedPlatforms, platform];
    }
  }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-12">
  <div class="p-6 rounded-3xl bg-[var(--fm-surface)] border border-[var(--fm-border)] shadow-xs relative overflow-hidden">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Radio class="w-5 h-5 animate-pulse" />
          </div>
          <h2 class="text-xl font-black tracking-tight text-[var(--fm-text)] font-sans">
            Live Social Intent Radar
          </h2>
          <button
            type="button"
            onclick={() => onopenmodal?.('upgrade_plan')}
            class="cursor-pointer"
          >
            <Badge variant="success" class="uppercase tracking-wider text-[10px] font-mono">
              {userPlan} Tier
            </Badge>
          </button>
          <button
            type="button"
            onclick={() => onopenmodal?.('upgrade_plan')}
            class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Upgrade Plan &rarr;
          </button>
        </div>
        <p class="text-xs text-[var(--fm-text-muted)] max-w-2xl">
          Real-time social listening across Hacker News and Reddit public feeds. Continuously monitors buyer conversations, evaluates purchase intent, and drafts immediate pitches.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          class="gap-1.5 text-xs font-semibold"
          onclick={() => onopenmodal?.('social_tokens')}
        >
          <Key class="w-3.5 h-3.5 text-cyan-500" />
          <span>API Key Vault</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          class="gap-1.5 text-xs font-semibold"
          onclick={() => (isRuleModalOpen = true)}
        >
          <Plus class="w-3.5 h-3.5" />
          <span>New Rule ({leadStore.socialRules.length}/{userPlanLimits.maxRules})</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          class="gap-2 text-xs font-bold shadow-md shadow-emerald-500/20"
          onclick={handleScan}
          disabled={leadStore.isScanningSocialFeeds}
        >
          <RefreshCw class={`w-3.5 h-3.5 ${leadStore.isScanningSocialFeeds ? 'animate-spin' : ''}`} />
          <span>{leadStore.isScanningSocialFeeds ? "Scanning Feeds..." : "Scan Live Feeds"}</span>
        </Button>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-[var(--fm-border)] flex flex-wrap items-center gap-2">
      <span class="text-[11px] font-bold text-[var(--fm-text-muted)] uppercase tracking-wider flex items-center gap-1">
        <Filter class="w-3 h-3" /> Active Rules:
      </span>
      {#each leadStore.socialRules as rule (rule.id)}
        <div class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border transition-all ${rule.isActive ? 'bg-[var(--fm-surface-sunken)] border-emerald-500/30 text-[var(--fm-text)]' : 'bg-transparent border-[var(--fm-border)] text-[var(--fm-text-muted)] opacity-60'}`}>
          <button
            type="button"
            onclick={() => leadStore.toggleSocialRule(rule.id)}
            class="font-semibold hover:underline cursor-pointer"
          >
            {rule.name}
          </button>
          <span class="text-[10px] text-[var(--fm-text-muted)]">({rule.keywords.join(", ")})</span>
          <button
            type="button"
            onclick={() => leadStore.deleteSocialRule(rule.id)}
            class="text-[var(--fm-text-muted)] hover:text-rose-500 cursor-pointer ml-1"
            title="Delete rule"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      {/each}
    </div>
  </div>

  {#if visibleLeads.length === 0}
    <div class="p-12 rounded-3xl bg-[var(--fm-surface)] border border-[var(--fm-border)] text-center space-y-4">
      <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
        <Radio class="w-7 h-7" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-[var(--fm-text)]">No Active Leads on Radar</h3>
        <p class="text-xs text-[var(--fm-text-muted)] max-w-md mx-auto">
          Click "Scan Live Feeds" to query Hacker News Algolia and Reddit public feeds for live discussions matching your keywords.
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        class="gap-2 text-xs font-bold"
        onclick={handleScan}
        disabled={leadStore.isScanningSocialFeeds}
      >
        <RefreshCw class="w-3.5 h-3.5" />
        <span>Scan Live Feeds Now</span>
      </Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each visibleLeads as lead (lead.id)}
        {@const isConverted = lead.status === 'converted'}
        <div class="p-5 rounded-2xl bg-[var(--fm-surface)] border border-[var(--fm-border)] hover:border-emerald-500/40 transition-all space-y-3.5 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <Badge variant={lead.rawPost.platform === 'reddit' ? 'danger' : 'warning'} class="uppercase font-mono text-[10px]">
                {lead.rawPost.platform.replace('_', ' ')}
              </Badge>
              {#if lead.rawPost.subredditOrChannel}
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {lead.rawPost.subredditOrChannel}
                </span>
              {/if}
              <span class="text-[11px] text-[var(--fm-text-muted)] flex items-center gap-1">
                <User class="w-3 h-3" /> {lead.rawPost.author}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div class={`px-2.5 py-1 rounded-xl text-[11px] font-black font-mono border ${lead.intentScore >= 80 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'}`}>
                {lead.intentScore}% Buyer Intent
              </div>
              <a
                href={lead.rawPost.url}
                target="_blank"
                rel="noreferrer"
                class="p-1.5 rounded-lg text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] hover:bg-[var(--fm-surface-sunken)] transition-all"
                title="View original social thread"
              >
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onclick={() => leadStore.dismissSocialLead(lead.id)}
                class="p-1.5 rounded-lg text-[var(--fm-text-muted)] hover:text-rose-500 hover:bg-[var(--fm-surface-sunken)] transition-all cursor-pointer"
                title="Dismiss lead"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <h4 class="text-sm font-bold text-[var(--fm-text)] leading-snug">
              {lead.rawPost.title}
            </h4>
            <p class="text-xs text-[var(--fm-text-muted)] line-clamp-3 leading-relaxed">
              {lead.rawPost.content}
            </p>
          </div>

          <div class="p-3 rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Zap class="w-3 h-3" /> AI Pitch Suggestion:
              </span>
              <span class="text-[10px] text-[var(--fm-text-muted)]">
                Keyword: "{lead.matchedKeyword}"
              </span>
            </div>
            <p class="text-xs text-[var(--fm-text)] italic leading-relaxed">
              "{lead.suggestedPitch}"
            </p>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="text-[11px] text-[var(--fm-text-muted)] flex items-center gap-1">
              <Clock class="w-3 h-3" /> {new Date(lead.rawPost.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                class="gap-1.5 text-xs font-semibold"
                onclick={() => handleAutoPost(lead)}
              >
                <Send class="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-Post Pitch</span>
              </Button>

              {#if isConverted}
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Minted to CRM</span>
                </div>
              {:else}
                <Button
                  variant="primary"
                  size="sm"
                  class="gap-1.5 text-xs font-bold"
                  onclick={() => handleConvertLead(lead)}
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>Mint to CRM Lead</span>
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if isRuleModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="w-full max-w-lg p-6 rounded-3xl bg-[var(--fm-surface)] border border-[var(--fm-border)] shadow-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Radio class="w-5 h-5 text-emerald-500" />
            <h3 class="text-base font-bold text-[var(--fm-text)]">Create Social Monitor Rule</h3>
          </div>
          <button
            type="button"
            onclick={() => (isRuleModalOpen = false)}
            class="p-1 rounded-lg text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form onsubmit={handleCreateRule} class="space-y-3.5">
          <div class="space-y-1">
            <label for="rule-name" class="block text-xs font-bold text-[var(--fm-text)]">
              Rule Name
            </label>
            <input
              id="rule-name"
              type="text"
              bind:value={newRuleName}
              placeholder="e.g. Legal & Healthcare Website Upgrades"
              required
              class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
            />
          </div>

          <div class="space-y-1">
            <label for="rule-keywords" class="block text-xs font-bold text-[var(--fm-text)]">
              Keywords (comma separated)
            </label>
            <input
              id="rule-keywords"
              type="text"
              bind:value={newRuleKeywords}
              placeholder="e.g. website, web design, clinic portal, agency"
              required
              class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
            />
          </div>

          <div class="space-y-1">
            <label for="rule-negative" class="block text-xs font-bold text-[var(--fm-text)]">
              Negative Keywords (exclude noise)
            </label>
            <input
              id="rule-negative"
              type="text"
              bind:value={newRuleNegative}
              placeholder="e.g. job, hiring, crypto, course"
              class="w-full px-3 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] focus:ring-2 focus:ring-emerald-500/40 outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-[var(--fm-text)]">
              Live Monitored Platforms
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick={() => togglePlatform('hacker_news')}
                class={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${selectedPlatforms.includes('hacker_news') ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-[var(--fm-border)] text-[var(--fm-text-muted)]'}`}
              >
                Hacker News (Live Algolia API)
              </button>
              <button
                type="button"
                onclick={() => togglePlatform('reddit')}
                class={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${selectedPlatforms.includes('reddit') ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-[var(--fm-border)] text-[var(--fm-text-muted)]'}`}
              >
                Reddit (Live Public Feed)
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onclick={() => (isRuleModalOpen = false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
