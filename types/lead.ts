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

export type W4HostingTier = 'quantum' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface W4HostingPlan {
  id: W4HostingTier;
  name: string;
  monthlyBaseRate: number; // e.g. 14.99, 34.99, 74.99, 129.99, 299.00
  twoYearFlatPackagePrice: number; // e.g. 1250, 1650, 2650, 3950, 8500
  callerCommission: number; // $300.00 cash bounty per closed deal
  twoYearHostingCost: number; // 24 * monthlyBaseRate
  twoYearDomainCost: number; // $28.00 ($14/yr wholesale registrar)
  netConsultingProfit: number; // Package price - caller bounty - hosting cost - domain cost
  domainBuyoutPrice: number; // $999.00 unencumbered DNS equity transfer
  description: string;
  includedSuiteFeatures: string[];
}

export const W4_HOSTING_PLANS: Record<W4HostingTier, W4HostingPlan> = {
  quantum: {
    id: 'quantum',
    name: 'w4 Quantum',
    monthlyBaseRate: 14.99,
    twoYearFlatPackagePrice: 1250,
    callerCommission: 300,
    twoYearHostingCost: 359.76,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 562.24,
    domainBuyoutPrice: 999,
    description: 'High-speed single practitioner hosting for solo wellness, beauty, and nurse consulting practices.',
    includedSuiteFeatures: [
      'Compass Practice Booking Suite',
      'Verified State License Badge',
      'Client Intake & Inquiry Forms',
      'Enterprise SSL & DNS Security',
      '24 Months Zero Monthly Overhead',
    ],
  },
  bronze: {
    id: 'bronze',
    name: 'w4 Bronze',
    monthlyBaseRate: 34.99,
    twoYearFlatPackagePrice: 1650,
    callerCommission: 300,
    twoYearHostingCost: 839.76,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 482.24,
    domainBuyoutPrice: 999,
    description: 'Dedicated high-bandwidth portal for real estate agents, therapists, chiropractors, and insurance brokers.',
    includedSuiteFeatures: [
      'Compass Multi-Service Scheduler',
      'Interactive Consultation Valuation Engine',
      'Client Intake & Telehealth Ready',
      'Automated Lead SMS/Email Notifications',
      '24 Months Zero Monthly Overhead',
    ],
  },
  silver: {
    id: 'silver',
    name: 'w4 Silver',
    monthlyBaseRate: 74.99,
    twoYearFlatPackagePrice: 2650,
    callerCommission: 300,
    twoYearHostingCost: 1799.76,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 522.24,
    domainBuyoutPrice: 999,
    description: 'Performance cluster for clinical dental practices, veterinary hospitals, and master trade contracting firms.',
    includedSuiteFeatures: [
      'Compass Clinical Patient Intake & Booking',
      'Before/After High-Res Media Showcase',
      'Emergency Dispatch Dispatcher Widget',
      'HIPAA / PCI Compliant SSL Vault',
      '24 Months Zero Monthly Overhead',
    ],
  },
  gold: {
    id: 'gold',
    name: 'w4 Gold',
    monthlyBaseRate: 129.99,
    twoYearFlatPackagePrice: 3950,
    callerCommission: 300,
    twoYearHostingCost: 3119.76,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 502.24,
    domainBuyoutPrice: 999,
    description: 'Enterprise secure server stack for attorneys, CPAs, wealth advisors, and architectural principals.',
    includedSuiteFeatures: [
      'Compass Fiduciary Client Vault & Discovery Booking',
      'Retirement & Case Evaluation Calculators',
      'Encrypted Document Upload Portal',
      'Bar & Board Verified Accreditation Badge',
      '24 Months Zero Monthly Overhead',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'w4 Platinum',
    monthlyBaseRate: 299.0,
    twoYearFlatPackagePrice: 8500,
    callerCommission: 300,
    twoYearHostingCost: 7176.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 996.0,
    domainBuyoutPrice: 999,
    description: 'Multi-location enterprise infrastructure for boutique brokerages and group medical clinics.',
    includedSuiteFeatures: [
      'Multi-Staff Compass Scheduling Engine',
      'Dedicated Isolated IP & Custom CDN Edge',
      'Automated Continuous Backup Vault',
      'Priority 24/7 SLA Engineering Support',
      '24 Months Zero Monthly Overhead',
    ],
  },
};

export type LicenseStatus = 'Newly Issued' | 'Active Board Pass' | 'Recent Graduate';

export type SkipTraceStatus = 'Not Traced' | 'In Progress' | 'Traced' | 'Partial';

export type OutreachStatus =
  | 'Uncontacted'
  | 'Skip Traced'
  | 'Site Built'
  | 'Outreach Sent'
  | 'In Discussion'
  | 'Client Won'
  | 'Declined';

export const OUTREACH_STAGES: OutreachStatus[] = [
  'Uncontacted',
  'Skip Traced',
  'Site Built',
  'Outreach Sent',
  'In Discussion',
  'Client Won',
  'Declined',
];

export interface SkipTraceResult {
  tracedAt?: string;
  confidenceScore: number;
  verifiedPhone: string;
  phoneType: string;
  dncStatus: string;
  primaryEmail: string;
  emailValidation: string;
  secondaryEmail?: string;
  linkedInUrl?: string;
  instagramHandle?: string;
  currentAddress: string;
  mailingAddress?: string;
  enrichmentNotes: string;
}

export interface WebsiteServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface WebsitePreviewConfig {
  templateId:
    | 'realty_pro'
    | 'care_nurse'
    | 'dental_clinic'
    | 'chiro_wellness'
    | 'studio_beauty'
    | 'vet_care'
    | 'legal_counsel'
    | 'craft_trade'
    | 'finance_advisor'
    | 'insurance_broker'
    | 'arch_studio';
  heroHeadline: string;
  heroSubheadline: string;
  bioText: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  services: WebsiteServiceItem[];
  callToAction: string;
  offerPrice: number;
  previewSlug: string;
  demoPhotos: string[];
}

export interface ExistingWebsiteAudit {
  hasWebsite: boolean;
  existingUrl?: string | null;
  status: 'No Website Found - High Opportunity' | 'Has Existing Website' | 'Directory Listing Only' | 'Inconclusive';
  summary: string;
  pitchStrategy: string;
  socialProfilesFound?: string[];
  qualifications?: {
    hasCustomDomain: boolean;
    domainCheckSummary: string;
    hasDirectBookingPortal: boolean;
    isOnlyDirectoryOrBoardListing: boolean;
    digitalFootprintRating: 'Zero Digital Presence' | 'Registry Only' | 'Directory Listing' | 'Established Custom Site';
  };
  checkedAt: string;
}

export interface OutreachLogItem {
  id: string;
  timestamp: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  status: 'draft' | 'sent' | 'opened' | 'clicked' | 'responded';
  toneUsed: string;
}

export interface Lead {
  id: string;
  fullName: string;
  profession: ProfessionCategory;
  professionTitle: string; // e.g. "Licensed Real Estate Salesperson", "Registered Nurse (BSN, RN)"
  state: string;
  city: string;
  licenseNumber: string;
  issueDate: string; // ISO date or "2026-08-15"
  collegeOrSchool: string;
  graduationYear: number;
  licenseStatus: LicenseStatus;
  
  // Skip tracing state
  skipTraceStatus: SkipTraceStatus;
  skipTraceData?: SkipTraceResult;

  // Pitch & Website state
  outreachStatus: OutreachStatus;
  websiteConfig?: WebsitePreviewConfig;
  websiteAudit?: ExistingWebsiteAudit;
  outreachLogs: OutreachLogItem[];

  // Notes & tracking
  estimatedDealValue: number;
  notes?: string;
  createdAt: string;
}

export interface ProfessionMetadata {
  id: ProfessionCategory;
  label: string;
  iconName: string;
  defaultTitle: string;
  hostingTier: W4HostingTier;
  averageWebsiteValue: number;
  commonServices: string[];
}

export interface CustomTabConfig {
  id: string;
  label: string;
  iconName: string;
  professionFilter?: ProfessionCategory | 'all';
  stateFilter?: string;
  outreachStatusFilter?: string;
  searchFilter?: string;
  isBuiltIn?: boolean;
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
    hostingTier: 'quantum',
    averageWebsiteValue: 1250,
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
    hostingTier: 'quantum',
    averageWebsiteValue: 1250,
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
