<script lang="ts">
  import { authStore, type SaasPlanTier, PLAN_LIMITS } from '../../stores/auth-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Star } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  const currentPlan = $derived(authStore.user?.plan || 'free');

  interface PlanCardData {
    id: SaasPlanTier;
    name: string;
    price: string;
    period: string;
    description: string;
    isPopular?: boolean;
    features: string[];
  }

  const PLANS: PlanCardData[] = [
    {
      id: 'free',
      name: 'Free Explorer',
      price: '$0',
      period: 'forever',
      description: 'Ideal for testing lead discovery and inspecting practice registries.',
      features: [
        '2 Active Social Monitor Rules',
        '10 Feed Scans per day',
        '25 Minted Leads storage',
        'Live Hacker News & Reddit access',
        'Manual pitch copy and paste',
      ],
    },
    {
      id: 'starter',
      name: 'Starter Hunter',
      price: '$49',
      period: '/month',
      description: 'Built for solo closers monitoring niche communities for buyer intent.',
      features: [
        '5 Active Social Monitor Rules',
        '50 Feed Scans per day',
        '250 Minted Leads storage',
        'AI Buyer Intent scoring (0-100)',
        'Turnkey website preview generator',
        'Priority keyword filtering',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Closer',
      price: '$99',
      period: '/month',
      description: 'Automate social prospecting with API keys and lead funnel links.',
      isPopular: true,
      features: [
        '20 Active Social Monitor Rules',
        '500 Feed Scans per day',
        '2,500 Minted Leads storage',
        'API Token Vault & Auto-Post integration',
        'Personalized funnel demo link injection',
        'Instant Slack / Discord webhook dispatch',
        'Kanban Pipeline & CSV Export',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Growth',
      price: '$299',
      period: '/month',
      description: 'High-volume sales organizations dialing and tracking across states.',
      features: [
        'Unlimited Social Monitor Rules',
        '5,000 Feed Scans per day',
        '100,000 Minted Leads storage',
        'Multi-Seat Rep Hub & Commission Bounty',
        'Dedicated proxy pool & custom scrapers',
        'Dedicated SLA infrastructure support',
      ],
    },
  ];

  function handleSelectPlan(tier: SaasPlanTier) {
    const isCurrent = tier === currentPlan;
    if (isCurrent) {
      toast.info('Current Plan Active', `You are already on the ${tier.toUpperCase()} tier.`);
      return;
    }

    const success = authStore.updatePlan(tier);
    if (success) {
      toast.success(
        'Subscription Updated',
        `Successfully upgraded to ${tier.toUpperCase()} plan. Your new quotas are active.`
      );
      open = false;
      onclose?.();
    }
  }
</script>

<Dialog
  bind:open
  title="Choose Your SaaS Plan"
  maxWidth="max-w-6xl"
  {onclose}
>
  <div class="space-y-6 select-none p-1">
    <div class="text-center space-y-1.5 pb-2">
      <h3 class="text-xl font-black text-[var(--fm-text)] font-sans">
        Transparent, Simple Pricing
      </h3>
      <p class="text-xs text-[var(--fm-text-muted)] max-w-xl mx-auto leading-relaxed">
        Upgrade to unlock higher keyword monitoring capacity, automated social reply dispatches, and turnkey funnel lead magnet links.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each PLANS as plan (plan.id)}
        {@const isCurrent = plan.id === currentPlan}
        <div
          class={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all ${plan.isPopular ? 'border-emerald-500 bg-emerald-500/5 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30' : 'border-[var(--fm-border)] bg-[var(--fm-surface)]'} ${isCurrent ? 'ring-2 ring-emerald-500/60' : ''}`}
        >
          {#if plan.isPopular}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="success" class="text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 shadow-sm">
                Most Popular
              </Badge>
            </div>
          {/if}

          <div class="space-y-3.5">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-[var(--fm-text)]">
                {plan.name}
              </h4>
              {#if isCurrent}
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  Current
                </span>
              {/if}
            </div>

            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-[var(--fm-text)]">
                {plan.price}
              </span>
              <span class="text-xs text-[var(--fm-text-muted)] font-medium">
                {plan.period}
              </span>
            </div>

            <p class="text-xs text-[var(--fm-text-muted)] leading-relaxed min-h-[36px]">
              {plan.description}
            </p>

            <div class="pt-3 border-t border-[var(--fm-border)] space-y-2">
              <div class="text-[10px] font-bold uppercase tracking-wider text-[var(--fm-text-muted)]">
                What is Included:
              </div>
              <ul class="space-y-2">
                {#each plan.features as feat}
                  <li class="flex items-start gap-2 text-xs text-[var(--fm-text)] leading-snug">
                    <Check class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>

          <div class="pt-5 mt-5 border-t border-[var(--fm-border)]">
            <Button
              type="button"
              variant={isCurrent ? 'secondary' : plan.isPopular ? 'primary' : 'secondary'}
              size="md"
              class="w-full justify-center text-xs font-bold py-2.5 shadow-xs"
              disabled={isCurrent}
              onclick={() => handleSelectPlan(plan.id)}
            >
              {#if isCurrent}
                <span>Active Plan</span>
              {:else}
                <Sparkles class="w-3.5 h-3.5" />
                <span>Switch to {plan.name.split(' ')[0]}</span>
              {/if}
            </Button>
          </div>
        </div>
      {/each}
    </div>

    <div class="p-3.5 rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] flex items-center justify-between text-xs text-[var(--fm-text-muted)]">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-emerald-500" />
        <span>All plans include sovereign database encryption and turnkey website builders.</span>
      </div>
      <span class="text-[11px] font-semibold text-[var(--fm-text)]">Instant Activation</span>
    </div>
  </div>
</Dialog>
