import {
  type Lead,
  PROFESSION_CONFIGS,
  W4_HOSTING_PLANS,
  MARKET_PRICE_COMPARISONS,
  TURNKEY_SCOPE_GUARANTEE,
  type ProfessionCategory,
  type MarketPriceComparison,
} from '../types/lead';
import { getPreviewLink } from './website-templates';

export interface OutreachTemplateOption {
  id: string;
  name: string;
  tone: string;
  iconName: string;
  badge: string;
  description: string;
}

export const OUTREACH_TEMPLATES: OutreachTemplateOption[] = [
  {
    id: 'industry_board_pass',
    name: 'State Board Pass & Congratulatory (Recommended)',
    tone: 'Warm, Celebratory & Authoritative',
    iconName: 'Award',
    badge: 'High Conversion',
    description: 'Congratulates graduate on official board pass and introduces their turnkey practice portal with 2-year w4 hosting on worldwidewebwork.com.',
  },
  {
    id: 'infrastructure_compass_upgrade',
    name: 'W4 Cloud & Compass Suite Infrastructure Upgrade (For Existing Sites)',
    tone: 'B2B Infrastructure & Cost Consolidation',
    iconName: 'Layers',
    badge: 'Existing Site Pivot',
    description: 'Upgrades an existing practice website backend to sovereign w4 cloud hosting with the integrated Compass Suite (Questbook CRM, Pegasus Speed, Silver Arrow SEO).',
  },
  {
    id: 'industry_client_magnet',
    name: 'Industry Client Acquisition Magnet',
    tone: 'Results-Driven & Growth Focused',
    iconName: 'Magnet',
    badge: 'High Response',
    description: 'Highlights how the Compass Suite captures high-value private clients, patients, or retainers from Day 1.',
  },
  {
    id: 'industry_domain_protection',
    name: 'Practice Domain & Brand Protection',
    tone: 'Urgent & Strategic',
    iconName: 'ShieldAlert',
    badge: 'Urgency Angle',
    description: 'Secures their official professional practice domain before competitors or generic aggregator directories claim it.',
  },
  {
    id: 'industry_executive_consulting',
    name: 'My Compass Consulting Executive Proposal',
    tone: 'Polished B2B Consulting',
    iconName: 'Briefcase',
    badge: 'Executive Angle',
    description: 'Formal advisory pitch framing the live web portal and 24-month hosting package as a turnkey capital asset.',
  },
];

export interface IndustryPitchProfile {
  profession: ProfessionCategory;
  industryLabel: string;
  clientType: string;
  primaryPainPoint: string;
  keySoftwareFeature: string;
  targetConversionGoal: string;
  sampleSubjectLine: string;
  industryCallOpening: string;
}

export const INDUSTRY_PITCH_PROFILES: Record<ProfessionCategory, IndustryPitchProfile> = {
  real_estate: {
    profession: 'real_estate',
    industryLabel: 'Real Estate & Property',
    clientType: 'home buyers, sellers, and property investors',
    primaryPainPoint: 'Competing against entrenched agents with large marketing budgets and losing client commissions to portal aggregators like Zillow',
    keySoftwareFeature: 'Compass Interactive Property Valuation Engine & Direct Lead Capture',
    targetConversionGoal: 'exclusive buyer and seller representation agreements',
    sampleSubjectLine: 'Quick website concept for your new real estate brand in [State], [First Name]',
    industryCallOpening: 'Most new agents get stuck with a generic corporate subpage from their brokerage instead of building their own direct client pipeline.',
  },
  nursing: {
    profession: 'nursing',
    industryLabel: 'Concierge Healthcare & Nursing',
    clientType: 'private duty patients, wellness clients, and telehealth inquiries',
    primaryPainPoint: 'Transitioning from hospital shift burnout into high-margin private duty nursing, IV hydration, and independent care consulting',
    keySoftwareFeature: 'Compass Confidential Health Intake & HIPAA-Ready Consultation Booking',
    targetConversionGoal: 'recurring private pay care packages and concierge wellness clients',
    sampleSubjectLine: 'Private duty practice site preview for Nurse [First Name]',
    industryCallOpening: 'More licensed RNs are launching independent concierge practices to earn $150+/hr without hospital bureaucracy.',
  },
  dental: {
    profession: 'dental',
    industryLabel: 'Dental & Oral Health Practices',
    clientType: 'new dental patients, family checkups, and cosmetic procedures',
    primaryPainPoint: 'High patient acquisition costs on Google Ads and lost bookings due to clunky, outdated dental clinic websites',
    keySoftwareFeature: 'Compass Online Dental Booking & Automated Intake Forms',
    targetConversionGoal: 'new patient exams and high-margin cosmetic consultations',
    sampleSubjectLine: 'Dr. [Last Name] - Practice website concept & 2-year hosting package',
    industryCallOpening: 'New patients looking for a dentist judge clinical authority based heavily on how clean, modern, and mobile-friendly the clinic website is.',
  },
  chiropractic: {
    profession: 'chiropractic',
    industryLabel: 'Chiropractic & Wellness Centers',
    clientType: 'patients suffering from acute back/neck pain and wellness seekers',
    primaryPainPoint: 'Competing against entrenched local clinics and failing to convert walk-ins without clear wellness package pricing and online scheduling',
    keySoftwareFeature: 'Compass Treatment Plan Presenter & Online Appointment Engine',
    targetConversionGoal: 'initial chiropractic adjustments and recurring wellness packages',
    sampleSubjectLine: 'Dr. [Last Name] - Practice website concept (Direct booking ready)',
    industryCallOpening: 'When someone is in acute pain, they book with the first clinic with instant online scheduling and glowing clinical credentials.',
  },
  therapy: {
    profession: 'therapy',
    industryLabel: 'Mental Health & Counseling',
    clientType: 'private pay counseling clients and couples seeking therapy',
    primaryPainPoint: 'Building a private pay client roster without relying on low-reimbursement insurance panels or crowded directory listings',
    keySoftwareFeature: 'Compass Confidential Intake Portal & Secure Telehealth Scheduler',
    targetConversionGoal: 'confidential discovery sessions and weekly therapy slots',
    sampleSubjectLine: 'Private counseling website concept for [First Name]',
    industryCallOpening: 'Private pay counseling clients look for warm, trustworthy therapists with a discrete digital intake experience.',
  },
  beauty: {
    profession: 'beauty',
    industryLabel: 'Esthetics & Medical Aesthetics',
    clientType: 'skincare clients, bridal parties, and treatment members',
    primaryPainPoint: 'Losing booking deposits from Instagram DMs and struggling to charge premium rates without a luxury digital storefront',
    keySoftwareFeature: 'Compass Treatment Menu & Automated Service Deposit Booking',
    targetConversionGoal: 'high-ticket facial packages and recurring monthly skincare memberships',
    sampleSubjectLine: 'Studio booking website concept for [First Name] ✨',
    industryCallOpening: 'Having your own branded studio website immediately elevates you from a standard booth renter to a luxury skincare authority.',
  },
  veterinary: {
    profession: 'veterinary',
    industryLabel: 'Veterinary Medicine',
    clientType: 'pet owners seeking trusted wellness exams and surgical care',
    primaryPainPoint: 'Pet parents demanding 24/7 digital booking while corporate veterinary conglomerates dominate local search results',
    keySoftwareFeature: 'Compass Pet Patient Registration & In-Clinic/Mobile Booking Engine',
    targetConversionGoal: 'puppy/kitten wellness plans and recurring preventive care visits',
    sampleSubjectLine: 'Dr. [Last Name] - Veterinary practice web portal ready (w4 Silver Tier)',
    industryCallOpening: 'Pet owners treat their animals like family, meaning your digital clinic presence must project instant compassion and clinical expertise.',
  },
  legal: {
    profession: 'legal',
    industryLabel: 'Legal Counsel & Advocacy',
    clientType: 'individuals and business owners seeking high-stakes legal counsel',
    primaryPainPoint: 'Attracting lucrative retainer clients while avoiding low-budget inquiries and establishing immediate courtroom authority',
    keySoftwareFeature: 'Compass Case Evaluation Intake & Encrypted Discovery Scheduler',
    targetConversionGoal: 'qualified consultation calls and signed client retainer agreements',
    sampleSubjectLine: 'Counselor [First Name] - Practice website concept & consultation intake',
    industryCallOpening: 'In law, client perception is everything. A high-speed, secure practice site positions you as a premier legal advocate from Day 1.',
  },
  financial_advisor: {
    profession: 'financial_advisor',
    industryLabel: 'Wealth Management & Financial Planning',
    clientType: 'high-net-worth families, retirees, and business owners',
    primaryPainPoint: 'Earning immediate fiduciary trust with high-net-worth clients who evaluate digital sophistication before transferring assets',
    keySoftwareFeature: 'Compass Discovery Meeting Scheduler & Interactive Retirement Roadmap',
    targetConversionGoal: 'discovery consultations and assets under management (AUM) onboarding',
    sampleSubjectLine: 'Fiduciary practice website preview for [First Name]',
    industryCallOpening: 'Wealth planning clients demand flawless fiduciary credibility before trusting an advisor with their life savings.',
  },
  finance: {
    profession: 'finance',
    industryLabel: 'Accounting & Tax Advisory',
    clientType: 'business owners and high-income tax filers seeking year-round strategy',
    primaryPainPoint: 'Escaping transactional 1040 tax prep to build predictable, recurring monthly accounting advisory retainers',
    keySoftwareFeature: 'Compass Secure Client Document Vault & Strategy Call Booking',
    targetConversionGoal: 'monthly accounting retainers and high-margin tax planning packages',
    sampleSubjectLine: 'Accounting practice website preview for [First Name]',
    industryCallOpening: 'Modern business owners want proactive year-round financial advisors, not just tax-time filing clerks.',
  },
  insurance: {
    profession: 'insurance',
    industryLabel: 'Insurance & Risk Advisory',
    clientType: 'families and business owners looking for policy coverage',
    primaryPainPoint: 'Competing with captive agency call centers and needing to stand out as an independent trusted fiduciary broker',
    keySoftwareFeature: 'Compass Multi-Line Quote Request Form & Policy Review Scheduler',
    targetConversionGoal: 'policy discovery calls and multi-line insurance applications',
    sampleSubjectLine: 'Independent agency website concept for [First Name]',
    industryCallOpening: 'Clients buy insurance from individuals they trust to protect their life and assets when things go wrong.',
  },
  trade: {
    profession: 'trade',
    industryLabel: 'Master Trade Contracting (Electrical/HVAC/Plumbing)',
    clientType: 'homeowners and general contractors needing licensed tradesmen',
    primaryPainPoint: 'Relying on expensive lead-buying aggregators like Angi that resell the same lead to 5 contractors',
    keySoftwareFeature: 'Compass 24/7 Emergency Dispatch Request & Estimate Booking Widget',
    targetConversionGoal: 'direct service calls, panel upgrades, and high-ticket remodel jobs',
    sampleSubjectLine: 'Direct contractor website concept for [First Name]',
    industryCallOpening: 'Why pay Angi or Yelp $80 per lead when your own branded practice site can generate direct homeowner calls with zero competition?',
  },
  architecture: {
    profession: 'architecture',
    industryLabel: 'Architecture & Spatial Design',
    clientType: 'custom home clients, commercial developers, and property renovators',
    primaryPainPoint: 'Showcasing intricate design portfolios with lightning-fast load times and landing high-budget architectural commissions',
    keySoftwareFeature: 'Compass High-Res Spatial Portfolio Showcase & Blueprint Consultation Intake',
    targetConversionGoal: 'design consultation agreements and custom residential commissions',
    sampleSubjectLine: 'Architectural portfolio website concept for [First Name]',
    industryCallOpening: 'High-end design clients expect an architectural portfolio site that reflects the same spatial elegance as your physical designs.',
  },
};

export interface ColdCallScriptData {
  openingHook: string;
  valuePitch: string;
  twoYearOffer: string;
  domainEquityClause: string;
  bestDealBlurb: string;
  scopeGuarantee: {
    title: string;
    tagline: string;
    blurb: string;
  };
  marketComparison: MarketPriceComparison;
  objections: {
    objection: string;
    rebuttal: string;
  }[];
  callerBountyNote: string;
}

export function isRecentlyLicensed(issueDateStr?: string, gradYear?: number): boolean {
  if (!issueDateStr && !gradYear) return true;

  const now = new Date();
  if (issueDateStr) {
    const parsed = new Date(issueDateStr);
    if (!isNaN(parsed.getTime())) {
      const diffMonths = (now.getFullYear() - parsed.getFullYear()) * 12 + (now.getMonth() - parsed.getMonth());
      return diffMonths <= 12;
    }
  }

  if (gradYear && gradYear > 1900) {
    return (now.getFullYear() - gradYear) <= 1;
  }

  return true;
}

export function formatSourceAttribution(lead: Lead): {
  isFederalOrStateRegistry: boolean;
  sourceName: string;
  sourceDescriptor: string;
} {
  const rawSchool = (lead.collegeOrSchool || '').trim();
  const lower = rawSchool.toLowerCase();

  const isCms = lower.includes('cms') || lower.includes('federal health') || lower.includes('nppes');
  const isRegistry = isCms || lower.includes('registry') || lower.includes('licensing board') || lower.includes('board of') || lower.includes('department of health');

  if (isCms) {
    return {
      isFederalOrStateRegistry: true,
      sourceName: `the official ${lead.state} healthcare provider registry`,
      sourceDescriptor: `${lead.state} Healthcare Provider Registry`,
    };
  }

  if (isRegistry) {
    return {
      isFederalOrStateRegistry: true,
      sourceName: rawSchool || `the ${lead.state} professional licensing registry`,
      sourceDescriptor: rawSchool || `${lead.state} Professional Licensing Registry`,
    };
  }

  return {
    isFederalOrStateRegistry: false,
    sourceName: rawSchool || `${lead.state} Professional Board`,
    sourceDescriptor: rawSchool || `${lead.state} Professional Board`,
  };
}

export function generateColdCallScript(lead: Lead, offerPrice: number): ColdCallScriptData {
  const firstName = lead.fullName.split(' ')[0] || lead.fullName;
  const lastName = lead.fullName.split(' ').slice(1).join(' ') || lead.fullName;
  const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
  const industryProfile = INDUSTRY_PITCH_PROFILES[lead.profession] || INDUSTRY_PITCH_PROFILES.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;
  const siteUrl = getPreviewLink(lead.websiteConfig?.previewSlug || lead.id);

  const comparisonKey =
    ['quantum', 'bronze'].includes(profMeta.hostingTier)
      ? 'solo_starter'
      : ['silver', 'silver_enhanced'].includes(profMeta.hostingTier)
      ? 'professional'
      : 'enterprise_legal_cpa';

  const marketComparison = MARKET_PRICE_COMPARISONS[comparisonKey] || MARKET_PRICE_COMPARISONS.solo_starter;

  const salutation = ['dental', 'chiropractic', 'veterinary'].includes(lead.profession)
    ? `Dr. ${lastName}`
    : firstName;

  const isRecent = isRecentlyLicensed(lead.issueDate, lead.graduationYear);
  const location = lead.city ? `${lead.city}, ${lead.state}` : lead.state;

  const openingHook = `"Hey ${salutation}, this is [Your Name] with My Compass Consulting and worldwidewebwork.com. I know I'm catching you out of the blue, but do you have 20 seconds for me to tell you why I called? If it doesn't make sense, you can tell me to hang up."`;

  const valuePitch = isRecent
    ? `"I saw you recently got licensed in ${location}. Most new ${profMeta.label} practitioners we speak with either get quoted $3,000+ by agencies or lose 40+ hours fighting with DIY tools when they just need ${industryProfile.clientType} booking appointments. We engineered a sovereign practice portal on the WorldwideWebwork cloud with the My Compass Suite (Questbook CRM, online booking, and high-speed hosting) ready to deploy today."`
    : `"I was reviewing established ${profMeta.label} practices in ${lead.city || lead.state}. Most practitioners tell us their biggest headache is juggling 5+ disconnected subscriptions: CRM, slow hosting, SEO plugins, and booking tools that cost $300+/month. We migrate your backend onto the WorldwideWebwork high-speed cloud and install the full My Compass Software Suite so you can run your entire practice from one sovereign dashboard."`;

  const twoYearOffer = `"If you like what you see and want us to activate it, it is a single flat rate of $${offerPrice.toLocaleString()} for the entire 2-year package. That covers your custom .com domain, full setup, and 2 full years of high-speed w4 cloud infrastructure on worldwidewebwork.com with zero monthly bills or maintenance headaches. The Compass Software Suite itself is 100% free forever. Can I text you the preview link so you can take a look on your phone right now?"`;

  const domainEquityClause = `"You get 100% sovereign ownership and custody of your custom domain and practice content with zero vendor lock-in on the WorldwideWebwork network."`;

  return {
    openingHook,
    valuePitch,
    twoYearOffer,
    domainEquityClause,
    bestDealBlurb: TURNKEY_SCOPE_GUARANTEE.whyOurDealIsBest,
    scopeGuarantee: {
      title: TURNKEY_SCOPE_GUARANTEE.title,
      tagline: TURNKEY_SCOPE_GUARANTEE.tagline,
      blurb: TURNKEY_SCOPE_GUARANTEE.blurb,
    },
    marketComparison,
    objections: [
      {
        objection: `"I already have a website / webmaster / agency."`,
        rebuttal: `"That is great, we don't touch your front-end branding or fire your webmaster! We upgrade your backend onto the high-speed WorldwideWebwork sovereign cloud (worldwidewebwork.com) and install the My Compass Software Suite. It replaces separate CRM, SEO, and backup subscriptions into one unified $99/mo setup with zero maintenance headaches."`,
      },
      {
        objection: `"Is this another web design agency?"`,
        rebuttal: `"Not at all. We are the sovereign cloud infrastructure and software provider behind worldwidewebwork.com. We provide licensed practices with an all-in-one digital back-office including Questbook CRM, Pegasus Boots speed caching, and automated client booking."`,
      },
      {
        objection: `"How much is this? / What's the catch?"`,
        rebuttal: `"No catch at all. The Compass Software Suite is 100% free forever. You only pay for our managed w4 cloud hosting and zero-headache infrastructure at a flat $99/month (or our promotional 2-year package for $${offerPrice.toLocaleString()}). No hidden plugin fees or hosting surprise bills."`,
      },
      {
        objection: `"Why shouldn't I just stay on GoDaddy, Bluehost, or Squarespace?"`,
        rebuttal: `"Traditional hosts get bloated by 10+ slow plugins and charge extra for SSL, backups, and security. On the WorldwideWebwork network, your site gets dedicated high-speed cloud caching, automated daily backups, and the integrated Questbook CRM in one sovereign dashboard."`,
      },
      {
        objection: `"I already work with an existing clinic, hospital, or brokerage."`,
        rebuttal: `"That makes total sense. A lot of top producers still keep their own personal sovereign portal and Questbook CRM so their direct client reviews, referrals, and branding stay with them directly rather than the parent company."`,
      },
      {
        objection: `"Can I see what it looks like before making a decision?"`,
        rebuttal: `"Yes, absolutely! That's why I called. I can text or email your private preview link right now (${siteUrl}) while we're on the phone so you can inspect the back-office tools and speed benchmarks. What is your best mobile number?"`,
      },
    ],
    callerBountyNote: `Rep Commission: Earn $300.00 cash on this closed deal! (Pipeline deal value: $${offerPrice.toLocaleString()})`,
  };
}

export function generateFallbackOutreach(
  lead: Lead,
  templateId: string = 'industry_board_pass',
  offerPrice: number = 1650
) {
  const firstName = lead.fullName.split(' ')[0] || lead.fullName;
  const lastName = lead.fullName.split(' ').slice(1).join(' ') || lead.fullName;
  const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
  const industryProfile = INDUSTRY_PITCH_PROFILES[lead.profession] || INDUSTRY_PITCH_PROFILES.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;
  const siteUrl = getPreviewLink(lead.websiteConfig?.previewSlug || lead.id);

  const salutation = ['dental', 'chiropractic', 'veterinary'].includes(lead.profession)
    ? `Dr. ${lastName}`
    : firstName;

  const isRecent = isRecentlyLicensed(lead.issueDate, lead.graduationYear);
  const source = formatSourceAttribution(lead);

  if (templateId === 'infrastructure_compass_upgrade') {
    return {
      subject: `Infrastructure & Software Upgrade for your ${lead.professionTitle} practice in ${lead.city}`,
      emailBody: `Hi ${salutation},

I was reviewing licensed ${lead.professionTitle} practices in ${lead.city} and noticed your digital presence.

Most established practitioners we speak with are paying $300 to $600/month across 5+ disconnected systems (CRM, slow shared hosting, SEO plugins, backup services, and scheduling tools) that constantly require maintenance and updates.

Through our WorldwideWebwork sovereign cloud network (worldwidewebwork.com), we provide a complete backend infrastructure upgrade powered by the My Compass Software Suite:

Inspect your live practice preview: ${siteUrl}

Compass Suite Infrastructure Highlights:
• WorldwideWebwork Sovereign Cloud Hosting: 3x faster page loads with enterprise SSL & daily backups
• Questbook CRM: Direct client intake, consultation booking, and record management
• Pegasus Boots Performance: High-speed asset delivery and mobile optimization
• Silver Arrow SEO: Built-in local search visibility for Google Maps rankings
• Consolidated Operations: Replaces bloated third-party plugins with zero monthly maintenance headaches

The Compass Software Suite itself is 100% free forever. Our promotional 2-year managed infrastructure package is available for a flat rate of $${offerPrice.toLocaleString()} (covering 24 full months of w4 cloud hosting with $0 monthly bills).

After 24 months, hosting easily continues at our transparent base rate of $${hostingPlan.monthlyBaseRate}/mo with no lock-in contracts.

Would you like us to activate your Compass Suite infrastructure this week?

Warm regards,
Digital Infrastructure Advisor
My Compass Consulting
worldwidewebwork.com`,
      smsBody: `Hi ${firstName}, My Compass Consulting can upgrade your ${lead.professionTitle} practice backend to the high-speed w4 cloud & Compass Suite: ${siteUrl}`,
    };
  }

  if (templateId === 'industry_board_pass' || templateId === 'congratulations') {
    if (isRecent) {
      return {
        subject: `Congratulations on your ${lead.professionTitle} license, ${firstName}!`,
        emailBody: `Hi ${salutation},

I was reviewing recent professional licensing updates for ${lead.state} and noticed your newly issued ${lead.professionTitle} license on ${source.sourceName}! Huge congratulations on reaching this career milestone.

As you begin taking on ${industryProfile.clientType} in ${lead.city}, having a verified, authoritative web presence is essential from Day 1.

My Compass Consulting took the liberty of creating a personalized website mockup tailored specifically for your practice, powered by the Compass Software Suite and WorldwideWebwork (worldwidewebwork.com):

Take a look at your website preview: ${siteUrl}

Everything is already structured for your practice, from service breakdowns to ${industryProfile.keySoftwareFeature}.

Our promotional 2-year launch package is provided for a flat rate of $${offerPrice.toLocaleString()}. This includes full design customization, your custom domain name, and your first 2 YEARS of high-speed w4 cloud hosting and SSL included with zero monthly fees.

Key 2-Year Package Benefits:
• 24 Full Months of high-speed w4 cloud hosting & SSL encryption included (0 monthly bills for 2 full years)
• Custom practice domain (.com) registration & DNS management
• Turnkey Compass Software Suite with Questbook CRM client intake & appointment booking
• After 24 months, hosting easily continues at our base rate of just $${hostingPlan.monthlyBaseRate}/mo with no lock-in contracts
• $999 domain lease-to-own buyout option if you ever want full registrar custody

Let me know what you think of the preview!

Warm regards,
Practice Launch Specialist
My Compass Consulting
worldwidewebwork.com`,
        smsBody: `Congrats ${firstName} on getting licensed as a ${lead.professionTitle}! My Compass Consulting built a practice preview with 2 yrs w4 hosting included: ${siteUrl}`,
      };
    } else {
      return {
        subject: `Digital infrastructure update for your ${lead.professionTitle} practice in ${lead.city}`,
        emailBody: `Hi ${salutation},

I was reviewing licensed ${lead.professionTitle} practitioners in ${lead.city} on ${source.sourceName} and noticed your active professional credential.

As you continue growing your ${industryProfile.clientType} client base in ${lead.city}, maintaining a modern, high-performance web presence with direct scheduling and verified credentials is key to staying competitive.

My Compass Consulting took the liberty of engineering a custom website portal tailored specifically for your practice, powered by the Compass Software Suite and WorldwideWebwork (worldwidewebwork.com):

Take a look at your practice preview: ${siteUrl}

Everything is already structured for your practice, from service breakdowns to ${industryProfile.keySoftwareFeature}.

Our promotional 2-year package is provided for a flat rate of $${offerPrice.toLocaleString()}. This includes full design customization, your custom domain name, and your next 2 YEARS of high-speed w4 cloud hosting and SSL included with zero monthly fees.

Key 2-Year Package Benefits:
• 24 Full Months of high-speed w4 cloud hosting & SSL encryption included (0 monthly bills for 2 full years)
• Custom practice domain (.com) registration & DNS management
• Turnkey Compass Software Suite with Questbook CRM client intake & appointment booking
• After 24 months, hosting easily continues at our base rate of just $${hostingPlan.monthlyBaseRate}/mo with no lock-in contracts
• $999 domain lease-to-own buyout option if you ever want full registrar custody

Let me know what you think of the preview!

Warm regards,
Practice Growth Specialist
My Compass Consulting
worldwidewebwork.com`,
        smsBody: `Hi ${firstName}, My Compass Consulting engineered a practice portal preview for your ${lead.professionTitle} practice in ${lead.city} with 2 yrs w4 hosting: ${siteUrl}`,
      };
    }
  }

  if (templateId === 'industry_client_magnet') {
    return {
      subject: `Client acquisition portal for your ${lead.professionTitle} practice in ${lead.city}`,
      emailBody: `Hi ${salutation},

${isRecent ? `Now that your ${lead.professionTitle} license in ${lead.state} is active` : `For your established ${lead.professionTitle} practice in ${lead.city}`}, your biggest growth lever is capturing ${industryProfile.clientType} searching for trusted local practitioners.

${industryProfile.primaryPainPoint}.

To give you an immediate competitive advantage, My Compass Consulting has engineered a turnkey practice portal powered by our Compass Software Suite on the WorldwideWebwork network:

View your live practice preview: ${siteUrl}

Engineered to Convert:
• ${industryProfile.keySoftwareFeature}
• Verified state credential badge (${source.sourceDescriptor})
• Mobile-optimized booking flow designed for ${industryProfile.targetConversionGoal}
• 2 FULL YEARS of enterprise w4 cloud hosting & SSL included ($0 monthly overhead for 24 months)
• Custom .com domain registration included

Promotional Launch Rate: $${offerPrice.toLocaleString()} flat for the entire 2-year package.
After 24 months, your hosting continues at our base w4 rate of $${hostingPlan.monthlyBaseRate}/mo, with an unencumbered $999 domain lease-to-own equity transfer option.

Would you like us to connect your official domain and activate this for your practice this week?

Best regards,
Practice Growth Consultant
My Compass Consulting
worldwidewebwork.com`,
      smsBody: `Hi ${firstName}! Ready to book ${industryProfile.clientType}? My Compass Consulting built a turnkey portal for your practice with 2 yrs w4 hosting: ${siteUrl}`,
    };
  }

  if (templateId === 'industry_domain_protection' || templateId === 'launch_urgency') {
    return {
      subject: `[Action Required] Practice domain secured for ${lead.fullName} (${lead.professionTitle})`,
      emailBody: `Hi ${salutation},

${isRecent ? `First off, congratulations on receiving your official ${lead.professionTitle} license in ${lead.state}!` : `As an active ${lead.professionTitle} practitioner in ${lead.city}, securing your personal professional domain is essential to protect your reputation and brand.`}

When state licensing boards publish practitioner rosters, third-party lead aggregators and competitors frequently buy up practitioner domain names to resell at inflated prices.

To protect your professional brand, My Compass Consulting has reserved your custom practice domain and pre-built your live practice web portal on the WorldwideWebwork network:

Inspect your reserved practice preview: ${siteUrl}

Your 2-Year Turnkey Package Includes:
• Dedicated practice web portal configured for ${industryProfile.industryLabel}
• Integrated Compass Software Suite (${industryProfile.keySoftwareFeature})
• Official practice .com domain registration
• 2 Full Years of dedicated w4 cloud hosting & SSL security (Zero monthly bills for 24 months)
• Transparent post-promotional rate of $${hostingPlan.monthlyBaseRate}/mo with no lock-in
• Guaranteed $999 lease-to-own domain buyout clause for full registrar transfer

Promotional Rate: Flat $${offerPrice.toLocaleString()} covering all design, setup, and 24 months of w4 hosting.

Would you like us to release this domain to you and launch your practice site?

Sincerely,
Digital Brand Specialist
My Compass Consulting
worldwidewebwork.com`,
      smsBody: `Hi ${firstName}, we reserved your official practice domain and built a preview with 2 yrs w4 hosting included: ${siteUrl} - Tap to review!`,
    };
  }

  return {
    subject: `Executive practice consulting proposal: ${lead.fullName} (${lead.professionTitle})`,
    emailBody: `Dear ${salutation},

${isRecent ? `Congratulations on your newly issued ${lead.professionTitle} license in ${lead.state}.` : `Regarding your active ${lead.professionTitle} practice in ${lead.city}, ${lead.state}.`}

As you establish your practice footprint in ${lead.city}, your digital touchpoint is the primary asset prospective ${industryProfile.clientType} evaluate when making engagement decisions.

My Compass Consulting is pleased to present a turnkey practice digital infrastructure proposal powered by the Compass Software Suite and WorldwideWebwork (worldwidewebwork.com):

Review your live practice preview: ${siteUrl}

Executive Specifications:
• Bespoke practice portfolio & specialty clinical service presentation
• Compass Suite client booking & confidential intake engine (${industryProfile.keySoftwareFeature})
• 2 Years of dedicated w4 high-speed cloud infrastructure & enterprise SSL encryption
• Custom .com domain registration & DNS management included
• Turnkey deployment ready within 24 hours of confirmation

Capital Investment: Flat $${offerPrice.toLocaleString()} covering complete design, configuration, and 24 full months of w4 cloud hosting with zero ongoing monthly fees.
After 24 months, infrastructure service continues at the standard w4 rate of $${hostingPlan.monthlyBaseRate}/mo, with a $999 lease-to-own domain equity transfer guarantee.

We would be delighted to finalize your live practice launch at your convenience.

Sincerely,
Client Solutions Director
My Compass Consulting
worldwidewebwork.com`,
    smsBody: `Hello ${firstName}, here is your custom practice site preview with 2 years w4 hosting from My Compass Consulting: ${siteUrl}`,
  };
}
