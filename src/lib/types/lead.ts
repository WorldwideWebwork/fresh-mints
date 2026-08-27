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

export type W4HostingTier =
  | 'quantum'
  | 'bronze'
  | 'silver'
  | 'silver_enhanced'
  | 'gold'
  | 'gold_enhanced'
  | 'platinum'
  | 'platinum_enhanced'
  | 'uranium'
  | 'titanium'
  | 'palladium';

export interface GlobalPlanInclusion {
  title: string;
  description: string;
}

export const GLOBAL_PLAN_INCLUSIONS: GlobalPlanInclusion[] = [
  { title: '10 Free Domain Email Accounts', description: '10 free @yourdomain mailboxes per hosted site' },
  { title: 'Dedicated Isolated IP', description: 'Dedicated static IP for SEO, deliverability, and security' },
  { title: 'Hosted Cloud WAF & Spam Shield', description: 'Real-time firewall stopping malicious exploits at the edge' },
  { title: 'Automated Nightly Backups', description: 'Continuous snapshot backups with 1-click restore points' },
  { title: 'Daily Malware Scanning', description: 'Autonomous zero-trust security scans and integrity monitors' },
  { title: '24/7 Live Infrastructure Support', description: 'Direct Tier-1 server support handled by infrastructure engineers' },
  { title: '1-Click Staging & Sandbox', description: 'Test plugin updates and custom code before production' },
  { title: '7 Pro WordPress Plugins Included', description: 'Pre-installed enterprise speed, SEO, and security suite' },
  { title: 'Global Multi-Region Edge Network', description: 'High-speed edge routing across US, EU, and Asia-Pacific' },
];

export interface MarketPriceComparison {
  id: string;
  category: string;
  agencyCost2Yr: string;
  diyCost2Yr: string;
  compassPackageCost2Yr: string;
  totalClientSavings: string;
  dealHighlights: string[];
}

export const MARKET_PRICE_COMPARISONS: Record<string, MarketPriceComparison> = {
  solo_starter: {
    id: 'solo_starter',
    category: 'Solo Practice / Wellness & Trades (Bronze Tier)',
    agencyCost2Yr: '$4,500 - $6,500 ($3,500 build + $50-$125/mo hosting)',
    diyCost2Yr: '$2,400+ ($30/mo builder + $72/mo 10x Google Workspace + 40 hrs lost time)',
    compassPackageCost2Yr: '$1,650 Flat ($0 design fee, 24 mo cloud hosting & 10 emails)',
    totalClientSavings: 'Save $2,850 - $4,850 in cash + 40 hours of setup labor',
    dealHighlights: [
      'Zero upfront website design fee',
      '24 Months zero monthly overhead',
      '10 Custom @domain email mailboxes included',
      'Dedicated static IP & automated nightly backups',
    ],
  },
  professional: {
    id: 'professional',
    category: 'Mid-Tier Dental, Chiro & Veterinary (Silver Tier)',
    agencyCost2Yr: '$6,000 - $9,000 ($4,500 build + $75-$150/mo hosting)',
    diyCost2Yr: '$3,200+ (Builder subscriptions + third-party booking plugins + email)',
    compassPackageCost2Yr: '$2,650 Flat ($0 design fee, 24 mo cloud hosting & appointment portal)',
    totalClientSavings: 'Save $3,350 - $6,350 vs agency quotes',
    dealHighlights: [
      'Interactive appointment & intake booking engine',
      'Castle Walls WAF & honeypot spam protection',
      'Zero monthly bills for 24 calendar months',
      'Verified state board pass accreditation badge',
    ],
  },
  enterprise_legal_cpa: {
    id: 'enterprise_legal_cpa',
    category: 'Attorneys, CPAs & Wealth Advisors (Gold Tier)',
    agencyCost2Yr: '$8,500 - $14,000+ ($6,000+ custom legal build + $150/mo hosting)',
    diyCost2Yr: '$4,500+ (High-risk compliance gaps, unencrypted forms, DIY labor)',
    compassPackageCost2Yr: '$3,950 Flat ($0 design fee, 24 mo dedicated cloud hosting & portal)',
    totalClientSavings: 'Save $4,550 - $10,050 vs agency retainers',
    dealHighlights: [
      'Fiduciary client discovery vault & intake system',
      'Dedicated isolated IP & enterprise SSL encryption',
      '24 Months zero monthly overhead',
      'Full unencumbered domain lease-to-own equity',
    ],
  },
};

export const TURNKEY_SCOPE_GUARANTEE = {
  title: 'Turnkey Scope & Value Guarantee',
  tagline: 'Unmatched 2-Year Total Cost of Ownership (TCO)',
  blurb: 'If any certified digital agency provides a custom live practice website, 10 domain email accounts, a dedicated static IP, and 24 months of fully managed cloud hosting for less than our flat package rate, we will credit the difference in full.',
  whyOurDealIsBest: 'Our launch package completely eliminates the upfront $4,000 agency design fee and pauses all monthly hosting bills for your first 24 months. You receive a fully deployed practice website, 10 business email accounts, and enterprise server security for less than the cost of DIY software subscriptions alone.',
};

export interface W4HostingPlan {
  id: W4HostingTier;
  name: string;
  monthlyBaseRate: number;
  wholesaleMonthlyCost: number;
  hardwareSpecs: string;
  twoYearFlatPackagePrice: number;
  callerCommission: number;
  twoYearHostingCost: number;
  twoYearDomainCost: number;
  netConsultingProfit: number;
  domainBuyoutPrice: number;
  description: string;
  includedSuiteFeatures: string[];
}

export const W4_HOSTING_PLANS: Record<W4HostingTier, W4HostingPlan> = {
  quantum: {
    id: 'quantum',
    name: 'w4 Quantum',
    monthlyBaseRate: 14.99,
    wholesaleMonthlyCost: 4.0,
    hardwareSpecs: '1 vCPU • 512MB RAM • 10GB SSD',
    twoYearFlatPackagePrice: 1250,
    callerCommission: 300,
    twoYearHostingCost: 96.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 826.0,
    domainBuyoutPrice: 999,
    description: 'Personal WebTop deck with everyday productivity tools and gamified reward tracking.',
    includedSuiteFeatures: [
      'YouMeOS WebTop Desktop OS',
      'True North XP Gamification Engine',
      'Bug-Catching Net Visual QA Reporter',
      'Full Tesseract Protocol Framework',
      '24 Months Zero Monthly Overhead',
    ],
  },
  bronze: {
    id: 'bronze',
    name: 'w4 Bronze',
    monthlyBaseRate: 34.99,
    wholesaleMonthlyCost: 15.0,
    hardwareSpecs: '1 vCPU • 1GB RAM • 32GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 1650,
    callerCommission: 300,
    twoYearHostingCost: 360.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 962.0,
    domainBuyoutPrice: 999,
    description: 'Customer Relationship Management and marketing hub for local shops, solo practices, and trades.',
    includedSuiteFeatures: [
      'Questbook CRM Contact & Lead Capture',
      'Bomb Bag Email Marketing & Drip Sequences',
      'Automated Daily Data Safeguards',
      'Interactive Consultation Valuation Engine',
      '24 Months Zero Monthly Overhead',
    ],
  },
  silver: {
    id: 'silver',
    name: 'w4 Silver',
    monthlyBaseRate: 74.99,
    wholesaleMonthlyCost: 35.0,
    hardwareSpecs: '2 vCPU • 2GB RAM • 80GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 2650,
    callerCommission: 300,
    twoYearHostingCost: 840.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 1482.0,
    domainBuyoutPrice: 999,
    description: 'Visual automation recipes, browser CLI terminal, and honeypot security firewall.',
    includedSuiteFeatures: [
      'Magic Formula Visual Form & Trigger Recipes',
      'HoloShell Browser CLI & Live Telemetry',
      'Castle Walls WAF & Honeypot Shield',
      'Compass Multi-Service Scheduler',
      '24 Months Zero Monthly Overhead',
    ],
  },
  silver_enhanced: {
    id: 'silver_enhanced',
    name: 'w4 Silver Enhanced',
    monthlyBaseRate: 99.99,
    wholesaleMonthlyCost: 45.0,
    hardwareSpecs: '2 vCPU • 4GB RAM • 128GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 3250,
    callerCommission: 300,
    twoYearHostingCost: 1080.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 1842.0,
    domainBuyoutPrice: 999,
    description: 'Drag-and-drop page builder studio, digital retail Point-of-Sale checkout, and image optimization.',
    includedSuiteFeatures: [
      'Bazaar POS & Digital Retail Checkout',
      'Wizard\'s Tower Visual Page Studio',
      'Hummingbird Cache & Smush Pro Optimization',
      'Custom Domain SSL & DNS Vault',
      '24 Months Zero Monthly Overhead',
    ],
  },
  gold: {
    id: 'gold',
    name: 'w4 Gold',
    monthlyBaseRate: 129.99,
    wholesaleMonthlyCost: 60.0,
    hardwareSpecs: '4 vCPU • 8GB RAM • 160GB SSD (Dedicated Multi-Domain)',
    twoYearFlatPackagePrice: 3950,
    callerCommission: 300,
    twoYearHostingCost: 1440.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 2182.0,
    domainBuyoutPrice: 999,
    description: 'Multi-domain network management, multimedia broadcast channels, and automated SEO testing.',
    includedSuiteFeatures: [
      'Logos Multiverse Network Manager',
      'Helios Multimedia Broadcasting Studio',
      'Silver Arrow A/B Testing Engine',
      'Pegasus Boots & SmartCrawl Pro SEO',
      '24 Months Zero Monthly Overhead',
    ],
  },
  gold_enhanced: {
    id: 'gold_enhanced',
    name: 'w4 Gold Enhanced',
    monthlyBaseRate: 242.40,
    wholesaleMonthlyCost: 150.0,
    hardwareSpecs: '4 vCPU • 16GB RAM • 384GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 6950,
    callerCommission: 400,
    twoYearHostingCost: 3600.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 2922.0,
    domainBuyoutPrice: 999,
    description: 'Multi-model AI content generation pipeline, live business intelligence telemetry, and DB migration.',
    includedSuiteFeatures: [
      'Multi-Model AI Content Generation Pipeline',
      'Beehive Business Intelligence Analytics',
      'Competitor Audience Benchmarking',
      'Moving Castle Multisite DB Migration',
      '24 Months Zero Monthly Overhead',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'w4 Platinum',
    monthlyBaseRate: 299.0,
    wholesaleMonthlyCost: 120.0,
    hardwareSpecs: '6 vCPU • 16GB RAM • 320GB SSD (Multi-Agent AI)',
    twoYearFlatPackagePrice: 8500,
    callerCommission: 500,
    twoYearHostingCost: 2880.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 5092.0,
    domainBuyoutPrice: 999,
    description: 'Autonomous multi-agent AI network, bidirectional webhook gateway, and federated SSO client hub.',
    includedSuiteFeatures: [
      'Nexos Autonomous Multi-Agent AI Network',
      'Magic Hookshot Webhook Integration Gateway',
      'Agency Client Hub & Federated SSO Hub',
      'Dedicated Isolated IP & Custom Edge CDN',
      '24 Months Zero Monthly Overhead',
    ],
  },
  platinum_enhanced: {
    id: 'platinum_enhanced',
    name: 'w4 Platinum Enhanced',
    monthlyBaseRate: 420.42,
    wholesaleMonthlyCost: 200.0,
    hardwareSpecs: '6 vCPU • 24GB RAM • 448GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 12500,
    callerCommission: 500,
    twoYearHostingCost: 4800.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 7172.0,
    domainBuyoutPrice: 1299,
    description: 'Enterprise white-label branding engine, collective intelligence commons, and quadratic governance.',
    includedSuiteFeatures: [
      'Ultimate White-Label Branding Engine',
      'Noosphere Collective Intelligence Commons',
      'POLOS Fractal Quadratic Governance Vault',
      'Treasure Trove Real-Time Sovereign Valuation',
      '24 Months Zero Monthly Overhead',
    ],
  },
  uranium: {
    id: 'uranium',
    name: 'w4 Uranium',
    monthlyBaseRate: 650.0,
    wholesaleMonthlyCost: 300.0,
    hardwareSpecs: '8 vCPU • 32GB RAM • 512GB SSD (High-Frequency)',
    twoYearFlatPackagePrice: 18500,
    callerCommission: 500,
    twoYearHostingCost: 7200.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 10772.0,
    domainBuyoutPrice: 1499,
    description: 'Omni-Sovereign zero-trust infrastructure for enterprise e-commerce, financial institutions, and global agencies.',
    includedSuiteFeatures: [
      'Platinum Enhanced Suite Included',
      'Enterprise Regulatory Compliance Suite',
      'Real-Time Malicious Threat Shield (WAF)',
      'Zero-Downtime Staging & Sandbox Environment',
      'Multi-Network Sovereign Cluster',
    ],
  },
  titanium: {
    id: 'titanium',
    name: 'w4 Titanium',
    monthlyBaseRate: 1250.0,
    wholesaleMonthlyCost: 500.0,
    hardwareSpecs: '16 vCPU • 64GB RAM • 1280GB SSD (Auto-Scale)',
    twoYearFlatPackagePrice: 35000,
    callerCommission: 1000,
    twoYearHostingCost: 12000.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 21972.0,
    domainBuyoutPrice: 2499,
    description: 'Self-healing, auto-scaling high-availability cluster with deep kernel memory profiling.',
    includedSuiteFeatures: [
      'All Uranium Suite Features Included',
      'BlackBOX Deep Kernel & Memory Profiler',
      'Automated Extreme Traffic Auto-Scaler',
      'Self-Healing Daemon Failover Architecture',
      '24 Months Zero Monthly Overhead',
    ],
  },
  palladium: {
    id: 'palladium',
    name: 'w4 Palladium',
    monthlyBaseRate: 2499.0,
    wholesaleMonthlyCost: 800.0,
    hardwareSpecs: '24 vCPU • 96GB RAM • 1600GB SSD (Global Matrix)',
    twoYearFlatPackagePrice: 69500,
    callerCommission: 2500,
    twoYearHostingCost: 19200.0,
    twoYearDomainCost: 28.0,
    netConsultingProfit: 47772.0,
    domainBuyoutPrice: 4999,
    description: 'Omni-Sovereign global core network matrix, multi-region sync, and dedicated Principal Systems retainer.',
    includedSuiteFeatures: [
      'All Titanium Suite Features Included',
      'Omni-Sovereign Global Core Matrix API',
      'Instant Multi-Region Global Data Sync',
      '20h Monthly Principal Systems Retainer',
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
  templateTheme?: 'executive_dark' | 'clinical_light';
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
  professionTitle: string;
  state: string;
  city: string;
  licenseNumber: string;
  issueDate: string;
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

  // CRM & Bomb Bag Sync tracking
  crmContactId?: number;
  crmSyncedAt?: string;
  bombBagSubscriberId?: number;
  bombBagSyncedAt?: string;
  bombBagListId?: number;
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
