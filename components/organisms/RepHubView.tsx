import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Phone,
  Mail,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Globe,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  Send,
  MessageSquare,
  Copy,
  Check,
  User,
  MapPin,
  Building,
  GraduationCap,
  ExternalLink,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { Lead, PROFESSION_CONFIGS, W4_HOSTING_PLANS, OutreachStatus } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { INDUSTRY_PITCH_PROFILES, generateFallbackOutreach } from '../../services/outreach-generator';

interface RepHubViewProps {
  leads: Lead[];
  onOpenOutreach: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: OutreachStatus) => void;
}

export const RepHubView: React.FC<RepHubViewProps> = ({
  leads,
  onOpenOutreach,
  onPreviewWebsite,
  onUpdateStatus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [autoAdvanceOnStatus, setAutoAdvanceOnStatus] = useState(true);

  const carouselRef = useRef<HTMLDivElement>(null);

  const totalLeads = leads.length;
  const safeIndex = totalLeads > 0 ? Math.min(Math.max(currentIndex, 0), totalLeads - 1) : 0;
  const activeLead = totalLeads > 0 ? leads[safeIndex] : null;

  const activeProf = activeLead ? PROFESSION_CONFIGS[activeLead.profession] || PROFESSION_CONFIGS.real_estate : null;
  const activePlan = activeProf ? W4_HOSTING_PLANS[activeProf.hostingTier] || W4_HOSTING_PLANS.bronze : null;
  const activeIndustryProfile = activeLead ? INDUSTRY_PITCH_PROFILES[activeLead.profession] || INDUSTRY_PITCH_PROFILES.real_estate : null;

  const wonCount = leads.filter((l) => l.outreachStatus === 'Client Won').length;
  const inDiscussionCount = leads.filter((l) => l.outreachStatus === 'In Discussion').length;
  const totalCommissionsEarned = wonCount * 300;
  const pendingCommissions = inDiscussionCount * 300;

  const handleNextLead = () => {
    if (safeIndex < totalLeads - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePreviousLead = () => {
    if (safeIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && safeIndex < totalLeads - 1) {
      handleNextLead();
    } else if (isSwipeRight && safeIndex > 0) {
      handlePreviousLead();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleStatusSelect = (status: OutreachStatus) => {
    if (!activeLead) return;
    onUpdateStatus(activeLead.id, status);

    if (autoAdvanceOnStatus && safeIndex < totalLeads - 1) {
      setTimeout(() => {
        handleNextLead();
      }, 350);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const offerPrice = activeLead?.websiteConfig?.offerPrice || activeLead?.estimatedDealValue || 1650;
  const fallbackPitch = activeLead ? generateFallbackOutreach(activeLead, 'industry_board_pass', offerPrice) : null;

  const isRecent = activeLead ? isRecentlyLicensed(activeLead.issueDate, activeLead.graduationYear) : true;
  const source = activeLead ? formatSourceAttribution(activeLead) : null;

  const scriptOpening = activeLead && activeProf && activePlan && activeIndustryProfile && source
    ? isRecent
      ? `Hey ${activeLead.fullName.split(' ')[0] || activeLead.fullName}, this is [Rep Name]. I know I'm catching you out of the blue, but do you have 20 seconds for me to tell you why I called? If it doesn't make sense, you can tell me to hang up. I saw you recently got licensed in ${activeLead.city ? `${activeLead.city}, ${activeLead.state}` : activeLead.state}. Most new ${activeProf.label} practitioners we speak with either get quoted $3,000+ by agencies or lose 40+ hours fighting with DIY site builders when they just need ${activeIndustryProfile.clientType} booking appointments. Our team put together a ready-to-launch website concept tailored for your practice with direct online booking already configured. Can I text you the private preview link to check out on your phone?`
      : `Hey ${activeLead.fullName.split(' ')[0] || activeLead.fullName}, this is [Rep Name]. I know I'm catching you out of the blue, but do you have 20 seconds for me to tell you why I called? I was reviewing established ${activeProf.label} practices in ${activeLead.city || activeLead.state}. Most practitioners tell us their biggest headache is an outdated site that doesn't let ${activeIndustryProfile.clientType} book directly online. We put together a refreshed website concept for your practice with instant online scheduling already set up. Can I text you the private preview link to check out on your phone?`
    : '';

  const objectionNoBudget = `Completely get it, especially when starting out. That's actually why we do the zero-monthly-bill model ($1,650 flat for 2 full years of hosting and domain) so you don't have recurring software overhead while building your roster. I'll shoot the preview link over anyway so you have ideas for your brand down the road.`;
  const objectionSquarespace = `Totally understand! DIY builders work, but they usually charge $30-$50 every month forever and eat up 40+ hours configuring booking and forms. Our package gives you a fully custom, ready-to-launch portal with 2 full years of hosting included for one flat fee with zero setup labor on your end.`;
  const domainClause = `You get 100% full ownership and custody of your custom domain and practice content with zero vendor lock-in or surprise fees.`;

  const verifiedPhone = activeLead?.skipTraceData?.verifiedPhone;
  const hasPhone = Boolean(verifiedPhone && verifiedPhone !== 'Pending Discovery' && verifiedPhone !== 'Requires Skip-Trace');
  const rawPhone = verifiedPhone ? verifiedPhone.replace(/\D/g, '') : '';
  const callHref = hasPhone ? `tel:${rawPhone}` : undefined;

  const verifiedEmail = activeLead?.skipTraceData?.primaryEmail;
  const hasEmail = Boolean(verifiedEmail && verifiedEmail !== 'Pending Skip-Trace');
  const mailtoHref = hasEmail && fallbackPitch
    ? `mailto:${verifiedEmail}?subject=${encodeURIComponent(fallbackPitch.subject)}&body=${encodeURIComponent(fallbackPitch.emailBody)}`
    : undefined;

  const smsHref = hasPhone && fallbackPitch
    ? `sms:${rawPhone}?body=${encodeURIComponent(fallbackPitch.smsBody)}`
    : undefined;

  const statusOptions: { status: OutreachStatus; label: string; badgeClass: string; icon: string }[] = [
    { status: 'Uncontacted', label: 'Uncontacted', badgeClass: 'border-stone-300 text-stone-700 hover:bg-stone-100', icon: '⚪' },
    { status: 'Outreach Sent', label: 'Outreach Sent / Voicemail', badgeClass: 'border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100', icon: '📞' },
    { status: 'In Discussion', label: 'In Discussion (Hot)', badgeClass: 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100', icon: '🎯' },
    { status: 'Client Won', label: 'Deal Won (+$300)', badgeClass: 'border-emerald-500 text-emerald-900 bg-emerald-100 hover:bg-emerald-200 font-bold', icon: '🏆' },
    { status: 'Declined', label: 'Declined', badgeClass: 'border-rose-300 text-rose-800 hover:bg-rose-50', icon: '❌' },
  ];

  return (
    <div id="rep-hub-studio" className="space-y-5">
      {/* Top Rep Incentive & Stats Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 text-white rounded-3xl p-4 sm:p-6 shadow-lg border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              Rep Outbound Command Deck
            </span>
            <Badge variant="info" size="sm">
              $300 Cash Bounty / Closed Deal
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            High-Velocity Calling &amp; Pitch Studio
          </h2>

          <p className="text-amber-100 text-xs leading-relaxed">
            Swipe left or right through leads, call and email with one click, and log outcomes instantly at the top.
          </p>
        </div>

        {/* Rep Bounty Summary */}
        <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto pb-1">
          <div className="bg-black/30 backdrop-blur-xs rounded-2xl px-4 py-2.5 border border-white/10 text-center min-w-[100px]">
            <p className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">Won Deals</p>
            <p className="text-lg font-black text-white">{wonCount}</p>
            <span className="text-[10px] text-emerald-300 font-bold font-mono">
              +${totalCommissionsEarned.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs rounded-2xl px-4 py-2.5 border border-white/10 text-center min-w-[100px]">
            <p className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">In Discussion</p>
            <p className="text-lg font-black text-white">{inDiscussionCount}</p>
            <span className="text-[10px] text-amber-300 font-bold font-mono">
              ${pendingCommissions.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-xs rounded-2xl px-4 py-2.5 border border-white/10 text-center min-w-[100px]">
            <p className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">Lead Deck</p>
            <p className="text-lg font-black text-white">{totalLeads}</p>
            <span className="text-[10px] text-stone-300 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {totalLeads === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-stone-700">No leads in your calling deck.</p>
          <p className="text-xs text-stone-500">Query live registries from the Search tab to populate fresh graduates!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Horizontal Swipeable Card Selector Reel */}
          <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Swipe Deck ({safeIndex + 1} of {totalLeads})
                </span>
                <span className="text-[11px] text-stone-400 hidden sm:inline">
                  • Swipe left to advance or tap arrows
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvanceOnStatus}
                    onChange={(e) => setAutoAdvanceOnStatus(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                  />
                  <span>Auto-advance on status</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePreviousLead}
                    disabled={safeIndex === 0}
                    aria-label="Previous Lead"
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-stone-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextLead}
                    disabled={safeIndex === totalLeads - 1}
                    aria-label="Next Lead"
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-stone-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll / Reel of Leads */}
            <div
              ref={carouselRef}
              className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-200 pt-1"
            >
              {leads.map((lead, idx) => {
                const isSelected = idx === safeIndex;
                const leadPhone = lead.skipTraceData?.verifiedPhone;
                const hasLeadPhone = leadPhone && leadPhone !== 'Pending Discovery' && leadPhone !== 'Requires Skip-Trace';

                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`shrink-0 p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 min-w-[200px] sm:min-w-[220px] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 shadow-xs ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {lead.fullName.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate block">
                          {lead.fullName}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{lead.professionTitle}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className={`px-1 py-0.2 rounded font-semibold ${
                          lead.outreachStatus === 'Client Won'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.outreachStatus === 'In Discussion'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200/80 text-stone-600'
                        }`}>
                          {lead.outreachStatus}
                        </span>
                        <span className={hasLeadPhone ? 'text-emerald-700 font-semibold' : 'text-stone-400'}>
                          {hasLeadPhone ? '📞 Ready' : '🔍 Trace'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Lead Primary Workspace with Touch Gestures */}
          {activeLead && activeProf && activePlan && (
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
            >
              {/* TOP SECTION: Lead Identity & Quick Action Header */}
              <div className="p-4 sm:p-5 bg-stone-50/90 border-b border-stone-200 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-stone-900">{activeLead.fullName}</h3>
                      <Badge variant="info" size="sm">
                        {activeLead.professionTitle}
                      </Badge>
                      <Badge variant="success" size="sm">
                        {activePlan.name} (${offerPrice.toLocaleString()})
                      </Badge>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                        {activeLead.city}, {activeLead.state}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                        {activeLead.collegeOrSchool}
                      </span>
                      <span>•</span>
                      <span>Lic #{activeLead.licenseNumber}</span>
                      <span>•</span>
                      <span>Issued: {activeLead.issueDate}</span>
                    </div>
                  </div>

                  {/* Direct Contact Action Bar: CALL, EMAIL, SMS, PREVIEW */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {hasPhone ? (
                      <a
                        href={callHref}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        title={`Call ${verifiedPhone}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                        Call ({verifiedPhone})
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenOutreach(activeLead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-200 text-stone-600 cursor-not-allowed"
                      >
                        <Phone className="w-4 h-4" />
                        No Phone (Trace)
                      </button>
                    )}

                    {hasEmail ? (
                      <a
                        href={mailtoHref}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                        title={`Email ${verifiedEmail}`}
                      >
                        <Mail className="w-4 h-4" />
                        Email Now
                      </a>
                    ) : null}

                    {hasPhone ? (
                      <a
                        href={smsHref}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors"
                        title="Send SMS"
                      >
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        SMS
                      </a>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreviewWebsite(activeLead)}
                      icon={<Globe className="w-3.5 h-3.5 text-blue-600" />}
                    >
                      Mockup
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenOutreach(activeLead)}
                      icon={<Send className="w-3.5 h-3.5 text-teal-600" />}
                    >
                      Pitch Studio
                    </Button>
                  </div>
                </div>

                {/* HIGH-VISIBILITY STATUS CONTROLS - Positioned at TOP */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      Set Outreach Status (Current: {activeLead.outreachStatus})
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Tap outcome to log call & advance
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {statusOptions.map((opt) => {
                      const isCurrent = activeLead.outreachStatus === opt.status;
                      return (
                        <button
                          key={opt.status}
                          type="button"
                          onClick={() => handleStatusSelect(opt.status)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all text-center ${
                            isCurrent
                              ? 'ring-2 ring-teal-600 shadow-xs ' + opt.badgeClass
                              : opt.badgeClass
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Battlecard, 30-Second Script & Rebuttals */}
              <div className="p-4 sm:p-5 space-y-5">
                {/* 30-Second Hook */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      30-Second Cold Call Hook (Read Word-For-Word)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(scriptOpening, 'script')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedKey === 'script' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Script!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Script
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-stone-800 leading-relaxed font-sans shadow-2xs">
                    {scriptOpening}
                  </div>
                </div>

                {/* Industry Intelligence & 2-Year Package Economics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left: Industry Profile */}
                  {activeIndustryProfile && (
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                        Industry Context: {activeIndustryProfile.industryLabel}
                      </span>
                      <div>
                        <span className="text-stone-500 text-[10px] font-semibold uppercase">Target Clients:</span>
                        <p className="text-stone-800 font-medium">{activeIndustryProfile.clientType}</p>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] font-semibold uppercase">Key Software Feature:</span>
                        <p className="text-teal-900 font-semibold">{activeIndustryProfile.keySoftwareFeature}</p>
                      </div>
                    </div>
                  )}

                  {/* Right: 2-Year Package Economics */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      2-Year Package Economics (w4 {activePlan.name})
                    </span>
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Package Price:</span>
                      <span className="font-bold text-stone-900 font-mono">${offerPrice.toLocaleString()} Flat</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Hosting Included:</span>
                      <span className="font-semibold text-emerald-800">24 Months ($0/mo bills)</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Your Cash Commission:</span>
                      <span className="font-black text-emerald-700 font-mono">+$300.00 Bounty</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Post-Promo Rate:</span>
                      <span className="font-medium text-stone-600">${activePlan.monthlyBaseRate}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Objection Rebuttal Battlecards */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Instant Objection Rebuttals
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="font-bold text-stone-900 block">
                        💬 &quot;No startup budget right now&quot;
                      </span>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{objectionNoBudget}</p>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="font-bold text-stone-900 block">
                        💬 &quot;Building on Squarespace / Wix&quot;
                      </span>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{objectionSquarespace}</p>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                      <span className="font-bold text-stone-900 block">
                        💬 &quot;Who owns the domain?&quot;
                      </span>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{domainClause}</p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM SWIPE NAVIGATION FOOTER */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousLead}
                    disabled={safeIndex === 0}
                    icon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Previous Lead
                  </Button>

                  <span className="text-xs text-stone-500 font-medium">
                    Lead {safeIndex + 1} of {totalLeads} • Swipe card left on touch devices
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextLead}
                    disabled={safeIndex === totalLeads - 1}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Next Lead (Swipe Left)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

