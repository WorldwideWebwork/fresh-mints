<script lang="ts">
  import {
    type Lead,
    type WebsitePreviewConfig,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { getDefaultWebsiteConfig, getPreviewLink } from '../../services/website-templates';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import {
    X,
    Globe,
    Smartphone,
    Monitor,
    CheckCircle,
    Copy,
    ExternalLink,
    Send,
    Sparkles,
    Edit3,
    Award,
    ShieldCheck,
    Star,
    UserCheck,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Flame,
    Check,
  } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onopenoutreach?: (lead: Lead) => void;
    onopenfullpreview?: (lead: Lead) => void;
  }

  let { open = $bindable(false), lead = null, onopenoutreach, onopenfullpreview }: Props = $props();

  let deviceMode = $state<'desktop' | 'mobile'>('desktop');
  let isEditing = $state(false);
  let copied = $state(false);

  const siteConfig = $derived.by<WebsitePreviewConfig>(() => {
    if (lead?.websiteConfig) return lead.websiteConfig;
    if (lead) {
      return getDefaultWebsiteConfig(
        lead.fullName,
        lead.profession,
        lead.city,
        lead.state,
        lead.collegeOrSchool
      );
    }
    return getDefaultWebsiteConfig(
      'Dr. David Sinclair',
      'financial_advisor',
      'Phoenix',
      'AZ',
      'College for Financial Planning'
    );
  });

  const previewUrl = $derived.by(() => {
    if (!lead) return '';
    return getPreviewLink(siteConfig.previewSlug || lead.id);
  });

  const profMeta = $derived(
    lead ? PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate : null
  );

  const hostingPlan = $derived(
    profMeta ? W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze : null
  );

  const paletteColors = [
    { label: 'Teal', hex: '#0f766e' },
    { label: 'Rose', hex: '#e11d48' },
    { label: 'Blue', hex: '#2563eb' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Slate', hex: '#1e293b' },
    { label: 'Pink', hex: '#db2777' },
    { label: 'Orange', hex: '#ea580c' },
  ];

  function handleColorChange(color: string) {
    if (!lead) return;
    const updated = { ...siteConfig, primaryColor: color };
    leadStore.updateLead(lead.id, { websiteConfig: updated });
  }

  function handleHeadlineChange(val: string) {
    if (!lead) return;
    const updated = { ...siteConfig, heroHeadline: val };
    leadStore.updateLead(lead.id, { websiteConfig: updated });
  }

  function handlePriceChange(val: number) {
    if (!lead) return;
    const updated = { ...siteConfig, offerPrice: val };
    leadStore.updateLead(lead.id, {
      websiteConfig: updated,
      estimatedDealValue: val,
    });
  }

  function copyShareLink() {
    if (!lead) return;
    const link = getPreviewLink(lead);
    navigator.clipboard.writeText(link);
    copied = true;
    toast.success('Live preview link copied to clipboard!');
    setTimeout(() => {
      copied = false;
    }, 2500);
  }

  function handleLaunchOutreach() {
    if (!lead) return;
    close();
    if (onopenoutreach) {
      onopenoutreach(lead);
    }
  }

  function handleOpenStandalone() {
    if (!lead) return;
    if (onopenfullpreview) {
      close();
      onopenfullpreview(lead);
    } else {
      window.location.hash = `#/preview/${siteConfig.previewSlug || lead.id}`;
      window.dispatchEvent(new Event('popstate'));
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && lead}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/20 dark:bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    onclick={close}
  >
    <div
      class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header Bar -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/90">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold flex-shrink-0">
            <Globe class="w-5 h-5" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Turnkey Practice Website: {lead.fullName}
              </h2>
              <Badge variant="success" class="text-xs font-mono">
                ${siteConfig.offerPrice.toLocaleString()} (2-Yr w4 Cloud Package)
              </Badge>
              {#if hostingPlan}
                <span class="text-[11px] bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-mono">
                  {hostingPlan.name} (${hostingPlan.monthlyBaseRate}/mo post-2yr)
                </span>
                <span class="text-[11px] bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                  <Flame class="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Rep Bounty: $300
                </span>
              {/if}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compass Launch Studio &bull; <strong>{lead.professionTitle}</strong> ({lead.city}, {lead.state}) &bull; $999 Domain Buyout Rights
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Mode Switcher -->
          <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onclick={() => (deviceMode = 'desktop')}
              class="p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {deviceMode === 'desktop' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
            >
              <Monitor class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onclick={() => (deviceMode = 'mobile')}
              class="p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer {deviceMode === 'mobile' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
            >
              <Smartphone class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onclick={() => (isEditing = !isEditing)}
            class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isEditing ? 'Done Editing' : 'Customize Site'}</span>
          </button>

          <button
            type="button"
            onclick={close}
            class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Editing Controls Bar (Collapsible) -->
      {#if isEditing}
        <div class="bg-slate-50 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 p-3.5 px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label for="edit-headline" class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1">
              Hero Headline
            </label>
            <input
              id="edit-headline"
              type="text"
              value={siteConfig.heroHeadline}
              oninput={(e) => handleHeadlineChange((e.target as HTMLInputElement).value)}
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1">
              Brand Color Palette
            </span>
            <div class="flex items-center gap-2 pt-0.5">
              {#each paletteColors as col}
                <button
                  type="button"
                  title={col.label}
                  onclick={() => handleColorChange(col.hex)}
                  class="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform {siteConfig.primaryColor === col.hex ? 'border-white scale-115 ring-2 ring-emerald-500/50' : 'border-transparent hover:scale-105'}"
                  style="background-color: {col.hex};"
                ></button>
              {/each}
            </div>
          </div>
          <div>
            <label for="edit-offer-price" class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] block mb-1">
              2-Year Offer Price ($)
            </label>
            <input
              id="edit-offer-price"
              type="number"
              value={siteConfig.offerPrice}
              oninput={(e) => handlePriceChange(Number((e.target as HTMLInputElement).value))}
              class="w-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      {/if}

      <!-- Live Interactive Website Frame Canvas -->
      <div class="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 flex-1 overflow-y-auto flex justify-center custom-scrollbar">
        <div
          class="transition-all bg-white text-stone-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/60 flex flex-col {deviceMode === 'mobile' ? 'w-[375px] min-h-[667px]' : 'w-full max-w-5xl'}"
        >
          <!-- Website Mock Browser Nav -->
          <div class="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            </div>
            <div class="bg-white border border-stone-300 rounded-md px-3 py-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-600 truncate max-w-xs">
              https://{siteConfig.previewSlug}.compassportal.pro
            </div>
            <div class="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
              <ShieldCheck class="w-3 h-3" /> Licensed Professional Site
            </div>
          </div>

          <!-- Generated Website Content -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <!-- Header -->
            <header class="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs"
                  style="background-color: {siteConfig.primaryColor};"
                >
                  {lead.fullName.charAt(0)}
                </div>
                <div>
                  <span class="font-bold text-sm tracking-tight text-stone-900 block leading-none">
                    {lead.fullName}
                  </span>
                  <span class="text-[10px] text-slate-500 font-medium">{lead.professionTitle}</span>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-600">
                <span>Services</span>
                <span>About</span>
                <span>License #{lead.licenseNumber}</span>
                <button
                  type="button"
                  class="px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs"
                  style="background-color: {siteConfig.primaryColor};"
                >
                  {siteConfig.callToAction}
                </button>
              </div>
            </header>

            <!-- Hero Banner Section -->
            <section class="px-6 py-10 sm:py-14 text-center bg-stone-50 relative overflow-hidden">
              <div class="max-w-2xl mx-auto space-y-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                  style="background-color: {siteConfig.primaryColor};"
                >
                  <Award class="w-3.5 h-3.5" />
                  State Licensed {lead.professionTitle} ({lead.state})
                </span>

                <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
                  {siteConfig.heroHeadline}
                </h1>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                  {siteConfig.heroSubheadline}
                </p>

                <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    class="px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-opacity cursor-pointer"
                    style="background-color: {siteConfig.primaryColor};"
                  >
                    {siteConfig.callToAction}
                  </button>
                  <button type="button" class="px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm shadow-xs cursor-pointer">
                    View Verified Credentials
                  </button>
                </div>
              </div>
            </section>

            <!-- Trust Bar -->
            <section class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-3 px-6 text-xs flex flex-wrap items-center justify-around gap-4 text-center">
              <div class="flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>State License #{lead.licenseNumber}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <UserCheck class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{lead.collegeOrSchool}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Star class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Verified Practice ({lead.city}, {lead.state})</span>
              </div>
            </section>

            <!-- Services Section -->
            <section class="p-6 sm:p-8 max-w-4xl mx-auto space-y-4">
              <div class="text-center space-y-1">
                <h2 class="text-lg font-bold text-stone-900">Professional Practice Services</h2>
                <p class="text-xs text-slate-400 dark:text-slate-500">
                  Comprehensive care delivered in {lead.city}, {lead.state}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {#each siteConfig.services as svc}
                  <div class="border border-stone-200 rounded-xl p-4 bg-white shadow-xs space-y-2 hover:border-stone-300 transition-colors">
                    <div
                      class="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs"
                      style="background-color: {siteConfig.primaryColor};"
                    >
                      <CheckCircle class="w-4 h-4" />
                    </div>
                    <h3 class="font-bold text-xs text-stone-900">{svc.title}</h3>
                    <p class="text-[11px] text-slate-500 leading-relaxed">{svc.description}</p>
                  </div>
                {/each}
              </div>
            </section>

            <!-- Bio & Credentials Section -->
            <section class="bg-stone-50 p-6 sm:p-8 border-t border-stone-200">
              <div class="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5">
                <div
                  class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                  style="background-color: {siteConfig.primaryColor};"
                >
                  {lead.fullName.charAt(0)}
                </div>
                <div class="space-y-1.5 text-center sm:text-left">
                  <h3 class="text-base font-bold text-stone-900">About {lead.fullName}</h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    {siteConfig.bioText}
                  </p>
                  <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-medium text-slate-500 pt-1">
                    <span class="flex items-center gap-1">
                      <MapPin class="w-3.5 h-3.5 text-slate-400" /> {lead.city}, {lead.state}
                    </span>
                    <span class="flex items-center gap-1">
                      <Calendar class="w-3.5 h-3.5 text-slate-400" /> Class of {lead.graduationYear}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={handleCopyLink}
            class="border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 gap-1.5 text-xs"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Link Copied!</span>
            {:else}
              <Copy class="w-3.5 h-3.5" />
              <span>Copy Pitch Link</span>
            {/if}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onclick={handleOpenStandalone}
            class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white gap-1"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            <span>Open Standalone Preview</span>
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onclick={handleLaunchOutreach}
            class="gap-1.5 font-semibold text-xs"
          >
            <Send class="w-4 h-4" />
            <span>Offer Website to {lead.fullName.split(' ')[0]}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
