import type { ProfessionCategory } from './profession';
import type { LeadSource, SocialLeadContext } from './social';

// Domain capsules split out of this file. Re-exported so existing imports of
// '$lib/types/lead' (or its relative equivalents) keep resolving unchanged.
export type { ProfessionCategory, ProfessionMetadata } from './profession';
export { PROFESSION_CONFIGS, getProfessionConfig, getLeadDealValue } from './profession';
export type { W4HostingTier, W4HostingPlan, GlobalPlanInclusion, MarketPriceComparison } from './hosting';
export {
  W4_HOSTING_PLANS,
  GLOBAL_PLAN_INCLUSIONS,
  MARKET_PRICE_COMPARISONS,
  TURNKEY_SCOPE_GUARANTEE,
} from './hosting';
export type { LeadSource, SocialLeadContext } from './social';
export type {
  GooglePlaceBusiness,
  GooglePlacesSearchParams,
  GooglePlacesSearchResponse,
  GooglePlacesWebsiteStatus,
} from './places';

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
  websiteUrl?: string;
  extractedEmails?: string[];
  extractedPhones?: string[];
  emailPermutations?: string[];
  mxValid?: boolean;
  mxRecords?: string[];
  schemaOrgData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    type?: string;
  };
  socialProfiles?: string[];
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

/**
 * Canonical input for deriving a default website preview.
 *
 * Deliberately a structural subset of `Lead`, using the same field names, so a
 * whole `Lead` (or any Lead-shaped record) can be passed straight through
 * without destructuring at the call site. Keep these names in sync with `Lead`.
 */
export interface WebsiteConfigSeed {
  fullName: string;
  profession: ProfessionCategory;
  city: string;
  state: string;
  collegeOrSchool: string;
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
  extractedEmails?: string[];
  extractedPhones?: string[];
  emailPermutations?: string[];
  mxValid?: boolean;
  mxRecords?: string[];
  schemaOrgData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    type?: string;
  };
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

  // Source & Social Intent Context
  leadSource?: LeadSource;
  socialContext?: SocialLeadContext;

  // Notes & tracking
  estimatedDealValue: number;
  notes?: string;
  createdAt: string;

  // Rep attribution & commission bounty tracking
  assignedRep?: string;
  closedByRep?: string;
  closedAt?: string;

  // CRM & Bomb Bag Sync tracking
  crmContactId?: number;
  crmSyncedAt?: string;
  bombBagSubscriberId?: number;
  bombBagSyncedAt?: string;
  bombBagListId?: number;
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
