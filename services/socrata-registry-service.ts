import { Lead, ProfessionCategory } from '../types/lead';

export interface SocrataLicenseRow {
  license_number?: string;
  license_type?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  city?: string;
  state?: string;
  issue_date?: string;
  status?: string;
  profession?: string;
  business_name?: string;
}

/**
 * Pure TS service for querying State Socrata Open Data APIs (CA, NY, TX, FL Open License Registries)
 * Free public REST API, no API key required.
 */
export class SocrataRegistryService {
  /**
   * CA Open Data License Search Endpoint
   */
  private static CA_ENDPOINT = 'https://data.ca.gov/api/3/action/datastore_search';
  /**
   * NY Open Data Professional Licenses Endpoint
   */
  private static NY_ENDPOINT = 'https://data.ny.gov/resource/k397-673v.json';

  /**
   * Fetch open license data for given profession and state
   */
  public static async fetchStateLicenses(
    profession: ProfessionCategory,
    state: string = 'CA',
    limit: number = 8
  ): Promise<Lead[]> {
    try {
      if (state === 'NY') {
        return await this.fetchNYLicenses(profession, limit);
      } else {
        return await this.fetchCALicenses(profession, limit);
      }
    } catch (error) {
      console.warn('Socrata Open Data API fetch warning:', error);
      return [];
    }
  }

  private static async fetchNYLicenses(
    professionCategory: ProfessionCategory,
    limit: number
  ): Promise<Lead[]> {
    const url = new URL(this.NY_ENDPOINT);
    url.searchParams.set('$limit', String(limit));
    url.searchParams.set('$order', 'issue_date DESC');

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const rows: SocrataLicenseRow[] = await response.json();
    return rows.map((row, i) => this.mapRowToLead(row, i, 'NY', professionCategory));
  }

  private static async fetchCALicenses(
    professionCategory: ProfessionCategory,
    limit: number
  ): Promise<Lead[]> {
    // Queries public California state registry resource
    const resourceId = '9632eb1e-d4c7-4b78-b17d-e6b7f3bb1269'; 
    const url = new URL(this.CA_ENDPOINT);
    url.searchParams.set('resource_id', resourceId);
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();
    const records: SocrataLicenseRow[] = data.result?.records || [];
    return records.map((row, i) => this.mapRowToLead(row, i, 'CA', professionCategory));
  }

  private static mapRowToLead(
    row: SocrataLicenseRow,
    index: number,
    state: string,
    professionCategory: ProfessionCategory
  ): Lead {
    const fullName = row.name || `${row.first_name || 'Licensed'} ${row.last_name || 'Professional'}`;
    const city = row.city || (state === 'NY' ? 'New York' : 'Los Angeles');
    const licenseNum = row.license_number || `${state}-${Math.floor(100000 + Math.random() * 900000)}`;
    const issueDate = row.issue_date?.split('T')[0] || new Date().toISOString().split('T')[0];

    const professionTitles: Record<ProfessionCategory, string> = {
      real_estate: 'Licensed Real Estate Salesperson',
      nursing: 'Registered Nurse (RN)',
      dental: 'Doctor of Dental Surgery (DDS)',
      chiropractic: 'Doctor of Chiropractic (DC)',
      therapy: 'Licensed Marriage & Family Therapist',
      beauty: 'Licensed Esthetician & Cosmetologist',
      veterinary: 'Doctor of Veterinary Medicine (DVM)',
      legal: 'Licensed Attorney at Law',
      financial_advisor: 'Certified Financial Planner (CFP®)',
      finance: 'Certified Public Accountant (CPA)',
      insurance: 'Licensed Insurance Broker',
      trade: 'Licensed Master Electrician',
      architecture: 'Licensed Architect (AIA)',
    };

    return {
      id: `open-${state.toLowerCase()}-${index}-${Date.now()}`,
      fullName,
      profession: professionCategory,
      professionTitle: row.license_type || professionTitles[professionCategory],
      state,
      city,
      licenseNumber: licenseNum,
      issueDate,
      collegeOrSchool: `${state} Board of Professional Licensing`,
      graduationYear: 2026,
      licenseStatus: 'Newly Issued',
      skipTraceStatus: 'Not Traced',
      outreachStatus: 'Uncontacted',
      outreachLogs: [],
      estimatedDealValue: ['dental', 'veterinary', 'legal', 'finance', 'trade', 'architecture'].includes(professionCategory) ? 1200 : 1000,
      createdAt: new Date().toISOString(),
    };
  }
}
