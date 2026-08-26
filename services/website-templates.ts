import { ProfessionCategory, WebsitePreviewConfig, PROFESSION_CONFIGS } from '../types/lead';

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
    primaryColor: '#0f766e', // Teal-700
    accentColor: '#f59e0b', // Amber-500
    bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
    badgeText: 'State Licensed Real Estate Specialist',
    features: ['Property Valuation Widget', 'Client Consultation Scheduler', 'Active Listings Gallery', 'Neighborhood Guide'],
  },
  nursing: {
    id: 'care_nurse',
    name: 'Serene Care Concierge',
    primaryColor: '#e11d48', // Rose-600
    accentColor: '#06b6d4', // Cyan-500
    bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
    badgeText: 'Board Certified Registered Nurse (RN)',
    features: ['Telehealth Consultation Booking', 'Medical Credentials Verification', 'Custom Treatment Packages', 'Patient Reviews'],
  },
  dental: {
    id: 'dental_clinic',
    name: 'Pristine Smiles Dental',
    primaryColor: '#0284c7', // Sky-600
    accentColor: '#06b6d4', // Cyan-500
    bgGradient: 'from-slate-900 via-sky-950 to-slate-900',
    badgeText: 'Licensed Doctor of Dental Surgery (DDS)',
    features: ['Patient Booking & Intake', 'Smile Gallery & Before/After', 'Emergency Care Dispatch', 'Insurance Verification'],
  },
  chiropractic: {
    id: 'chiro_wellness',
    name: 'Kinetic Motion Spine & Rehab',
    primaryColor: '#059669', // Emerald-600
    accentColor: '#10b981', // Emerald-500
    bgGradient: 'from-slate-900 via-emerald-950 to-slate-900',
    badgeText: 'Doctor of Chiropractic (DC)',
    features: ['New Patient Consultation Booking', 'Treatment Modality Breakdown', 'Spine Health Assessment', 'Verified Board Credentials'],
  },
  beauty: {
    id: 'studio_beauty',
    name: 'Luminous Glow Studio',
    primaryColor: '#db2777', // Pink-600
    accentColor: '#fb7185', // Rose-400
    bgGradient: 'from-slate-900 via-pink-950 to-slate-900',
    badgeText: 'State Licensed Medical Esthetician',
    features: ['Online Booking Calendar', 'Treatment Menu & Pricing', 'Before/After Transformation Gallery', 'Skin Quiz'],
  },
  therapy: {
    id: 'care_nurse',
    name: 'Mindful Wellness Practice',
    primaryColor: '#2563eb', // Blue-600
    accentColor: '#10b981', // Emerald-500
    bgGradient: 'from-slate-900 via-blue-950 to-slate-900',
    badgeText: 'Licensed Professional Counselor',
    features: ['Confidential Intake Form', 'Telehealth Video Integration', 'Specialty Areas Breakdown', 'Insurance & Fees'],
  },
  veterinary: {
    id: 'vet_care',
    name: 'Compassion Pet Veterinary',
    primaryColor: '#0d9488', // Teal-600
    accentColor: '#f97316', // Orange-500
    bgGradient: 'from-slate-900 via-teal-950 to-slate-900',
    badgeText: 'Doctor of Veterinary Medicine (DVM)',
    features: ['Pet Appointment Scheduler', 'Mobile & Urgent Care Form', 'Preventative Wellness Packages', 'Patient Portal'],
  },
  trade: {
    id: 'craft_trade',
    name: 'Precision Master Contractor',
    primaryColor: '#ea580c', // Orange-600
    accentColor: '#eab308', // Yellow-500
    bgGradient: 'from-slate-900 via-amber-950 to-slate-900',
    badgeText: 'Licensed Master Trade Contractor',
    features: ['Instant Online Estimate Calculator', '24/7 Emergency Dispatch Form', 'Project Portfolio', 'License Verification'],
  },
  legal: {
    id: 'legal_counsel',
    name: 'Apex Legal Counsel',
    primaryColor: '#1e293b', // Slate-800
    accentColor: '#d97706', // Amber-600
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    badgeText: 'Licensed Attorney & Bar Member',
    features: ['Free Case Evaluation Form', 'Practice Areas Directory', 'Client Testimonials', 'Bar Status Badge'],
  },
  financial_advisor: {
    id: 'finance_advisor',
    name: 'Beacon Wealth & Fiduciary Advisors',
    primaryColor: '#065f46', // Emerald-800
    accentColor: '#10b981', // Emerald-500
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    badgeText: 'Certified Financial Planner (CFP®) & Fiduciary',
    features: ['Retirement Readiness Calculator', 'Client Discovery Call Scheduler', 'Fee-Only Fiduciary Promise', 'Secure Client Portal'],
  },
  finance: {
    id: 'finance_advisor',
    name: 'Vanguard CPA Advisory',
    primaryColor: '#047857', // Emerald-700
    accentColor: '#3b82f6', // Blue-500
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    badgeText: 'Certified Public Accountant (CPA)',
    features: ['Tax Planning Calculator', 'Client Document Portal', 'Retirement Advisory Consultation', 'CPA Board License'],
  },
  insurance: {
    id: 'insurance_broker',
    name: 'Horizon Shield Insurance',
    primaryColor: '#1d4ed8', // Blue-700
    accentColor: '#f59e0b', // Amber-500
    bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
    badgeText: 'Licensed Insurance & Risk Broker',
    features: ['Instant Policy Quote Request', 'Coverage Comparison Tool', 'Claims Guidance Form', 'State License Verification'],
  },
  architecture: {
    id: 'arch_studio',
    name: 'Blueprint Studio Architects',
    primaryColor: '#334155', // Slate-700
    accentColor: '#06b6d4', // Cyan-500
    bgGradient: 'from-slate-950 via-slate-900 to-zinc-900',
    badgeText: 'Licensed Architect & Design Principal',
    features: ['Project Portfolio Showcase', 'Architectural Consultation Scheduler', 'Project Scope Calculator', 'AIA Credentials'],
  },
};

export function getDefaultWebsiteConfig(
  fullName: string,
  profession: ProfessionCategory,
  city: string,
  state: string,
  school: string
): WebsitePreviewConfig {
  const preset = THEME_PRESETS[profession] || THEME_PRESETS.real_estate;
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');

  const profMeta = PROFESSION_CONFIGS[profession] || PROFESSION_CONFIGS.real_estate;

  return {
    templateId: preset.id as any,
    heroHeadline: `${fullName} — Official ${preset.badgeText}`,
    heroSubheadline: `Providing premier ${profession.replace('_', ' ')} services in ${city}, ${state}. Verified license graduate from ${school}.`,
    bioText: `Welcome to the official practice website of ${fullName}. Dedicated to serving clients in ${city} and surrounding communities with unmatched professionalism, transparency, and top-tier expertise.`,
    tagline: preset.name,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    offerPrice: profMeta.averageWebsiteValue || 1650,
    previewSlug: `${cleanName}-official`,
    callToAction: 'Schedule Free Consultation',
    demoPhotos: [
      `https://picsum.photos/seed/${cleanName}1/800/600`,
      `https://picsum.photos/seed/${cleanName}2/800/600`,
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

export function getPreviewLink(slug: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/preview/${slug}`;
  }
  return `/preview/${slug}`;
}

