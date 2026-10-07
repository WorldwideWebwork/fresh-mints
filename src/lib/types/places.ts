import type { ProfessionCategory } from './profession';
import type {
  LicenseStatus,
  OutreachStatus,
  SkipTraceResult,
  SkipTraceStatus,
  WebsitePreviewConfig,
} from './lead';

export type GooglePlacesWebsiteStatus = 'missing' | 'directory_only' | 'has_website';

export interface GooglePlaceBusiness {
  id: string;
  placeId: string;
  fullName: string;
  businessName: string;
  phone?: string;
  internationalPhone?: string;
  profession: ProfessionCategory;
  professionTitle: string;
  state: string;
  city: string;
  licenseNumber: string;
  collegeOrSchool: string;
  graduationYear: number;
  issueDate: string;
  licenseStatus: LicenseStatus;
  skipTraceStatus: SkipTraceStatus;
  skipTraceData?: SkipTraceResult;
  outreachStatus: OutreachStatus;
  website: string;
  hasWebsite: boolean;
  websiteStatus: GooglePlacesWebsiteStatus;
  websiteSummary: string;
  rating: number;
  userRatingsTotal: number;
  googleMapsUrl: string;
  formattedAddress: string;
  websiteConfig?: WebsitePreviewConfig;
  estimatedDealValue: number;
  createdAt: string;
}

export interface GooglePlacesSearchParams {
  query?: string;
  keyword?: string;
  profession?: ProfessionCategory;
  city?: string;
  state?: string;
  filterNoWebsite?: boolean;
  minRating?: number;
  minReviews?: number;
  pagetoken?: string;
  limit?: number;
}

export interface GooglePlacesSearchResponse {
  success: boolean;
  query: string;
  totalQueried: number;
  totalReturned: number;
  noWebsiteCount: number;
  directoryOnlyCount: number;
  hasWebsiteCount: number;
  strikeRatePercentage: number;
  potentialPipelineValue: number;
  nextPageToken?: string | null;
  leads: GooglePlaceBusiness[];
}
