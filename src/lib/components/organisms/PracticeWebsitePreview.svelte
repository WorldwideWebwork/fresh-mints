<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { getDefaultWebsiteConfig } from '../../services/website-templates';
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
  } from 'lucide-svelte';

  interface Props {
    slug?: string;
    lead?: Lead | null;
    onback?: () => void;
  }

  let { slug = '', lead = null, onback }: Props = $props();

  let copied = $state(false);
  let bookingModalOpen = $state(false);
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
  const activeLead = $derived.by(() => {
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
  const address = $derived(activeLead?.skipTraceData?.currentAddress || `${city}, ${state}`);
  const school = $derived(activeLead?.collegeOrSchool || 'Accredited Graduate Academy');
  const licenseNumber = $derived(activeLead?.licenseNumber || 'CRD#47298427');

  const testimonials = [
    {
      quote: `Working with ${practitionerName} was an exceptional experience. Everything was seamless, professional, and transparent.`,
      author: 'Marcus Vance',
      role: 'Verified Local Client',
    },
    {
      quote: `Prompt communication, outstanding expertise, and a dedicated patient-first approach. I highly recommend their services!`,
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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      copied = true;
      toast.success('Live preview link copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2500);
    }
  }

  function handleBookingSubmit(e: SubmitEvent) {
    e.preventDefault();
    bookingSubmitted = true;
    toast.success('Consultation request registered!');
    setTimeout(() => {
      bookingModalOpen = false;
      bookingSubmitted = false;
      bookingData = { name: '', email: '', phone: '', service: '', date: '', notes: '' };
    }, 2800);
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

<div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
  <!-- Top Demo & Hosting Continuity Banner -->
  <aside aria-label="Hosting status" class="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-slate-300">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
          Live Client Preview
        </span>
        <span class="text-slate-300 hidden sm:inline">
          Turnkey Launch Reserved for <strong class="text-slate-900 dark:text-white">{practitionerName}</strong> &bull; Includes 24 Months of w4 Managed Cloud Hosting (${hostingPlan.monthlyBaseRate}/mo post-2yr)
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          id="copy-preview-link-btn"
          onclick={handleCopyShare}
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
        >
          {#if copied}
            <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Link Copied!</span>
          {:else}
            <Share2 class="w-3.5 h-3.5" />
            <span>Share Preview</span>
          {/if}
        </button>

        <button
          type="button"
          onclick={handleBackToPortal}
          class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-300 text-xs font-semibold underline underline-offset-2 cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Command Deck</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Website Header -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-md font-bold text-xl flex-shrink-0"
          style="background-color: {siteConfig.primaryColor};"
        >
          {practitionerName.charAt(0)}
        </div>
        <div>
          <div class="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
            {practitionerName}
          </div>
          <div class="text-xs text-slate-500 font-medium">
            {siteConfig.tagline} &bull; {city}, {state}
          </div>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#services" class="hover:text-slate-900 transition-colors">Services</a>
        <a href="#about" class="hover:text-slate-900 transition-colors">About</a>
        <a href="#testimonials" class="hover:text-slate-900 transition-colors">Testimonials</a>
        <a href="#contact" class="hover:text-slate-900 transition-colors">Contact</a>
      </nav>

      <div class="flex items-center gap-3">
        {#if phone}
          <a
            href="tel:{phone}"
            class="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <Phone class="w-3.5 h-3.5 text-emerald-600" />
            <span>{phone}</span>
          </a>
        {/if}
        <button
          type="button"
          id="book-consultation-header-btn"
          onclick={() => (bookingModalOpen = true)}
          class="px-4 py-2.5 rounded-lg text-slate-900 dark:text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:opacity-95 active:scale-95 flex items-center gap-2 cursor-pointer"
          style="background-color: {siteConfig.primaryColor};"
        >
          <Calendar class="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-900 dark:text-white py-16 sm:py-24 overflow-hidden">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <Award class="w-3.5 h-3.5" />
          <span>Board Certified &bull; Welcoming New Clients &amp; Patients</span>
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {siteConfig.heroHeadline}
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          {siteConfig.heroSubheadline}
        </p>

        <div class="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            id="hero-cta-btn"
            onclick={() => (bookingModalOpen = true)}
            class="px-6 py-3.5 rounded-xl font-semibold text-slate-900 dark:text-white shadow-lg flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer"
            style="background-color: {siteConfig.primaryColor};"
          >
            <span>{siteConfig.callToAction}</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          {#if phone}
            <a
              href="tel:{phone}"
              class="px-5 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 text-sm sm:text-base transition-colors"
            >
              <Phone class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Call {phone}</span>
            </a>
          {/if}
        </div>

        <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-lg">
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">4.9/5.0</div>
            <div class="text-xs text-slate-400 flex items-center gap-1">
              <Star class="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-400" /> Verified Reviews
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div class="text-xs text-slate-400">Digital Onboarding</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">24/7</div>
            <div class="text-xs text-slate-400">Online Intake</div>
          </div>
        </div>
      </div>

      <!-- Quick Booking Card on Hero -->
      <div class="lg:col-span-5">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
          <div class="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles class="w-3 h-3" /> Quick Intake
          </div>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Request an Appointment</h2>
          <p class="text-xs text-slate-400 mb-6">
            Fill out the quick form below for prompt scheduling within 1 business day.
          </p>

          <form onsubmit={handleBookingSubmit} class="space-y-4">
            <div>
              <label for="hero-form-name" class="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
              <input
                id="hero-form-name"
                type="text"
                required
                bind:value={bookingData.name}
                placeholder="e.g. Sarah Jenkins"
                class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="hero-form-phone" class="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  id="hero-form-phone"
                  type="tel"
                  required
                  bind:value={bookingData.phone}
                  placeholder="(123) 456-7890"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label for="hero-form-email" class="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  id="hero-form-email"
                  type="email"
                  required
                  bind:value={bookingData.email}
                  placeholder="name@domain.com"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label for="hero-form-service" class="block text-xs font-medium text-slate-300 mb-1">Service Needed</label>
              <select
                id="hero-form-service"
                bind:value={bookingData.service}
                class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" class="bg-slate-800 text-slate-400">Select Service / Consultation Type</option>
                {#each siteConfig.services as srv}
                  <option value={srv.title} class="bg-slate-800 text-white">{srv.title}</option>
                {/each}
              </select>
            </div>

            <button
              type="submit"
              class="w-full py-3 rounded-lg font-semibold text-slate-900 dark:text-white text-sm shadow transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
              style="background-color: {siteConfig.primaryColor};"
            >
              <Send class="w-4 h-4" />
              <span>Submit Appointment Request</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="py-20 bg-slate-900 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-2">
          Comprehensive Care &amp; Services
        </h2>
        <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Specialized Services Tailored to You
        </h3>
        <p class="mt-4 text-slate-400 text-sm sm:text-base">
          Providing modern, compassionate, and evidence-based solutions for our local community.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each siteConfig.services as srv}
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 hover:border-slate-600 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-slate-900 dark:text-white mb-6 shadow"
                style="background-color: {siteConfig.primaryColor};"
              >
                <Sparkles class="w-6 h-6" />
              </div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-3">{srv.title}</h4>
              <p class="text-sm text-slate-300 leading-relaxed mb-6">{srv.description}</p>
            </div>

            <button
              type="button"
              onclick={() => {
                bookingData.service = srv.title;
                bookingModalOpen = true;
              }}
              class="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-300 transition-colors pt-4 border-t border-slate-700/60 cursor-pointer"
            >
              <span>Request Information</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- About & Bio Section -->
  <section id="about" class="py-20 bg-slate-950 border-t border-slate-800/60">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-5">
          <div class="relative mx-auto max-w-md bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 p-2 rounded-3xl border border-slate-800">
            <div class="bg-slate-900 rounded-2xl p-8 text-center space-y-4">
              <div
                class="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-slate-900 dark:text-white text-3xl font-bold shadow-xl ring-4 ring-slate-800"
                style="background-color: {siteConfig.primaryColor};"
              >
                {practitionerName.charAt(0)}
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">{practitionerName}</h3>
                <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{siteConfig.tagline}</p>
              </div>
              <div class="pt-4 border-t border-slate-800 space-y-2 text-left text-xs text-slate-300">
                <div class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{school}</span>
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Licensed &amp; Verified in {state} (#{licenseNumber})</span>
                </div>
                <div class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Active Practice in {city}, {state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-6">
          <h2 class="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
            Meet the Practitioner
          </h2>
          <h3 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Dedicated to Excellence &amp; Personalized Care
          </h3>
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            {siteConfig.bioText}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 class="font-semibold text-slate-900 dark:text-white text-sm mb-1">State of the Art Facilities</h4>
              <p class="text-xs text-slate-400">Equipped with the latest technology for streamlined consultation and care.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 class="font-semibold text-slate-900 dark:text-white text-sm mb-1">Client-First Philosophy</h4>
              <p class="text-xs text-slate-400">Clear communication, transparent scheduling, and dedicated attention.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-20 bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-2">
          Client Feedback
        </h2>
        <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white">What Our Community Says</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each testimonials as t, idx}
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 relative">
            <div class="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-4">
              {#each Array(5) as _}
                <Star class="w-4 h-4 fill-amber-400" />
              {/each}
            </div>
            <p class="text-sm text-slate-300 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
            <div class="pt-4 border-t border-slate-800/80">
              <div class="font-semibold text-sm text-slate-900 dark:text-white">{t.author}</div>
              <div class="text-xs text-slate-500">{t.role}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Contact & Location Footer -->
  <footer id="contact" class="bg-slate-950 border-t border-slate-800 py-16 text-slate-400 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
      <div class="md:col-span-5 space-y-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div class="font-bold text-lg text-slate-900 dark:text-white">{practitionerName}</div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
          Providing leading-edge practice solutions, seamless client intake, and verified local care in {city}, {state}.
        </p>
        <div class="text-xs text-slate-500 pt-4">
          &copy; {new Date().getFullYear()} {practitionerName}. All rights reserved.
        </div>
      </div>

      <div class="md:col-span-3 space-y-3">
        <h4 class="font-semibold text-slate-900 dark:text-white text-sm">Practice Hours</h4>
        <div class="space-y-1.5 text-xs text-slate-400">
          <div class="flex justify-between py-1 border-b border-slate-900">
            <span>Monday &ndash; Friday</span>
            <span class="text-slate-200">8:00 AM &ndash; 5:30 PM</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-900">
            <span>Saturday</span>
            <span class="text-slate-200">9:00 AM &ndash; 1:00 PM</span>
          </div>
          <div class="flex justify-between py-1">
            <span>Sunday</span>
            <span class="text-slate-500">Closed</span>
          </div>
        </div>
      </div>

      <div class="md:col-span-4 space-y-3">
        <h4 class="font-semibold text-slate-900 dark:text-white text-sm">Direct Contact</h4>
        <div class="space-y-2 text-xs">
          {#if phone}
            <div class="flex items-center gap-2 text-slate-300">
              <Phone class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <a href="tel:{phone}" class="hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors">
                {phone}
              </a>
            </div>
          {/if}
          {#if email}
            <div class="flex items-center gap-2 text-slate-300">
              <Mail class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <a href="mailto:{email}" class="hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition-colors">
                {email}
              </a>
            </div>
          {/if}
          <div class="flex items-center gap-2 text-slate-300">
            <MapPin class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{address}</span>
          </div>
        </div>
      </div>
    </div>
  </footer>

  <!-- Interactive Booking Modal -->
  {#if bookingModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onclick={() => (bookingModalOpen = false)}
    >
      <div
        class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative"
        onclick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onclick={() => (bookingModalOpen = false)}
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        {#if bookingSubmitted}
          <div class="text-center py-8 space-y-3">
            <div class="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <Check class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Consultation Request Received!</h3>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">
              Thank you! Our office manager will contact you at {bookingData.phone || 'your phone number'} within 1 business day to confirm your time.
            </p>
          </div>
        {:else}
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Book a Consultation</h3>
            <p class="text-xs text-slate-400 mb-6">
              Select your requested date and service with {practitionerName}.
            </p>

            <form onsubmit={handleBookingSubmit} class="space-y-4">
              <div>
                <label for="modal-form-name" class="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  id="modal-form-name"
                  type="text"
                  required
                  bind:value={bookingData.name}
                  placeholder="Jane Doe"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="modal-form-phone" class="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    id="modal-form-phone"
                    type="tel"
                    required
                    bind:value={bookingData.phone}
                    placeholder="(123) 456-7890"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label for="modal-form-email" class="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    id="modal-form-email"
                    type="email"
                    required
                    bind:value={bookingData.email}
                    placeholder="you@email.com"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label for="modal-form-date" class="block text-xs font-medium text-slate-300 mb-1">Preferred Date</label>
                <input
                  id="modal-form-date"
                  type="date"
                  bind:value={bookingData.date}
                  class="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label for="modal-form-notes" class="block text-xs font-medium text-slate-300 mb-1">Notes / Reason for Visit</label>
                <textarea
                  id="modal-form-notes"
                  rows={2}
                  bind:value={bookingData.notes}
                  placeholder="Briefly describe what you would like assistance with..."
                  class="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                class="w-full py-3 rounded-lg font-semibold text-slate-900 dark:text-white text-sm shadow transition-all hover:opacity-90 cursor-pointer"
                style="background-color: {siteConfig.primaryColor};"
              >
                Confirm Booking Request
              </button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
