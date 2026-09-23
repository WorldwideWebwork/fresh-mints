<script lang="ts">
  import type { Lead } from '../../types/lead';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import { VisualPitchGenerator, type VisualPitchAsset } from '../../services/visual-pitch-generator';
  import { Sparkles, Globe, ExternalLink, ShieldCheck, Check, Laptop, Smartphone } from 'lucide-svelte';

  interface Props {
    lead: Lead;
    onopenpreview?: (lead: Lead) => void;
  }

  let { lead, onopenpreview }: Props = $props();

  const asset: VisualPitchAsset = $derived(VisualPitchGenerator.generateAsset(lead));
  const services = $derived(
    lead.websiteConfig?.services?.slice(0, 3) || [
      { title: 'New Client Consultations' },
      { title: 'Digital Intake & Booking' },
      { title: 'Dedicated Patient Vault' },
    ]
  );
</script>

<div class="rounded-3xl border border-emerald-500/40 bg-[#090e17] text-slate-100 shadow-2xl overflow-hidden select-none">
  <!-- Window Header Bar -->
  <div class="px-4 py-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 shrink-0">
      <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
      <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
      <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
    </div>

    <div class="flex-1 max-w-md mx-auto">
      <div class="px-3 py-1 rounded-xl bg-[#090e17] border border-slate-700/80 text-[11px] font-mono text-slate-400 text-center truncate flex items-center justify-center gap-1.5">
        <Globe class="w-3 h-3 text-emerald-400 shrink-0" />
        <span>https://{asset.slug}.mycompass.io</span>
      </div>
    </div>

    <div class="shrink-0 flex items-center gap-1.5">
      <Badge variant="success" class="text-[9px] uppercase font-bold tracking-wider py-0.5 px-2">
        Pre-Built Sandbox
      </Badge>
    </div>
  </div>

  <!-- Browser Content Viewport -->
  <div class="p-6 space-y-5 bg-gradient-to-b from-[#090e17] to-[#0d1526]">
    <div class="space-y-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-lg">
          <ShieldCheck class="w-3 h-3 text-emerald-400" />
          <span>Verified State Board Pass • Lic #{lead.licenseNumber || 'PENDING'}</span>
        </span>
      </div>

      <h2 class="text-2xl font-black tracking-tight text-white font-sans pt-1">
        {lead.fullName}
      </h2>
      <p class="text-xs font-semibold text-cyan-400">
        {lead.professionTitle} • {lead.city}, {lead.state}
      </p>
    </div>

    <!-- Features & Services Grid -->
    <div class="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800/90 space-y-2">
      <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Turnkey Modules Ready for Activation:
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {#each services as svc}
          <div class="flex items-center gap-1.5 text-xs text-slate-200">
            <Check class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span class="truncate">{svc.title}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- CTA Strip -->
    <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
      <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
        <Sparkles class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Sovereign 24-Month Cloud Hosting &amp; 10 Custom Mailboxes Included</span>
      </div>

      <Button
        variant="primary"
        size="sm"
        class="gap-1.5 text-xs font-bold shadow-lg shadow-emerald-500/20"
        onclick={() => onopenpreview?.(lead)}
      >
        <ExternalLink class="w-3.5 h-3.5" />
        <span>Launch Live Interactive Site</span>
      </Button>
    </div>
  </div>
</div>
