import { type ProfessionCategory, type WebsitePreviewConfig, type Lead, PROFESSION_CONFIGS } from '../types/lead';

export interface WebsiteThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  badgeText: string;
  features: string[];
}

export const THEME_PRESETS: Record<ProfessionCategory, WebsiteThemePreset> = {
  real_estate: {
    id: 'realty_pro',
    name: 'Coastal Luxe Realty',
    primaryColor: '#0f766e',
    accentColor: '#f59e0b',
    bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
    badgeText: 'State Licensed Real Estate Specialist',
    features: ['Property Valuation Widget', 'Client Consultation Scheduler', 'Active Listings Gallery', 'Neighborhood Guide'],
  },
  nursing: {
    id: 'care_nurse',
    name: 'Serene Care Concierge',
    primaryColor: '#e11d48',
    accentColor: '#06b6d4',
    bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
    badgeText: 'Board Certified Registered Nurse (RN)',
    features: ['Telehealth Consultation Booking', 'Medical Credentials Verification', 'Custom Treatment Packages', 'Patient Reviews'],
  },
  dental: {
    id: 'dental_clinic',
    name: 'Pristine Smiles Dental',
    primaryColor: '#0284c7',
    accentColor: '#06b6d4',
    bgGradient: 'from-slate-900 via-sky-950 to-slate-900',
    badgeText: 'Licensed Doctor of Dental Surgery (DDS)',
    features: ['Patient Booking & Intake', 'Smile Gallery & Before/After', 'Emergency Care Dispatch', 'Insurance Verification'],
  },
  chiropractic: {
    id: 'chiro_wellness',
    name: 'Kinetic Motion Spine & Rehab',
    primaryColor: '#059669',
    accentColor: '#10b981',
    bgGradient: 'from-slate-900 via-emerald-950 to-slate-900',
    badgeText: 'Doctor of Chiropractic (DC)',
    features: ['New Patient Consultation Booking', 'Treatment Modality Breakdown', 'Spine Health Assessment', 'Verified Board Credentials'],
  },
  beauty: {
    id: 'studio_beauty',
    name: 'Luminous Glow Studio',
    primaryColor: '#db2777',
    accentColor: '#fb7185',
    bgGradient: 'from-slate-900 via-pink-950 to-slate-900',
    badgeText: 'State Licensed Medical Esthetician',
    features: ['Online Booking Calendar', 'Treatment Menu & Pricing', 'Before/After Transformation Gallery', 'Skin Quiz'],
  },
  therapy: {
    id: 'care_nurse',
    name: 'Mindful Wellness Practice',
    primaryColor: '#2563eb',
    accentColor: '#10b981',
    bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
    badgeText: 'Licensed Professional Counselor',
    features: ['Confidential Intake Form', 'Telehealth Video Integration', 'Specialty Areas Breakdown', 'Insurance & Fees'],
  },
  veterinary: {
    id: 'vet_care',
    name: 'Compassion Pet Veterinary',
    primaryColor: '#0d9488',
    accentColor: '#f97316',
    bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
    badgeText: 'Doctor of Veterinary Medicine (DVM)',
    features: ['Pet Appointment Scheduler', 'Mobile & Urgent Care Form', 'Preventative Wellness Packages', 'Patient Portal'],
  },
  trade: {
    id: 'craft_trade',
    name: 'Precision Master Contractor',
    primaryColor: '#ea580c',
    accentColor: '#eab308',
    bgGradient: 'from-slate-900 via-amber-950 to-slate-900',
    badgeText: 'Licensed Master Trade Contractor',
    features: ['Instant Online Estimate Calculator', '24/7 Emergency Dispatch Form', 'Project Portfolio', 'License Verification'],
  },
  legal: {
    id: 'legal_counsel',
    name: 'Apex Legal Counsel',
    primaryColor: '#1e293b',
    accentColor: '#d97706',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    badgeText: 'Licensed Attorney & Bar Member',
    features: ['Free Case Evaluation Form', 'Practice Areas Directory', 'Client Testimonials', 'Bar Status Badge'],
  },
  financial_advisor: {
    id: 'finance_advisor',
    name: 'Beacon Wealth & Fiduciary Advisors',
    primaryColor: '#065f46',
    accentColor: '#10b981',
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    badgeText: 'Certified Financial Planner (CFP®) & Fiduciary',
    features: ['Retirement Readiness Calculator', 'Client Discovery Call Scheduler', 'Fee-Only Fiduciary Promise', 'Secure Client Portal'],
  },
  finance: {
    id: 'finance_advisor',
    name: 'Vanguard CPA Advisory',
    primaryColor: '#047857',
    accentColor: '#3b82f6',
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    badgeText: 'Certified Public Accountant (CPA)',
    features: ['Tax Planning Calculator', 'Client Document Portal', 'Retirement Advisory Consultation', 'CPA Board License'],
  },
  insurance: {
    id: 'insurance_broker',
    name: 'Horizon Shield Insurance',
    primaryColor: '#1d4ed8',
    accentColor: '#f59e0b',
    bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
    badgeText: 'Licensed Insurance & Risk Broker',
    features: ['Instant Policy Quote Request', 'Coverage Comparison Tool', 'Claims Guidance Form', 'State License Verification'],
  },
  architecture: {
    id: 'arch_studio',
    name: 'Blueprint Studio Architects',
    primaryColor: '#334155',
    accentColor: '#06b6d4',
    bgGradient: 'from-slate-950 via-slate-900 to-zinc-900',
    badgeText: 'Licensed Architect & Design Principal',
    features: ['Project Portfolio Showcase', 'Architectural Consultation Scheduler', 'Project Scope Calculator', 'AIA Credentials'],
  },
};

/**
 * Generate a clean, human-readable kebab-case preview slug from a practitioner's name.
 * Handles duplicate collision disambiguation via state or short license suffixes.
 * e.g. "Sarah Jenkins" -> "sarah-jenkins"
 * e.g. duplicate "Sarah Jenkins" in TX -> "sarah-jenkins-tx" or "sarah-jenkins-5079"
 */
export function generateLeadPreviewSlug(
  fullName: string,
  fallbackId: string = '',
  state: string = '',
  licenseOrNpi: string = '',
  existingSlugs?: Set<string> | string[]
): string {
  if (!fullName || fullName.trim().length === 0) {
    return fallbackId ? fallbackId.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'demo-practice';
  }

  // Remove common professional prefixes/suffixes for a cleaner custom domain/slug
  const stripped = fullName
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?|attorney|coach)\s+/i, '')
    .replace(/,\s*(dds|dmd|md|do|rn|cpa|cfp|esq|dc|dvm|lpc|np|apn|fa).*$/i, '')
    .trim();

  let slug = stripped
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // kebab-case
    .replace(/^-+|-+$/g, '');        // trim leading/trailing dashes

  if (!slug || slug === 'finra' || slug.startsWith('nppes-') || slug.startsWith('finra-') || slug.startsWith('lead-')) {
    return fallbackId ? fallbackId.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'practitioner-preview';
  }

  // Check collision against existing set of slugs
  if (existingSlugs) {
    const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);
    if (slugSet.has(slug)) {
      // 1. Try appending state code (e.g. sarah-jenkins-tx)
      if (state && state.trim().length > 0) {
        const stateSlug = `${slug}-${state.toLowerCase().trim()}`;
        if (!slugSet.has(stateSlug)) return stateSlug;
      }

      // 2. Try appending last 4 digits of license or NPI (e.g. sarah-jenkins-5079)
      const numericDigits = (licenseOrNpi || fallbackId).replace(/[^0-9]/g, '');
      if (numericDigits.length >= 4) {
        const licenseSlug = `${slug}-${numericDigits.slice(-4)}`;
        if (!slugSet.has(licenseSlug)) return licenseSlug;
      }

      // 3. Fallback incrementing counter (e.g. sarah-jenkins-2)
      let counter = 2;
      while (slugSet.has(`${slug}-${counter}`)) {
        counter++;
      }
      return `${slug}-${counter}`;
    }
  }

  return slug;
}

export function getDefaultWebsiteConfig(
  fullName: string,
  profession: ProfessionCategory,
  city: string,
  state: string,
  school: string
): WebsitePreviewConfig {
  const preset = THEME_PRESETS[profession] || THEME_PRESETS.real_estate;
  const cleanSlug = generateLeadPreviewSlug(fullName);
  const cleanSeed = cleanSlug.replace(/-/g, '');
  const profMeta = PROFESSION_CONFIGS[profession] || PROFESSION_CONFIGS.real_estate;

  return {
    templateId: preset.id as any,
    heroHeadline: `${fullName} - Official ${preset.badgeText}`,
    heroSubheadline: `Providing premier ${profession.replace('_', ' ')} services in ${city}, ${state}. Verified license graduate from ${school}.`,
    bioText: `Welcome to the official practice website of ${fullName}. Dedicated to serving clients in ${city} and surrounding communities with unmatched professionalism, transparency, and top-tier expertise.`,
    tagline: preset.name,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    offerPrice: profMeta.averageWebsiteValue || 1650,
    previewSlug: cleanSlug,
    callToAction: 'Schedule Free Consultation',
    templateTheme: 'executive_dark',
    demoPhotos: [
      `https://picsum.photos/seed/${cleanSeed}1/800/600`,
      `https://picsum.photos/seed/${cleanSeed}2/800/600`,
    ],
    services: [
      {
        id: '1',
        title: 'Personalized Consultation',
        description: `1-on-1 strategy session tailored specifically to your goals in ${city}.`,
        iconName: 'UserCheck',
      },
      {
        id: '2',
        title: 'Full Service Execution',
        description: 'End-to-end management with complete transparency and certified standards.',
        iconName: 'ShieldCheck',
      },
      {
        id: '3',
        title: 'Ongoing Support & Advisory',
        description: 'Continuous assistance to ensure long-term satisfaction and success.',
        iconName: 'Award',
      },
    ],
  };
}

/**
 * Extract clean slug string from target input (Lead object, partial lead, or slug string).
 */
export function resolveTargetSlug(target: string | Partial<Lead> | { id: string; fullName?: string; websiteConfig?: { previewSlug?: string } }): string {
  let slug = 'demo';

  if (typeof target === 'string') {
    slug = target;
  } else if (target && typeof target === 'object') {
    if (target.websiteConfig?.previewSlug && !target.websiteConfig.previewSlug.startsWith('finra-') && !target.websiteConfig.previewSlug.startsWith('nppes-')) {
      slug = target.websiteConfig.previewSlug;
    } else if (target.fullName) {
      slug = generateLeadPreviewSlug(target.fullName, target.id || '');
    } else {
      slug = target.id || 'demo';
    }

    // Cache the lead in browser storage so standalone preview tabs load instantly
    if (typeof window !== 'undefined') {
      try {
        const cleanKey = `fm_preview_${slug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '')}`;
        sessionStorage.setItem(cleanKey, JSON.stringify(target));
        localStorage.setItem(cleanKey, JSON.stringify(target));
      } catch (e) {
        // Storage quota / error ignore
      }
    }
  }

  return slug.toLowerCase().replace(/^\/?preview\/?/, '').replace(/^\/+/, '');
}

/**
 * Generates preview link formatted as hash route (default for single-page app compatibility).
 * e.g. "http://mycompass/fresh-mints/#/preview/sarah-jenkins"
 */
export function getPreviewLink(target: string | Partial<Lead> | { id: string; fullName?: string; websiteConfig?: { previewSlug?: string } }): string {
  const cleanSlug = encodeURIComponent(resolveTargetSlug(target));

  if (typeof window !== 'undefined' && window.location?.origin) {
    const basePath = window.location.pathname.replace(/\/+$/, '');
    const search = window.location.search || '';
    return `${window.location.origin}${basePath}/${search}#/preview/${cleanSlug}`.replace(/([^:])\/\//g, '$1/');
  }
  return `#/preview/${cleanSlug}`;
}

/**
 * Generates direct clean path preview link (routed via WordPress rewrite rules).
 * e.g. "http://mycompass/preview/sarah-jenkins"
 */
export function getPathPreviewLink(target: string | Partial<Lead> | { id: string; fullName?: string; websiteConfig?: { previewSlug?: string } }): string {
  const cleanSlug = encodeURIComponent(resolveTargetSlug(target));

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/preview/${cleanSlug}`;
  }
  return `/preview/${cleanSlug}`;
}

/**
 * Generates practitioner subdomain preview link.
 * e.g. "http://sarah-jenkins.mycompass" or "https://sarah-jenkins.worldwidewebwork.com"
 */
export function getSubdomainPreviewLink(target: string | Partial<Lead> | { id: string; fullName?: string; websiteConfig?: { previewSlug?: string } }): string {
  const cleanSlug = resolveTargetSlug(target);

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    const port = window.location.port ? `:${window.location.port}` : '';

    // If hostname has multiple segments (e.g. mycompass or worldwidewebwork.com)
    const hostParts = host.split('.');
    if (hostParts.length === 1) {
      // Local single name host e.g. "mycompass" or "localhost"
      return `${protocol}//${cleanSlug}.${host}${port}/`;
    }
    // Remove existing subdomains (e.g. "www", "preview", "freshmints")
    const rootDomain = hostParts.slice(-2).join('.');
    return `${protocol}//${cleanSlug}.${rootDomain}${port}/`;
  }
  return `http://${cleanSlug}.worldwidewebwork.com/`;
}

