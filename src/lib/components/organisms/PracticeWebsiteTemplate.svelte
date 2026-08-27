<script lang="ts">
  import {
    type Lead,
    type WebsitePreviewConfig,
    type ProfessionCategory,
    PROFESSION_CONFIGS,
    W4_HOSTING_PLANS,
  } from '../../types/lead';
  import { copyTextToClipboard } from '../../services/clipboard';
  import { toast } from '../../stores/toast.svelte';
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
    Check,
    ShieldCheck,
    Clock,
    UserCheck,
    Lock,
    Copy,
    Building,
    ExternalLink,
  } from 'lucide-svelte';

  interface Props {
    lead?: Lead | null;
    siteConfig: WebsitePreviewConfig;
    deviceMode?: 'desktop' | 'mobile';
    previewUrl?: string;
    frameless?: boolean;
  }

  let {
    lead = null,
    siteConfig,
    deviceMode = 'desktop',
    previewUrl = '',
    frameless = false,
  }: Props = $props();

  let bookingModalOpen = $state(false);
  let credentialsModalOpen = $state(false);
  let bookingSubmitted = $state(false);
  let heroBookingSubmitted = $state(false);
  let urlCopied = $state(false);

  let bookingData = $state({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    notes: '',
  });

  let heroBookingData = $state({
    name: '',
    phone: '',
    email: '',
    service: '',
  });

  const practitionerName = $derived(
    lead?.fullName ||
      siteConfig.heroHeadline.split(' - ')[0] ||
      siteConfig.heroHeadline.split(' | ')[0] ||
      'Professional Practice Specialist'
  );

  const professionCategory: ProfessionCategory = $derived(lead?.profession || 'dental');
  const profMeta = $derived(PROFESSION_CONFIGS[professionCategory] || PROFESSION_CONFIGS.real_estate);
  const hostingPlan = $derived(W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze);

  const phone = $derived(lead?.skipTraceData?.verifiedPhone || '+1 (480) 255-7920');
  const email = $derived(lead?.skipTraceData?.primaryEmail || 'contact@practiceportal.pro');
  const city = $derived(lead?.city || 'Phoenix');
  const state = $derived(lead?.state || 'AZ');
  const school = $derived(lead?.collegeOrSchool || 'Accredited State Licensing Board');
  const licenseNumber = $derived(lead?.licenseNumber || 'AZ-749281');
  const graduationYear = $derived(lead?.graduationYear || 2024);

  const isDarkTheme = $derived((siteConfig.templateTheme || 'executive_dark') === 'executive_dark');

  const testimonials = [
    {
      quote: `Working with ${practitionerName} was an exceptional experience. Everything was seamless, professional, and transparent.`,
      author: 'Marcus Vance',
      role: 'Verified Local Client',
    },
    {
      quote: `Prompt communication, outstanding expertise, and a dedicated patient-first approach. I highly recommend their practice!`,
      author: 'Elena Rostova',
      role: 'Community Member',
    },
    {
      quote: `From initial consultation to execution, the care and attention to detail exceeded all our expectations.`,
      author: 'David Chen',
      role: 'Long-Term Client',
    },
  ];

  async function handleCopyAddressBarUrl() {
    if (!previewUrl) return;
    const success = await copyTextToClipboard(previewUrl);
    if (success) {
      urlCopied = true;
      toast.success('Live preview URL copied to clipboard!');
      setTimeout(() => {
        urlCopied = false;
      }, 2500);
    }
  }

  function handleBookingSubmit(e: SubmitEvent) {
    e.preventDefault();
    bookingSubmitted = true;
    toast.success('Consultation request registered!', 'We will reach out within 1 business day.');
    setTimeout(() => {
      bookingModalOpen = false;
      bookingSubmitted = false;
      bookingData = { name: '', email: '', phone: '', service: '', date: '', notes: '' };
    }, 2400);
  }

  function handleHeroBookingSubmit(e: SubmitEvent) {
    e.preventDefault();
    heroBookingSubmitted = true;
    toast.success('Appointment request submitted!', 'Thank you! We will reach out within 1 business day.');
    setTimeout(() => {
      heroBookingSubmitted = false;
      heroBookingData = { name: '', phone: '', email: '', service: '' };
    }, 2500);
  }
</script>

<div
  class="{frameless
    ? 'w-full min-h-screen flex flex-col'
    : `transition-all rounded-xl overflow-hidden shadow-2xl border flex flex-col ${deviceMode === 'mobile' ? 'w-[385px] min-h-[720px]' : 'w-full'}`} {isDarkTheme ? 'bg-slate-950 text-slate-100 border-slate-800 selection:bg-teal-500 selection:text-white' : 'bg-white text-stone-900 border-slate-200 selection:bg-teal-600 selection:text-white'}"
>
  {#if !frameless}
    <!-- Browser Chrome Address Bar -->
    <div class="px-4 py-2.5 border-b flex items-center justify-between text-xs {isDarkTheme ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-stone-100 border-stone-200 text-slate-500'}">
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
      </div>

      <!-- Active Real URL Bar with Copy Button -->
      <button
        type="button"
        onclick={handleCopyAddressBarUrl}
        title="Click to copy live URL"
        class="border rounded-md px-3 py-1 text-[11px] font-mono truncate max-w-sm sm:max-w-md flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer {isDarkTheme ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-teal-500/50' : 'bg-white border-stone-300 text-slate-600 hover:border-teal-500/50'}"
      >
        <Lock class="w-3 h-3 text-emerald-500 flex-shrink-0" />
        <span class="truncate">{previewUrl || `https://${siteConfig.previewSlug || 'portal'}.practiceportal.pro`}</span>
        {#if urlCopied}
          <Check class="w-3 h-3 text-emerald-400 flex-shrink-0 ml-1" />
        {:else}
          <Copy class="w-3 h-3 text-slate-400 hover:text-slate-200 flex-shrink-0 ml-1" />
        {/if}
      </button>

      <div class="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 {isDarkTheme ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80' : 'text-emerald-800 bg-emerald-100/90 border-emerald-300'}">
        <ShieldCheck class="w-3 h-3 text-emerald-500" />
        <span class="hidden sm:inline">Official Licensed Site</span>
      </div>
    </div>
  {/if}

  <!-- Practice Website Container -->
  <div class="{frameless ? 'w-full flex-1 flex flex-col' : 'flex-1 overflow-y-auto custom-scrollbar'}">
    {#if isDarkTheme}
      <!-- ============================================== -->
      <!-- TEMPLATE 1: EXECUTIVE DARK (FULL SUITE & FORM) -->
      <!-- ============================================== -->

      <!-- Main Website Header -->
      <header class="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xs px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-base flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div>
            <div class="font-bold text-base sm:text-lg text-white leading-tight">
              {practitionerName}
            </div>
            <div class="text-xs text-slate-400 font-medium">
              {siteConfig.tagline} &bull; {city}, {state}
            </div>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#services" class="hover:text-white transition-colors">Services</a>
          <a href="#about" class="hover:text-white transition-colors">About</a>
          <a href="#testimonials" class="hover:text-white transition-colors">Testimonials</a>
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
            class="px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs cursor-pointer"
            style="background-color: {siteConfig.primaryColor};"
          >
            Book
          </button>
        </div>
      </header>

      <!-- Hero Section with Integrated Appointment Card -->
      <section class="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 sm:py-16 px-6 overflow-hidden">
        <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div class="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-7 space-y-4 text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-emerald-400 font-medium">
              <Award class="w-3.5 h-3.5" />
              <span>Board Certified &bull; Welcoming New Clients &amp; Patients</span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {siteConfig.heroHeadline}
            </h1>

            <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {siteConfig.heroSubheadline}
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onclick={() => (bookingModalOpen = true)}
                class="px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2 transition-all hover:scale-102 active:scale-98 text-xs sm:text-sm cursor-pointer"
                style="background-color: {siteConfig.primaryColor};"
              >
                <span>{siteConfig.callToAction}</span>
                <ArrowRight class="w-4 h-4" />
              </button>

              <button
                type="button"
                onclick={() => (credentialsModalOpen = true)}
                class="px-4 py-2.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <ShieldCheck class="w-4 h-4 text-emerald-400" />
                <span>Verified Credentials</span>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 max-w-md text-xs">
              <div>
                <div class="text-xl font-bold text-white">4.9/5.0</div>
                <div class="text-[11px] text-slate-400 flex items-center gap-1">
                  <Star class="w-3 h-3 text-amber-400 fill-amber-400" /> Verified Reviews
                </div>
              </div>
              <div>
                <div class="text-xl font-bold text-white">100%</div>
                <div class="text-[11px] text-slate-400">Digital Onboarding</div>
              </div>
              <div>
                <div class="text-xl font-bold text-white">24/7</div>
                <div class="text-[11px] text-slate-400">Online Intake</div>
              </div>
            </div>
          </div>

          <!-- Quick Booking Card on Hero -->
          <div class="lg:col-span-5">
            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative text-left">
              <div class="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles class="w-3 h-3" /> Quick Intake
              </div>

              <h2 class="text-base font-bold text-white mb-1">Request an Appointment</h2>
              <p class="text-xs text-slate-400 mb-4">
                Fill out the quick form below for prompt scheduling within 1 business day.
              </p>

              {#if heroBookingSubmitted}
                <div class="py-8 text-center space-y-2">
                  <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check class="w-5 h-5" />
                  </div>
                  <h4 class="font-bold text-xs text-white">Appointment Request Sent!</h4>
                  <p class="text-[11px] text-slate-400">We will contact you shortly.</p>
                </div>
              {:else}
                <form onsubmit={handleHeroBookingSubmit} class="space-y-3 text-xs">
                  <div>
                    <label for="hero-name" class="block font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      id="hero-name"
                      type="text"
                      required
                      bind:value={heroBookingData.name}
                      placeholder="e.g. Sarah Jenkins"
                      class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-2.5">
                    <div>
                      <label for="hero-phone" class="block font-medium text-slate-300 mb-1">Phone</label>
                      <input
                        id="hero-phone"
                        type="tel"
                        required
                        bind:value={heroBookingData.phone}
                        placeholder="(480) 555-0199"
                        class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label for="hero-email" class="block font-medium text-slate-300 mb-1">Email</label>
                      <input
                        id="hero-email"
                        type="email"
                        required
                        bind:value={heroBookingData.email}
                        placeholder="name@email.com"
                        class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="hero-service" class="block font-medium text-slate-300 mb-1">Service Needed</label>
                    <select
                      id="hero-service"
                      bind:value={heroBookingData.service}
                      class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">General Consultation</option>
                      {#each siteConfig.services as srv}
                        <option value={srv.title}>{srv.title}</option>
                      {/each}
                    </select>
                  </div>

                  <button
                    type="submit"
                    class="w-full py-2.5 rounded-lg font-semibold text-white text-xs shadow transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                    style="background-color: {siteConfig.primaryColor};"
                  >
                    <Send class="w-3.5 h-3.5" />
                    <span>Submit Appointment Request</span>
                  </button>
                </form>
              {/if}
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Bar -->
      <section class="bg-slate-950 border-y border-slate-800/80 text-white py-3.5 px-6 text-xs flex flex-wrap items-center justify-around gap-4 text-center">
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

      <!-- Services Section -->
      <section id="services" class="py-12 sm:py-16 px-6 bg-slate-900 text-slate-100">
        <div class="max-w-6xl mx-auto space-y-8">
          <div class="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 class="text-xs font-bold tracking-widest text-teal-400 uppercase">
              Comprehensive Care &amp; Services
            </h2>
            <h3 class="text-xl sm:text-2xl font-extrabold text-white">
              Specialized Services Tailored to You
            </h3>
            <p class="text-xs text-slate-400">
              Providing modern, compassionate, and evidence-based solutions in {city}, {state}.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {#each siteConfig.services as srv}
              <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-all shadow-lg flex flex-col justify-between space-y-4 text-left">
                <div class="space-y-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow"
                    style="background-color: {siteConfig.primaryColor};"
                  >
                    <Sparkles class="w-5 h-5" />
                  </div>
                  <h4 class="text-base font-bold text-white">{srv.title}</h4>
                  <p class="text-xs text-slate-300 leading-relaxed">{srv.description}</p>
                </div>

                <button
                  type="button"
                  onclick={() => {
                    bookingData.service = srv.title;
                    bookingModalOpen = true;
                  }}
                  class="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:underline pt-3 border-t border-slate-700/60 cursor-pointer"
                >
                  <span>Request Information</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- About & Bio Section -->
      <section id="about" class="py-12 sm:py-16 px-6 bg-slate-950 border-t border-slate-800/80">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6 text-left">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div class="space-y-2.5 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-lg font-bold text-white">About {practitionerName}</h3>
              <span class="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-800/80">
                Verified Practitioner
              </span>
            </div>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {siteConfig.bioText}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-2">
              <span class="flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-slate-500" /> {city}, {state}
              </span>
              <span class="flex items-center gap-1.5">
                <Building class="w-3.5 h-3.5 text-slate-500" /> {school}
              </span>
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-500" /> Class of {graduationYear}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="py-12 sm:py-16 px-6 bg-slate-900 border-t border-slate-800/80">
        <div class="max-w-5xl mx-auto space-y-6">
          <div class="text-center space-y-1">
            <h3 class="text-lg font-bold text-white">Client Feedback &amp; Experiences</h3>
            <p class="text-xs text-slate-400">Verified reviews from community consultations</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {#each testimonials as item}
              <div class="border border-slate-800 rounded-xl p-5 bg-slate-950/70 space-y-3 text-left">
                <div class="flex items-center gap-1 text-amber-400">
                  {#each [1, 2, 3, 4, 5] as _}
                    <Star class="w-3.5 h-3.5 fill-amber-400" />
                  {/each}
                </div>
                <p class="text-xs text-slate-300 italic leading-relaxed">"{item.quote}"</p>
                <div class="pt-2 border-t border-slate-800">
                  <div class="font-bold text-xs text-white">{item.author}</div>
                  <div class="text-[10px] text-slate-400">{item.role}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- CTA Footer -->
      <footer class="py-10 px-6 text-center text-white bg-slate-950 border-t border-slate-800 space-y-4">
        <h3 class="text-lg sm:text-xl font-extrabold">Ready to Consult with {practitionerName}?</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Schedule an introductory session online or call our {city} office directly.
        </p>

        <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onclick={() => (bookingModalOpen = true)}
            class="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
            style="background-color: {siteConfig.primaryColor};"
          >
            {siteConfig.callToAction}
          </button>
          {#if phone}
            <a
              href="tel:{phone}"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Phone class="w-3.5 h-3.5 text-emerald-400" />
              <span>{phone}</span>
            </a>
          {/if}
        </div>

        <div class="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto">
          <span>&copy; {new Date().getFullYear()} {practitionerName}. All Rights Reserved.</span>
          <span>Verified State License #{licenseNumber} &bull; {city}, {state}</span>
        </div>
      </footer>

    {:else}
      <!-- ============================================== -->
      <!-- TEMPLATE 2: CLINICAL LIGHT (CLEAN STANDARD)   -->
      <!-- ============================================== -->

      <!-- Light Header -->
      <header class="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div class="text-left">
            <span class="font-bold text-base tracking-tight text-stone-900 block leading-tight">
              {practitionerName}
            </span>
            <span class="text-[11px] text-slate-500 font-medium">{profMeta.defaultTitle}</span>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#services" class="hover:text-stone-900 transition-colors">Services</a>
          <a href="#about" class="hover:text-stone-900 transition-colors">About</a>
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
      </header>

      <!-- Light Hero Section -->
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
              class="px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
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

      <!-- Light Trust Bar -->
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

      <!-- Light Services Grid -->
      <section id="services" class="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
        <div class="text-center space-y-1.5">
          <h2 class="text-xl font-bold text-stone-900">Professional Practice Services</h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Comprehensive care delivered locally in {city}, {state}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {#each siteConfig.services as svc}
            <div class="border border-stone-200 rounded-xl p-5 bg-white shadow-xs space-y-3 hover:border-stone-300 transition-all flex flex-col justify-between text-left">
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

      <!-- Light Bio Section -->
      <section id="about" class="bg-stone-50 p-6 sm:p-10 border-t border-stone-200 text-left">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0"
            style="background-color: {siteConfig.primaryColor};"
          >
            {practitionerName.charAt(0)}
          </div>
          <div class="space-y-2.5 flex-1">
            <h3 class="text-lg font-bold text-stone-900">About {practitionerName}</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{siteConfig.bioText}</p>
            <div class="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500 pt-2">
              <span class="flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5 text-slate-400" /> {city}, {state}</span>
              <span class="flex items-center gap-1.5"><Building class="w-3.5 h-3.5 text-slate-400" /> {school}</span>
              <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5 text-slate-400" /> Class of {graduationYear}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Light Footer -->
      <footer class="p-8 text-center text-white bg-slate-950 space-y-4">
        <h3 class="text-xl font-extrabold">Ready to Consult with {practitionerName}?</h3>
        <button
          type="button"
          onclick={() => (bookingModalOpen = true)}
          class="px-6 py-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
          style="background-color: {siteConfig.primaryColor};"
        >
          {siteConfig.callToAction}
        </button>
        <div class="pt-6 border-t border-slate-800 text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} {practitionerName} &bull; State License #{licenseNumber}
        </div>
      </footer>
    {/if}
  </div>
</div>

<!-- Modal: Schedule Consultation -->
{#if bookingModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    onclick={() => (bookingModalOpen = false)}
  >
    <div
      class="bg-white text-stone-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-200 relative text-left"
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
            <label for="modal-booking-name" class="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              id="modal-booking-name"
              type="text"
              required
              bind:value={bookingData.name}
              placeholder="e.g. Sarah Jenkins"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="modal-booking-phone" class="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                id="modal-booking-phone"
                type="tel"
                required
                bind:value={bookingData.phone}
                placeholder="(480) 555-0199"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
            <div>
              <label for="modal-booking-email" class="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                id="modal-booking-email"
                type="email"
                required
                bind:value={bookingData.email}
                placeholder="name@email.com"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label for="modal-booking-service" class="block font-semibold text-slate-700 mb-1">Service Requested</label>
            <select
              id="modal-booking-service"
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
            <label for="modal-booking-notes" class="block font-semibold text-slate-700 mb-1">Notes / Specific Goals (Optional)</label>
            <textarea
              id="modal-booking-notes"
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

<!-- Modal: Verified Credentials -->
{#if credentialsModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    onclick={() => (credentialsModalOpen = false)}
  >
    <div
      class="bg-white text-stone-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 relative text-left"
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
