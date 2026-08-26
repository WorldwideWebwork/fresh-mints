import { Lead, ProfessionCategory } from '../types/lead';

export interface LiveRegistryQueryOptions {
  profession: ProfessionCategory;
  state: string;
  searchQuery?: string;
  limit?: number;
}

export interface LiveRegistryResult {
  source: 'NPPES Federal Registry' | 'State Socrata Open Data' | 'Gemini Search Grounding' | 'Combined Open Sources';
  totalFound: number;
  leads: Lead[];
  groundingNotes?: string;
}

/**
 * Pure TS Live Registry Engine
 * Encapsulates search and normalization across free public open data APIs via server proxy.
 */
export class LiveRegistryEngine {
  /**
   * Primary entry point to fetch real live graduate leads from open data APIs via server proxy
   */
  public static async queryLiveGraduates(
    options: LiveRegistryQueryOptions
  ): Promise<LiveRegistryResult> {
    try {
      const response = await fetch('/api/registry/fetch-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Server endpoint error (HTTP ${response.status})`);
      }

      const data = await response.json();
      return {
        source: data.source || 'Combined Open Sources',
        totalFound: data.leads?.length || 0,
        leads: data.leads || [],
        groundingNotes: data.groundingNotes || 'Live records retrieved via open public APIs.',
      };
    } catch (error) {
      console.warn('Live registry server fetch warning:', error);
      return {
        source: 'Combined Open Sources',
        totalFound: 0,
        leads: [],
        groundingNotes: 'Unable to reach live registry API at this time.',
      };
    }
  }
}

