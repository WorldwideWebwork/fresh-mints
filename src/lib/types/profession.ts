import type { W4HostingTier } from './hosting';

export type ProfessionCategory =
  | 'real_estate'
  | 'nursing'
  | 'dental'
  | 'chiropractic'
  | 'therapy'
  | 'beauty'
  | 'veterinary'
  | 'legal'
  | 'financial_advisor'
  | 'finance'
  | 'insurance'
  | 'trade'
  | 'architecture';

export interface ProfessionMetadata {
  id: ProfessionCategory;
  label: string;
  iconName: string;
  defaultTitle: string;
  hostingTier: W4HostingTier;
  averageWebsiteValue: number;
  commonServices: string[];
}

export const PROFESSION_CONFIGS: Record<ProfessionCategory, ProfessionMetadata> = {
  real_estate: {
    id: 'real_estate',
    label: 'Real Estate Agents & Brokers',
    iconName: 'Home',
    defaultTitle: 'Licensed Real Estate Agent',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Buyer Representation', 'Home Valuation', 'Luxury Property Listings', 'First-Time Homebuyer Seminars'],
  },
  nursing: {
    id: 'nursing',
    label: 'Nurses & Concierge Healthcare',
    iconName: 'HeartPulse',
    defaultTitle: 'Registered Nurse (RN, BSN)',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Private Concierge Care', 'IV Hydration Therapy', 'Infusion Nursing', 'Health & Wellness Coaching'],
  },
  dental: {
    id: 'dental',
    label: 'Dentists & Orthodontists',
    iconName: 'Activity',
    defaultTitle: 'Doctor of Dental Surgery (DDS)',
    hostingTier: 'silver',
    averageWebsiteValue: 2650,
    commonServices: ['Cosmetic Dentistry & Veneers', 'Invisalign & Orthodontics', 'Teeth Whitening', 'Emergency Dental Care'],
  },
  chiropractic: {
    id: 'chiropractic',
    label: 'Chiropractors & Physio',
    iconName: 'Activity',
    defaultTitle: 'Doctor of Chiropractic (DC)',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Spine & Joint Adjustments', 'Sports Injury Rehabilitation', 'Posture Correction', 'Acupuncture & Wellness'],
  },
  therapy: {
    id: 'therapy',
    label: 'Therapists & Psychologists',
    iconName: 'UserCheck',
    defaultTitle: 'Licensed Professional Counselor (LPC)',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Individual Telehealth Therapy', 'Anxiety & Stress Management', 'Couples Counseling', 'Mindfulness Sessions'],
  },
  beauty: {
    id: 'beauty',
    label: 'Cosmetology & Esthetics',
    iconName: 'Sparkles',
    defaultTitle: 'Licensed Esthetician & Skin Specialist',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Medical Grade Facials', 'Lash Extensions', 'Skincare Consultations', 'Bridal & Event Glow Packages'],
  },
  veterinary: {
    id: 'veterinary',
    label: 'Veterinarians & Animal Care',
    iconName: 'Heart',
    defaultTitle: 'Doctor of Veterinary Medicine (DVM)',
    hostingTier: 'silver',
    averageWebsiteValue: 2650,
    commonServices: ['Mobile In-Home Vet Visits', 'Puppy & Kitten Wellness Exams', 'Dental Cleanings', 'Urgent Pet Consultations'],
  },
  legal: {
    id: 'legal',
    label: 'Attorneys & Legal Counsel',
    iconName: 'Scale',
    defaultTitle: 'Licensed Attorney at Law',
    hostingTier: 'gold',
    averageWebsiteValue: 3950,
    commonServices: ['Estate Planning & Wills', 'Business Incorporation', 'Contract Review', 'Legal Consultation'],
  },
  financial_advisor: {
    id: 'financial_advisor',
    label: 'Financial Advisors & Wealth Planners',
    iconName: 'DollarSign',
    defaultTitle: 'Certified Financial Planner (CFP®)',
    hostingTier: 'gold',
    averageWebsiteValue: 3950,
    commonServices: ['Fee-Only Wealth Management', 'Retirement & 401(k) Rollovers', 'Comprehensive Financial Planning', 'Tax-Smart Portfolio Strategy'],
  },
  finance: {
    id: 'finance',
    label: 'CPAs & Tax Strategists',
    iconName: 'TrendingUp',
    defaultTitle: 'Certified Public Accountant (CPA)',
    hostingTier: 'gold',
    averageWebsiteValue: 3950,
    commonServices: ['Tax Planning & Filing', 'Bookkeeping Services', 'Small Business Advisory', 'Corporate Financial Strategy'],
  },
  insurance: {
    id: 'insurance',
    label: 'Insurance & Risk Brokers',
    iconName: 'ShieldCheck',
    defaultTitle: 'Licensed Insurance Broker',
    hostingTier: 'bronze',
    averageWebsiteValue: 1650,
    commonServices: ['Life & Annuity Coverage', 'Commercial Liability', 'Home & Auto Policies', 'Medicare Advisory'],
  },
  trade: {
    id: 'trade',
    label: 'Electricians, Plumbers & HVAC',
    iconName: 'Wrench',
    defaultTitle: 'Licensed Master Electrician',
    hostingTier: 'silver',
    averageWebsiteValue: 2650,
    commonServices: ['Residential Rewiring', 'EV Charger Installation', 'Panel Upgrades', '24/7 Emergency Repairs'],
  },
  architecture: {
    id: 'architecture',
    label: 'Architects & Interior Designers',
    iconName: 'Layers',
    defaultTitle: 'Licensed Architect (AIA)',
    hostingTier: 'silver',
    averageWebsiteValue: 2650,
    commonServices: ['Custom Residential Design', 'Commercial Space Planning', 'Permit & Blueprint Drafting', 'Interior Styling'],
  },
};

const DEFAULT_PROFESSION: ProfessionCategory = 'real_estate';

/**
 * Resolves a profession key to its metadata. An unknown or unmapped key falls
 * back to real_estate, so callers can read averageWebsiteValue or hostingTier
 * off the result without guarding against undefined.
 */
export const getProfessionConfig = (key: string): ProfessionMetadata => {
  const isKnownProfession = Object.hasOwn(PROFESSION_CONFIGS, key);
  if (!isKnownProfession) return PROFESSION_CONFIGS[DEFAULT_PROFESSION];
  return PROFESSION_CONFIGS[key as ProfessionCategory];
};
