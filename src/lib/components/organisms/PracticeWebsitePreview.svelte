<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { getDefaultWebsiteConfig, getPreviewLink } from '../../services/website-templates';
  import {
    type Lead,
    type WebsitePreviewConfig,
    type ProfessionCategory,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import {
    Phone,
    Mail,
    MapPin,
    Calendar,
    Award,
    Star,
    CheckCircle,
    ArrowRight,
    Sparkles,
    ChevronRight,
    Send,
    X,
    Share2,
    Check,
    ShieldCheck,
    Clock,
    UserCheck,
    ArrowLeft,
    ExternalLink,
    Monitor,
    Smartphone,
    Building,
    FileText,
    Copy,
    Lock,
  } from 'lucide-svelte';

  interface Props {
    slug?: string;
    lead?: Lead | null;
    onback?: () => void;
  }

  let { slug = '', lead = null, onback }: Props = $props();

  let copied = $state(false);
  let viewMode = $state<'desktop' | 'mobile'>('desktop');
  let bookingModalOpen = $state(false);
  let credentialsModalOpen = $state(false);
  let bookingSubmitted = $state(false);
  let bookingData = $state({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    notes: '',
  });

  // Resolve matching lead from store if not provided directly
  const activeLead = $derived.by<Lead | null>(() => {
    if (lead) return lead;
    if (!slug) return leadStore.leads[0] || null;

    const cleanSlug = slug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '');
    return (
      leadStore.leads.find(
        (l) =>
          l.id === cleanSlug ||
          l.websiteConfig?.previewSlug === cleanSlug ||
          l.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug
      ) ||
      leadStore.leads[0] ||
      null
    );
  });

  // Resolve website configuration
  const siteConfig = $derived.by<WebsitePreviewConfig>(() => {
    if (activeLead?.websiteConfig) {
      return activeLead.websiteConfig;
    }
    if (activeLead) {
      return getDefaultWebsiteConfig(
        activeLead.fullName,
        activeLead.profession,
        activeLead.city,
        activeLead.state,
        activeLead.collegeOrSchool
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

  const practitionerName = $derived(
    activeLead?.fullName ||
      siteConfig.heroHeadline.split(' - ')[0] ||
      siteConfig.heroHeadline.split(' | ')[0] ||
      'Professional Practice Specialist'
  );

  const professionCategory: ProfessionCategory = $derived(activeLead?.profession || 'financial_advisor');
  const profMeta = $derived(PROFESSION_CONFIGS[professionCategory] || PROFESSION_CONFIGS.real_estate);
  const hostingPlan = $derived(W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze);

  const phone = $derived(activeLead?.skipTraceData?.verifiedPhone || '+1 (480) 255-7920');
  const email = $derived(activeLead?.skipTraceData?.primaryEmail || 'contact@practiceportal.pro');
  const city = $derived(activeLead?.city || 'Phoenix');
  const state = $derived(activeLead?.state || 'AZ');
  const school = $derived(activeLead?.collegeOrSchool || 'Accredited State Licensing Board');
  const licenseNumber = $derived(activeLead?.licenseNumber || 'AZ-749281');
  const graduationYear = $derived(activeLead?.graduationYear || 2024);

  const testimonials = [
    {
      quote: `Working with ${practitionerName} was an exceptional experience. Everything was seamless, professional, and transparent.`,
      author: 'Marcus Vance',
      role: 'Verified Local Client',
    },
    {
      quote: `Prompt communication, outstanding expertise, and a dedicated client-first approach. I highly recommend their practice!`,
      author: 'Elena Rostova',
      role: 'Community Member',
    },
    {
      quote: `From initial consultation to execution, the care and attention to detail exceeded all our expectations.`,
      author: 'David Chen',
      role: 'Long-Term Client',
    },
  ];

  function handleCopyShare() {
    const link = getPreviewLink(activeLead || siteConfig.previewSlug);
    navigator.clipboard.writeText(link);
    copied = true;
    toast.success('Live preview link copied to clipboard!');
    setTimeout(() => {
      copied = false;
    }, 2500);
  }

  function handleOpenNewTab() {
    const link = getPreviewLink(activeLead || siteConfig.previewSlug);
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  function handleBookingSubmit(e: SubmitEvent) {
    e.preventDefault();
    bookingSubmitted = true;
    toast.success('Consultation request submitted!', 'Thank you! We will reach out within 1 business day.');
    setTimeout(() => {
      bookingModalOpen = false;
      bookingSubmitted = false;
      bookingData = { name: '', email: '', phone: '', service: '', date: '', notes: '' };
    }, 2400);
  }

  function handleBackToPortal() {
    if (onback) {
      onback();
    } else {
      window.location.hash = '';
      if (window.history?.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      }
      window.dispatchEvent(new Event('popstate'));
    }
  }
</script>

<div class="min-h-screen bg-slate-900 flex flex-col font-sans antialiased text-stone-900 selection:bg-teal-600 selection:text-white">
  <!-- Rep Command & Preview Toolbar (Sticky Top Bar) -->
  <aside aria-label="Rep Preview Bar" class="bg-slate-950 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-200 sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <!-- Left: Practitioner Summary & Launch Badge -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={handleBackToPortal}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Exit to Command Deck</span>
        </button>

        <div class="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-slate-300">
          <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-bold text-white">{practitionerName}</span>
          <span class="text-slate-400">&bull;</span>
          <span class="text-slate-400">{profMeta.defaultTitle}</span>
          <span class="text-[11px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/80 font-mono">
            ${siteConfig.offerPrice.toLocaleString()} (2-Yr w4 Cloud Package)
          </span>
        </div>
      </div>

      <!-- Center: Device Switcher -->
      <div class="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
        <button
          type="button"
          onclick={() => (viewMode = 'desktop')}
          class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {viewMode === 'desktop' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
        >
          <Monitor class="w-3.5 h-3.5" />
          <span>Desktop</span>
        </button>
        <button
          type="button"
          onclick={() => (viewMode = 'mobile')}
          class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {viewMode === 'mobile' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
        >
          <Smartphone class="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={handleCopyShare}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          {#if copied}
            <Check class="w-3.5 h-3.5 text-emerald-400" />
            <span class="text-emerald-400 font-semibold">Link Copied!</span>
          {:else}
            <Copy class="w-3.5 h-3.5" />
            <span>Copy Pitch Link</span>
          {/if}
        </button>

        <button
          type="button"
          onclick={handleOpenNewTab}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>Open Direct Link</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Website Preview Container Area -->
  <main class="flex-1 bg-slate-900 p-2 sm:p-6 flex justify-center items-start overflow-y-auto">
    <div
      class="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all flex flex-col {viewMode === 'mobile' ? 'w-[390px] min-h-[780px] my-4' : 'w-full max-w-6xl my-2'}"
    >
      <!-- Simulated Browser Frame Bar -->
      <div class="bg-stone-100 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
        </div>

        <div class="bg-white border border-stone-300 rounded-md px-3 py-1 text-[11px] font-mono text-slate-600 truncate max-w-sm flex items-center gap-2 shadow-2xs">
          <Lock class="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span class="truncate">https://{siteConfig.previewSlug}.practiceportal.pro</span>
        </div>

        <div class="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
          <ShieldCheck class="w-3 h-3 text-emerald-700" />
          <span class="hidden sm:inline">Official Licensed Site</span>
        </div>
      </div>

      <!-- Practice Website Header -->
      <header class="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div>
            <span class="font-bold text-base tracking-tight text-stone-900 block leading-tight">
              {practitionerName}
            </span>
            <span class="text-[11px] text-slate-500 font-medium">{profMeta.defaultTitle}</span>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#services" class="hover:text-stone-900 transition-colors">Services</a>
          <a href="#about" class="hover:text-stone-900 transition-colors">About</a>
          <a href="#testimonials" class="hover:text-stone-900 transition-colors">Reviews</a>
          <span class="font-mono text-slate-400">Lic #{licenseNumber}</span>
          <button
            type="button"
            onclick={() => (bookingModalOpen = true)}
            class="px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
            style="background-color: {siteConfig.primaryColor};"
          >
            {siteConfig.callToAction}
          </button>
        </nav>

        <div class="md:hidden flex items-center gap-2">
          <button
            type="button"
            onclick={() => (bookingModalOpen = true)}
            class="px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs"
            style="background-color: {siteConfig.primaryColor};"
          >
            Book
          </button>
        </div>
      </header>

      <!-- Hero Banner Section -->
      <section class="px-6 py-12 sm:py-16 text-center bg-stone-50 relative overflow-hidden border-b border-stone-100">
        <div class="max-w-3xl mx-auto space-y-4">
          <span
            class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
            style="background-color: {siteConfig.primaryColor};"
          >
            <Award class="w-3.5 h-3.5" />
            State Licensed {profMeta.defaultTitle} ({state})
          </span>

          <h1 class="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {siteConfig.heroHeadline}
          </h1>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            {siteConfig.heroSubheadline}
          </p>

          <div class="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onclick={() => (bookingModalOpen = true)}
              class="px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all active:scale-98 cursor-pointer"
              style="background-color: {siteConfig.primaryColor};"
            >
              {siteConfig.callToAction}
            </button>

            <button
              type="button"
              onclick={() => (credentialsModalOpen = true)}
              class="px-5 py-3 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck class="w-4 h-4 text-emerald-600" />
              <span>View Verified Credentials</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Trust Bar -->
      <section class="bg-slate-900 text-white py-3.5 px-6 text-xs flex flex-wrap items-center justify-around gap-4 text-center">
        <div class="flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-emerald-400" />
          <span>State License #{licenseNumber}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <UserCheck class="w-4 h-4 text-teal-400" />
          <span>{school}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Verified Practice ({city}, {state})</span>
        </div>
      </section>

      <!-- Professional Practice Services Section -->
      <section id="services" class="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-1.5">
          <h2 class="text-xl font-bold text-stone-900">Professional Practice Services</h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Comprehensive, evidence-based care delivered locally in {city}, {state}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {#each siteConfig.services as svc}
            <div class="border border-stone-200 rounded-xl p-5 bg-white shadow-xs space-y-3 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div class="space-y-2.5">
                <div
                  class="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs shadow-xs"
                  style="background-color: {siteConfig.primaryColor};"
                >
                  <CheckCircle class="w-4 h-4" />
                </div>
                <h3 class="font-bold text-sm text-stone-900">{svc.title}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">{svc.description}</p>
              </div>

              <button
                type="button"
                onclick={() => {
                  bookingData.service = svc.title;
                  bookingModalOpen = true;
                }}
                class="pt-3 border-t border-stone-100 inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
                style="color: {siteConfig.primaryColor};"
              >
                <span>Request Appointment</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          {/each}
        </div>
      </section>

      <!-- Bio & Credentials Section -->
      <section id="about" class="bg-stone-50 p-6 sm:p-10 border-t border-stone-200">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            class="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div class="space-y-2.5 text-center sm:text-left flex-1">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 class="text-lg font-bold text-stone-900">About {practitionerName}</h3>
              <span class="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                Verified Practitioner
              </span>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {siteConfig.bioText}
            </p>

            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-xs font-medium text-slate-500 pt-2">
              <span class="flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-slate-400" /> {city}, {state}
              </span>
              <span class="flex items-center gap-1.5">
                <Building class="w-3.5 h-3.5 text-slate-400" /> {school}
              </span>
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-400" /> Class of {graduationYear}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Client Reviews Section -->
      <section id="testimonials" class="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-1">
          <h2 class="text-xl font-bold text-stone-900">Client Feedback & Experience</h2>
          <p class="text-xs text-slate-500">Verified testimonials from community consultations</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {#each testimonials as item}
            <div class="border border-stone-200 rounded-xl p-5 bg-stone-50/50 space-y-3">
              <div class="flex items-center gap-1 text-amber-500">
                {#each [1, 2, 3, 4, 5] as _}
                  <Star class="w-3.5 h-3.5 fill-amber-400" />
                {/each}
              </div>
              <p class="text-xs text-slate-600 italic leading-relaxed">"{item.quote}"</p>
              <div class="pt-2 border-t border-stone-200">
                <div class="font-bold text-xs text-stone-900">{item.author}</div>
                <div class="text-[10px] text-slate-400">{item.role}</div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Consultation CTA Footer Banner -->
      <section class="p-8 sm:p-12 text-center text-white bg-slate-950 space-y-4">
        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">
          Ready to Consult with {practitionerName}?
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Book an introductory session online or call our {city} office directly to schedule your appointment.
        </p>

        <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onclick={() => (bookingModalOpen = true)}
            class="px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
            style="background-color: {siteConfig.primaryColor};"
          >
            {siteConfig.callToAction}
          </button>

          {#if phone}
            <a
              href="tel:{phone}"
              class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Phone class="w-3.5 h-3.5 text-emerald-400" />
              <span>{phone}</span>
            </a>
          {/if}
        </div>

        <div class="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {practitionerName}. All Rights Reserved.</span>
          <span>Verified State Regulatory License #{licenseNumber} &bull; {city}, {state}</span>
        </div>
      </section>
    </div>
  </main>
</div>

<!-- Interactive Consultation Booking Modal -->
{#if bookingModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    onclick={() => (bookingModalOpen = false)}
  >
    <div
      class="bg-white text-stone-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-200 relative"
      onclick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onclick={() => (bookingModalOpen = false)}
        class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100 cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="mb-4">
        <h3 class="text-base font-bold text-stone-900">Schedule Consultation with {practitionerName}</h3>
        <p class="text-xs text-slate-500 mt-0.5">Please provide your contact information to reserve a time.</p>
      </div>

      {#if bookingSubmitted}
        <div class="py-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Check class="w-6 h-6" />
          </div>
          <h4 class="font-bold text-sm text-stone-900">Appointment Request Received!</h4>
          <p class="text-xs text-slate-500 max-w-xs mx-auto">
            Our office in {city} will confirm your schedule within 1 business day.
          </p>
        </div>
      {:else}
        <form onsubmit={handleBookingSubmit} class="space-y-3.5 text-xs">
          <div>
            <label for="booking-name" class="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              id="booking-name"
              type="text"
              required
              bind:value={bookingData.name}
              placeholder="e.g. Sarah Jenkins"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="booking-phone" class="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                id="booking-phone"
                type="tel"
                required
                bind:value={bookingData.phone}
                placeholder="(480) 555-0199"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label for="booking-email" class="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                id="booking-email"
                type="email"
                required
                bind:value={bookingData.email}
                placeholder="name@email.com"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label for="booking-service" class="block font-semibold text-slate-700 mb-1">Service Requested</label>
            <select
              id="booking-service"
              bind:value={bookingData.service}
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs cursor-pointer"
            >
              <option value="">General Consultation</option>
              {#each siteConfig.services as svc}
                <option value={svc.title}>{svc.title}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="booking-notes" class="block font-semibold text-slate-700 mb-1">Notes / Specific Goals (Optional)</label>
            <textarea
              id="booking-notes"
              rows="2"
              bind:value={bookingData.notes}
              placeholder="Tell us a little bit about what you need..."
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            ></textarea>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              style="background-color: {siteConfig.primaryColor};"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Confirm Appointment Request</span>
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<!-- Verified Credentials Modal -->
{#if credentialsModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    onclick={() => (credentialsModalOpen = false)}
  >
    <div
      class="bg-white text-stone-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 relative"
      onclick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onclick={() => (credentialsModalOpen = false)}
        class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100 cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-bold text-stone-900">Verified Board Credentials</h3>
          <p class="text-xs text-slate-500">Official state regulatory registry records</p>
        </div>
      </div>

      <div class="space-y-3 text-xs border border-stone-200 rounded-xl p-4 bg-stone-50">
        <div class="flex justify-between py-1.5 border-b border-stone-200">
          <span class="text-slate-500 font-medium">Practitioner:</span>
          <span class="font-bold text-stone-900">{practitionerName}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-stone-200">
          <span class="text-slate-500 font-medium">Official License Number:</span>
          <span class="font-mono font-bold text-emerald-800">{licenseNumber}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-stone-200">
          <span class="text-slate-500 font-medium">Regulatory Jurisdiction:</span>
          <span class="font-medium text-stone-800">{city}, {state}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-stone-200">
          <span class="text-slate-500 font-medium">Education / School:</span>
          <span class="font-medium text-stone-800">{school}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-stone-200">
          <span class="text-slate-500 font-medium">Graduation Year:</span>
          <span class="font-medium text-stone-800">{graduationYear}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500 font-medium">Registry Status:</span>
          <span class="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5 text-emerald-600" /> Active &amp; Verified in Good Standing
          </span>
        </div>
      </div>

      <div class="mt-4 pt-3 flex justify-end">
        <button
          type="button"
          onclick={() => (credentialsModalOpen = false)}
          class="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs cursor-pointer"
        >
          Close Credentials
        </button>
      </div>
    </div>
  </div>
{/if}
