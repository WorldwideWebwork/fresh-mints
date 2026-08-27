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
    description: 'Congratulates graduate on official board pass and introduces their turnkey practice portal with 2-year w4 hosting.',
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
    sampleSubjectLine: 'Congrats on your new Real Estate license in [State], [First Name]! (Your live property portal is ready)',
    industryCallOpening: 'As a new agent, getting your personal brand independent from your brokerage is what lets you build long-term repeat client equity.',
  },
  nursing: {
    profession: 'nursing',
    industryLabel: 'Concierge Healthcare & Nursing',
    clientType: 'private duty patients, wellness clients, and telehealth inquiries',
    primaryPainPoint: 'Transitioning from hospital shift burnout into high-margin private duty nursing, IV hydration, and independent care consulting',
    keySoftwareFeature: 'Compass Confidential Health Intake & HIPAA-Ready Consultation Booking',
    targetConversionGoal: 'recurring private pay care packages and concierge wellness clients',
    sampleSubjectLine: 'Congratulations on your Nursing board pass, Nurse [First Name]! (Turnkey concierge care site)',
    industryCallOpening: 'More licensed RNs are launching independent concierge practices to earn $150+/hr without hospital bureaucracy.',
  },
  dental: {
    profession: 'dental',
    industryLabel: 'Dental & Oral Health Practices',
    clientType: 'new dental patients, family checkups, and cosmetic procedures',
    primaryPainPoint: 'High patient acquisition costs on Google Ads and lost bookings due to clunky, outdated dental clinic websites',
    keySoftwareFeature: 'Compass Online Dental Booking & Automated Intake Forms',
    targetConversionGoal: 'new patient exams and high-margin cosmetic consultations',
    sampleSubjectLine: 'Dr. [Last Name] - Practice domain secured & 2-yr hosting package ready',
    industryCallOpening: 'New patients looking for a dentist judge clinical authority based heavily on how clean, modern, and mobile-friendly the clinic website is.',
  },
  chiropractic: {
    profession: 'chiropractic',
    industryLabel: 'Chiropractic & Wellness Centers',
    clientType: 'patients suffering from acute back/neck pain and wellness seekers',
    primaryPainPoint: 'Competing against entrenched local clinics and failing to convert walk-ins without clear wellness package pricing and online scheduling',
    keySoftwareFeature: 'Compass Treatment Plan Presenter & Online Appointment Engine',
    targetConversionGoal: 'initial chiropractic adjustments and recurring wellness packages',
    sampleSubjectLine: 'Dr. [Last Name] - Congratulations on your DC license! (Practice portal live)',
    industryCallOpening: 'When someone is in acute pain, they book the first clinic with instant online scheduling and glowing clinical credentials.',
  },
  therapy: {
    profession: 'therapy',
    industryLabel: 'Mental Health & Counseling',
    clientType: 'private pay counseling clients and couples seeking therapy',
    primaryPainPoint: 'Building a private pay client roster without relying on low-reimbursement insurance panels or crowded directory listings',
    keySoftwareFeature: 'Compass Confidential Intake Portal & Secure Telehealth Scheduler',
    targetConversionGoal: 'confidential discovery sessions and weekly therapy slots',
    sampleSubjectLine: 'Congratulations on your Counseling license in [State], [First Name]! (Private practice site inside)',
    industryCallOpening: 'Private pay counseling clients look for warm, trustworthy therapists with a discrete digital intake experience.',
  },
  beauty: {
    profession: 'beauty',
    industryLabel: 'Esthetics & Medical Aesthetics',
    clientType: 'skincare clients, bridal parties, and treatment members',
    primaryPainPoint: 'Losing booking deposits from Instagram DMs and struggling to charge premium rates without a luxury digital storefront',
    keySoftwareFeature: 'Compass Treatment Menu & Automated Service Deposit Booking',
    targetConversionGoal: 'high-ticket facial packages and recurring monthly skincare memberships',
    sampleSubjectLine: 'Congratulations on your Esthetics license, [First Name]! (Your studio booking site is live)',
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
    sampleSubjectLine: 'Counselor [First Name] - Congratulations on your State Bar admission (Practice portal live)',
    industryCallOpening: 'In law, client perception is everything. A high-speed, secure practice site positions you as a premier legal advocate from Day 1.',
  },
  financial_advisor: {
    profession: 'financial_advisor',
    industryLabel: 'Wealth Management & Financial Planning',
    clientType: 'high-net-worth families, retirees, and business owners',
    primaryPainPoint: 'Earning immediate fiduciary trust with high-net-worth clients who evaluate digital sophistication before transferring assets',
    keySoftwareFeature: 'Compass Discovery Meeting Scheduler & Interactive Retirement Roadmap',
    targetConversionGoal: 'discovery consultations and assets under management (AUM) onboarding',
    sampleSubjectLine: 'Congratulations on your CFP® certification in [State], [First Name]! (Fiduciary practice portal)',
    industryCallOpening: 'Wealth planning clients demand flawless fiduciary credibility before trusting an advisor with their life savings.',
  },
  finance: {
    profession: 'finance',
    industryLabel: 'Accounting & Tax Advisory',
    clientType: 'business owners and high-income tax filers seeking year-round strategy',
    primaryPainPoint: 'Escaping transactional 1040 tax prep to build predictable, recurring monthly accounting advisory retainers',
    keySoftwareFeature: 'Compass Secure Client Document Vault & Strategy Call Booking',
    targetConversionGoal: 'monthly accounting retainers and high-margin tax planning packages',
    sampleSubjectLine: 'Congratulations on your CPA license, [First Name]! (Accounting advisory portal live)',
    industryCallOpening: 'Modern business owners want proactive year-round financial advisors, not just tax-time filing clerks.',
  },
  insurance: {
    profession: 'insurance',
    industryLabel: 'Insurance & Risk Advisory',
    clientType: 'families and business owners looking for policy coverage',
    primaryPainPoint: 'Competing with captive agency call centers and needing to stand out as an independent trusted fiduciary broker',
    keySoftwareFeature: 'Compass Multi-Line Quote Request Form & Policy Review Scheduler',
    targetConversionGoal: 'policy discovery calls and multi-line insurance applications',
    sampleSubjectLine: 'Congratulations on your Insurance license in [State], [First Name]! (Risk advisory site ready)',
    industryCallOpening: 'Clients buy insurance from individuals they trust to protect their life and assets when things go wrong.',
  },
  trade: {
    profession: 'trade',
    industryLabel: 'Master Trade Contracting (Electrical/HVAC/Plumbing)',
    clientType: 'homeowners and general contractors needing licensed tradesmen',
    primaryPainPoint: 'Relying on expensive lead-buying aggregators like Angi that resell the same lead to 5 contractors',
    keySoftwareFeature: 'Compass 24/7 Emergency Dispatch Request & Estimate Booking Widget',
    targetConversionGoal: 'direct service calls, panel upgrades, and high-ticket remodel jobs',
    sampleSubjectLine: 'Congratulations on your Master Trade license in [State], [First Name]! (Direct contractor site)',
    industryCallOpening: 'Why pay Angi or Yelp $80 per lead when your own branded practice site can generate direct homeowner calls with zero competition?',
  },
  architecture: {
    profession: 'architecture',
    industryLabel: 'Architecture & Spatial Design',
    clientType: 'custom home clients, commercial developers, and property renovators',
    primaryPainPoint: 'Showcasing intricate design portfolios with lightning-fast load times and landing high-budget architectural commissions',
    keySoftwareFeature: 'Compass High-Res Spatial Portfolio Showcase & Blueprint Consultation Intake',
    targetConversionGoal: 'design consultation agreements and custom residential commissions',
    sampleSubjectLine: 'Congratulations on your Architecture license, Architect [First Name]! (Design portfolio live)',
    industryCallOpening: 'High-end design clients expect an architectural portfolio site that reflects the same spatial elegance as your physical designs.',
  },
};

export interface ColdCallScriptData {
  openingHook: string;
  valuePitch: string;
  twoYearOffer: string;
  domainEquityClause: string;
  objections: {
    objection: string;
    rebuttal: string;
  }[];
  callerBountyNote: string;
}

export function generateColdCallScript(lead: Lead, offerPrice: number): ColdCallScriptData {
  const firstName = lead.fullName.split(' ')[0] || lead.fullName;
  const lastName = lead.fullName.split(' ').slice(1).join(' ') || lead.fullName;
  const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
  const industryProfile = INDUSTRY_PITCH_PROFILES[lead.profession] || INDUSTRY_PITCH_PROFILES.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;
  const siteUrl = getPreviewLink(lead.websiteConfig?.previewSlug || lead.id);

  const salutation = ['dental', 'chiropractic', 'veterinary'].includes(lead.profession)
    ? `Dr. ${lastName}`
    : firstName;

  return {
    openingHook: `"Hi ${salutation}, this is [Your Name] with My Compass Consulting. First off, huge congratulations on officially receiving your ${lead.professionTitle} license in ${lead.state}! I saw your recent board pass from ${lead.collegeOrSchool}."`,
    valuePitch: `"The reason for my call is that in your industry, ${industryProfile.clientType} search online first. Our engineering team at My Compass Consulting already secured your official practice domain and pre-built a live interactive portal powered by our Compass Software Suite on w4 high-speed cloud hosting so nobody else takes your brand."`,
    twoYearOffer: `"We give newly licensed practitioners a complete 2-year launch package for a single flat rate of $${offerPrice.toLocaleString()}. That gives you zero monthly hosting fees for 24 full months, a dedicated isolated IP, 10 professional @yourdomain email accounts, automated nightly backups, and real-time firewall security. After 2 years, your service simply continues at our base w4 rate of just $${hostingPlan.monthlyBaseRate}/mo with no lock-in contracts."`,
    domainEquityClause: `"Plus, you have full lease-to-own equity on your custom domain with a guaranteed unencumbered transfer option at $999 whenever you want full registrar custody."`,
    objections: [
      {
        objection: `"I already work with an existing firm, hospital, or brokerage."`,
        rebuttal: `"That's awesome! Most top performers still maintain their personal professional brand so their direct referrals, 5-star reviews, and client inquiries belong to them, not just the parent company."`,
      },
      {
        objection: `"I already have a friend building my website or I was going to use Squarespace."`,
        rebuttal: `"Totally understand. The challenge is DIY builders still charge $30-$50/month just for basic hosting, plus you have to buy Google Workspace separately. Our package gives you a fully custom practice portal, 10 free domain email accounts, dedicated IP, and 2 full years of high-speed hosting included for one flat fee."`,
      },
      {
        objection: `"Can I see what it looks like before making a decision?"`,
        rebuttal: `"Yes, absolutely! I can text or email your private preview link right now (${siteUrl}) while we're on the phone. What's your best cell number?"`,
      },
      {
        objection: `"What happens after the 2-year promotion ends?"`,
        rebuttal: `"It simply rolls over to our standard w4 hosting rate of $${hostingPlan.monthlyBaseRate}/mo to keep your Compass Suite, emails, and SSL active with no contracts. You can also buy out your domain asset for $999 at any time."`,
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

  if (templateId === 'industry_board_pass' || templateId === 'congratulations') {
    return {
      subject: `Congratulations on passing your ${lead.professionTitle} license, ${firstName}!`,
      emailBody: `Hi ${salutation},

I was reviewing the latest state licensing registry updates for ${lead.state} and noticed your newly issued ${lead.professionTitle} license from ${lead.collegeOrSchool}! Huge congratulations on reaching this career milestone.

As you begin taking on ${industryProfile.clientType} in ${lead.city}, having a verified, authoritative web presence is essential from Day 1.

My Compass Consulting took the liberty of creating a personalized website mockup tailored specifically for your practice, powered by the Compass Software Suite:

Take a look at your website preview: ${siteUrl}

Everything is already structured for your practice, from service breakdowns to ${industryProfile.keySoftwareFeature}.

Our promotional 2-year launch package is provided for a flat rate of $${offerPrice.toLocaleString()}. This includes full design customization, your custom domain name, and your first 2 YEARS of high-speed w4 cloud hosting and SSL included with zero monthly fees.

Key 2-Year Package Benefits:
• 24 Full Months of high-speed w4 cloud hosting & SSL encryption included (0 monthly bills for 2 full years)
• Custom practice domain (.com) registration & DNS management
• Turnkey Compass Software Suite with client intake & appointment booking
• After 24 months, hosting easily continues at our base rate of just $${hostingPlan.monthlyBaseRate}/mo with no lock-in contracts
• $999 domain lease-to-own buyout option if you ever want full registrar custody

Let me know what you think of the preview!

Warm regards,
Practice Launch Specialist
My Compass Consulting
freshmints.ai.studio`,
      smsBody: `Congrats ${firstName} on getting licensed as a ${lead.professionTitle}! My Compass Consulting built a practice preview with 2 yrs w4 hosting included: ${siteUrl}`,
    };
  }

  if (templateId === 'industry_client_magnet') {
    return {
      subject: `Client acquisition portal for your new ${lead.professionTitle} practice in ${lead.city}`,
      emailBody: `Hi ${salutation},

Now that your ${lead.professionTitle} license in ${lead.state} is active, your biggest growth lever is capturing ${industryProfile.clientType} searching for trusted local practitioners.

${industryProfile.primaryPainPoint}.

To give you an immediate competitive advantage, My Compass Consulting has engineered a turnkey practice portal powered by our Compass Software Suite:

View your live practice preview: ${siteUrl}

Engineered to Convert:
• ${industryProfile.keySoftwareFeature}
• Verified state credential badge from ${lead.collegeOrSchool}
• Mobile-optimized booking flow designed for ${industryProfile.targetConversionGoal}
• 2 FULL YEARS of enterprise w4 cloud hosting & SSL included ($0 monthly overhead for 24 months)
• Custom .com domain registration included

Promotional Launch Rate: $${offerPrice.toLocaleString()} flat for the entire 2-year package.
After 24 months, your hosting continues at our base w4 rate of $${hostingPlan.monthlyBaseRate}/mo, with an unencumbered $999 domain lease-to-own equity transfer option.

Would you like us to connect your official domain and activate this for your practice this week?

Best regards,
Practice Growth Consultant
My Compass Consulting
freshmints.ai.studio`,
      smsBody: `Hi ${firstName}! Ready to book ${industryProfile.clientType}? My Compass Consulting built a turnkey portal for your practice with 2 yrs w4 hosting: ${siteUrl}`,
    };
  }

  if (templateId === 'industry_domain_protection' || templateId === 'launch_urgency') {
    return {
      subject: `[Action Required] Practice domain secured for ${lead.fullName} (${lead.professionTitle})`,
      emailBody: `Hi ${salutation},

First off, congratulations on receiving your official ${lead.professionTitle} license in ${lead.state}!

When state licensing boards publish new licensee rosters, third-party lead aggregators and competitors frequently buy up practitioner domain names to resell at inflated prices.

To protect your professional brand, My Compass Consulting has reserved your custom practice domain and pre-built your live practice web portal:

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
freshmints.ai.studio`,
      smsBody: `Hi ${firstName}, we reserved your official practice domain and built a preview with 2 yrs w4 hosting included: ${siteUrl} - Tap to review!`,
    };
  }

  return {
    subject: `Executive practice consulting proposal: ${lead.fullName} (${lead.professionTitle})`,
    emailBody: `Dear ${salutation},

Congratulations on your newly issued ${lead.professionTitle} license in ${lead.state}.

As you establish your practice footprint in ${lead.city}, your digital touchpoint is the primary asset prospective ${industryProfile.clientType} evaluate when making engagement decisions.

My Compass Consulting is pleased to present a turnkey practice digital infrastructure proposal powered by the Compass Software Suite:

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
freshmints.ai.studio`,
    smsBody: `Hello ${firstName}, congratulations on your license! Here is your custom practice site preview with 2 years w4 hosting from My Compass Consulting: ${siteUrl}`,
  };
}
