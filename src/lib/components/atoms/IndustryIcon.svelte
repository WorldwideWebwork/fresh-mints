<script lang="ts">
  import type { ProfessionCategory } from '../../types/lead';
  import {
    Home,
    HeartPulse,
    Smile,
    Activity,
    Brain,
    Sparkles,
    PawPrint,
    Scale,
    Landmark,
    Calculator,
    ShieldCheck,
    Wrench,
    Compass,
    Layers
  } from 'lucide-svelte';

  interface Props {
    profession?: ProfessionCategory | 'all' | string;
    class?: string;
  }

  let { profession = 'all', class: className = 'w-4 h-4' }: Props = $props();

  const iconMap: Record<string, any> = {
    real_estate: Home,
    nursing: HeartPulse,
    dental: Smile,
    chiropractic: Activity,
    therapy: Brain,
    beauty: Sparkles,
    veterinary: PawPrint,
    legal: Scale,
    financial_advisor: Landmark,
    finance: Calculator,
    insurance: ShieldCheck,
    trade: Wrench,
    architecture: Compass,
    all: Layers
  };

  const SelectedIcon = $derived(iconMap[profession] || Layers);
</script>

<SelectedIcon class={className} />
