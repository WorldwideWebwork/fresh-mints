'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useLeadStore } from '@/hooks/use-lead-store';
import { getDefaultWebsiteConfig } from '@/services/website-templates';
import { WebsitePreviewConfig, ProfessionCategory, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '@/types/lead';

interface PreviewClientProps {
  slug: string;
}

export default function PreviewClient({ slug }: PreviewClientProps) {
  const [copied, setCopied] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    notes: '',
  });

  const { leads } = useLeadStore();

  const matchingLead = leads.find(
    (l) =>
      l.id === slug ||
      l.websiteConfig?.previewSlug === slug ||
      l.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );

  let siteConfig: WebsitePreviewConfig;

  if (matchingLead && matchingLead.websiteConfig) {
    siteConfig = matchingLead.websiteConfig;
  } else if (matchingLead) {
    siteConfig = getDefaultWebsiteConfig(
      matchingLead.fullName,
      matchingLead.profession,
      matchingLead.city,
      matchingLead.state,
      matchingLead.collegeOrSchool
    );
  } else {
    const cleanName = slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const isDr = slug.includes('dr-') || slug.includes('doctor') || slug.includes('dental') || slug.includes('chiro');
    const detectedProf: ProfessionCategory = slug.includes('dental')
      ? 'dental'
      : slug.includes('chiro')
      ? 'chiropractic'
      : slug.includes('vet')
      ? 'veterinary'
      : slug.includes('realty') || slug.includes('real-estate')
      ? 'real_estate'
      : slug.includes('cpa') || slug.includes('tax') || slug.includes('finance')
      ? 'finance'
      : slug.includes('law') || slug.includes('legal')
      ? 'legal'
      : slug.includes('nurse')
      ? 'nursing'
      : 'therapy';

    siteConfig = getDefaultWebsiteConfig(
      isDr && !cleanName.startsWith('Dr.') ? `Dr. ${cleanName}` : cleanName,
      detectedProf,
      'Austin',
      'TX',
      'Accredited Graduate School'
    );
  }

  const practitionerName =
    matchingLead?.fullName ||
    siteConfig.heroHeadline.split(' - ')[0] ||
    siteConfig.heroHeadline.split(' | ')[0] ||
    'Professional Practice Specialist';

  const professionCategory = matchingLead?.profession || 'real_estate';
  const profMeta = PROFESSION_CONFIGS[professionCategory] || PROFESSION_CONFIGS.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;

  const phone = matchingLead?.skipTraceData?.verifiedPhone || '';
  const email = matchingLead?.skipTraceData?.primaryEmail || '';
  const city = matchingLead?.city || 'San Francisco';
  const state = matchingLead?.state || 'CA';
  const address = matchingLead?.skipTraceData?.currentAddress || `${city}, ${state}`;
  const school = matchingLead?.collegeOrSchool || 'Accredited Board Certification Program';

  const testimonials = [
    {
      quote: `Working with ${practitionerName} was an exceptional experience. Everything was seamless, professional, and transparent.`,
      author: 'Marcus Vance',
      role: 'Verified Local Client',
    },
    {
      quote: `Prompt communication, outstanding expertise, and a patient-first approach. I highly recommend their services!`,
      author: 'Elena Rostova',
      role: 'Community Member',
    },
    {
      quote: `From consultation to execution, the care and attention to detail exceeded all our expectations.`,
      author: 'David Chen',
      role: 'Long-term Client',
    },
  ];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingModalOpen(false);
      setBookingSubmitted(false);
      setBookingData({ name: '', email: '', phone: '', service: '', date: '', notes: '' });
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Demo & Hosting Continuity Banner */}
      <aside aria-label="Hosting status" className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300 uppercase tracking-wider text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Live Preview
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Reserved for <strong className="text-white">{practitionerName}</strong> &bull; Includes 24 Months of w4 Managed Cloud Hosting (${hostingPlan.monthlyBaseRate}/mo rate post-2yr)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="copy-preview-link-btn"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Preview'}</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium underline underline-offset-2"
            >
              <span>Back to Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Website Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-xl"
              style={{ backgroundColor: siteConfig.primaryColor }}
            >
              {practitionerName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                {practitionerName}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {siteConfig.tagline} &bull; {city}, {state}
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{phone}</span>
              </a>
            ) : null}
            <button
              id="book-consultation-header-btn"
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2.5 rounded-lg text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:opacity-95 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: siteConfig.primaryColor }}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Board Certified &bull; Welcoming New Clients & Patients</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {siteConfig.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {siteConfig.heroSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-cta-btn"
                onClick={() => setBookingModalOpen(true)}
                className="px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                style={{ backgroundColor: siteConfig.primaryColor }}
              >
                <span>{siteConfig.callToAction}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="px-5 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 text-sm sm:text-base transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call {phone}</span>
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-lg">
              <div>
                <div className="text-2xl font-bold text-white">4.9/5.0</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Verified Reviews
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Digital Onboarding</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-slate-400">Online Intake</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur relative">
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Booking
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Request an Appointment</h2>
              <p className="text-xs text-slate-400 mb-6">
                Fill out the quick form below for prompt scheduling within 1 business day.
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      placeholder="(123) 456-7890"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Service Needed</label>
                  <select
                    value={bookingData.service}
                    onChange={(e) => setBookingData({ ...bookingData, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Service / Consultation Type</option>
                    {siteConfig.services.map((srv) => (
                      <option key={srv.id} value={srv.title}>
                        {srv.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white text-sm shadow transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: siteConfig.primaryColor }}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Appointment Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-900 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
              Comprehensive Care & Services
            </h2>
            <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
              Specialized Services Tailored to You
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Providing modern, compassionate, and evidence-based solutions for our local community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {siteConfig.services.map((srv) => (
              <div
                key={srv.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 hover:border-slate-600 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{srv.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">{srv.description}</p>
                </div>

                <button
                  onClick={() => {
                    setBookingData({ ...bookingData, service: srv.title });
                    setBookingModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pt-4 border-t border-slate-700/60"
                >
                  <span>Request Information</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Bio Section */}
      <section id="about" className="py-20 bg-slate-950 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 p-2 rounded-3xl border border-slate-800">
                <div className="bg-slate-900 rounded-2xl p-8 text-center space-y-4">
                  <div
                    className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-slate-800"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    {practitionerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{practitionerName}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{siteConfig.tagline}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 space-y-2 text-left text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{school}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Licensed & Verified in {state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Active Practice in {city}, {state}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                Meet the Practitioner
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                Dedicated to Excellence & Personalized Care
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {siteConfig.bioText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="font-semibold text-white text-sm mb-1">State of the Art Facilities</h4>
                  <p className="text-xs text-slate-400">Equipped with the latest technology for streamlined consultation and care.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="font-semibold text-white text-sm mb-1">Client-First Philosophy</h4>
                  <p className="text-xs text-slate-400">Clear communication, transparent scheduling, and dedicated attention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
              Client Feedback
            </h2>
            <h3 className="text-3xl font-extrabold text-white">What Our Community Says</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 relative">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="font-semibold text-sm text-white">{t.author}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location Footer */}
      <footer id="contact" className="bg-slate-950 border-t border-slate-800 py-16 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: siteConfig.primaryColor }}
              >
                {practitionerName.charAt(0)}
              </div>
              <div className="font-bold text-lg text-white">{practitionerName}</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Providing leading-edge practice solutions, seamless patient intake, and verified local care in {city}, {state}.
            </p>
            <div className="text-xs text-slate-500 pt-4">
              &copy; {new Date().getFullYear()} {practitionerName}. All rights reserved.
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-semibold text-white text-sm">Practice Hours</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Monday &ndash; Friday</span>
                <span className="text-slate-200">8:00 AM &ndash; 5:30 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span>Saturday</span>
                <span className="text-slate-200">9:00 AM &ndash; 1:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sunday</span>
                <span className="text-slate-500">Closed</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-semibold text-white text-sm">Direct Contact</h4>
            <div className="space-y-2 text-xs">
              {phone ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </div>
              ) : null}
              {email ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </div>
              ) : null}
              {!phone && !email ? (
                <div className="text-slate-400 text-xs italic">
                  Consultations and inquiries managed via online intake booking.
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Consultation Request Received!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Thank you! Our office manager will contact you at {bookingData.phone || 'your phone number'} within 1 business day to confirm your time.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Book a Consultation</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Select your requested date and service with {practitionerName}.
                </p>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        placeholder="(123) 456-7890"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Reason for Visit</label>
                    <textarea
                      rows={2}
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      placeholder="Briefly describe what you would like assistance with..."
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-semibold text-white text-sm shadow transition-all hover:opacity-90"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    Confirm Booking Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
