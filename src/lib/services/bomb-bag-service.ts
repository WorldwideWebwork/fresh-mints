import type { Lead } from '../types/lead';

export interface BombBagList {
  id: number;
  name: string;
  description: string;
  subscriber_count: number;
}

export interface BombBagSyncResult {
  success: boolean;
  message: string;
  syncedCount?: number;
  subscriberId?: number;
  listId?: number;
  action?: 'created' | 'updated';
  results?: Array<{
    leadId: string;
    subscriberId: number;
    listId: number;
    action: string;
    email: string;
    previewSlug: string;
  }>;
}

export class BombBagService {
  /**
   * 1-Click Sync single lead directly into Bomb Bag Marketing & Journeys
   */
  public static async syncToBombBag(lead: Lead, listId?: number, tags: string[] = []): Promise<BombBagSyncResult> {
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/bomb-bag/sync`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          lead,
          listId,
          tags,
        }),
      });

      if (!res.ok) {
        throw new Error(`Bomb Bag sync returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: data.success || true,
        message: data.message || `Successfully synced ${lead.fullName} into Bomb Bag Marketing.`,
        subscriberId: data.subscriberId,
        listId: data.results?.[0]?.listId,
        action: data.results?.[0]?.action as any,
        results: data.results,
      };
    } catch (error: any) {
      console.warn('Bomb Bag sync error:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync to Bomb Bag Marketing.',
      };
    }
  }

  /**
   * Bulk Sync multiple leads into Bomb Bag Marketing
   */
  public static async syncBatchToBombBag(leads: Lead[], listId?: number): Promise<BombBagSyncResult> {
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/bomb-bag/sync`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          leads,
          listId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Bomb Bag batch sync returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: data.success || true,
        message: data.message || `Successfully synced ${leads.length} leads into Bomb Bag.`,
        syncedCount: data.syncedCount || leads.length,
        results: data.results,
      };
    } catch (error: any) {
      console.warn('Bomb Bag batch sync error:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync batch to Bomb Bag.',
      };
    }
  }

  /**
   * Fetch available Bomb Bag subscriber lists for assignment
   */
  public static async getLists(): Promise<BombBagList[]> {
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/bomb-bag/lists`;

      const res = await fetch(endpoint, {
        headers: {
          'X-WP-Nonce': nonce,
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      return data.lists || [];
    } catch (err) {
      console.warn('Could not retrieve Bomb Bag lists', err);
      return [];
    }
  }

  /**
   * Open Bomb Bag subscriber or journey in COMPASS
   */
  public static openBombBagSubscriber(subscriberId?: number): void {
    const adminBase = '/wp-admin/admin.php?page=xophz-compass';
    const targetHash = subscriberId ? `#/bomb-bag/subscribers?id=${subscriberId}` : '#/bomb-bag/subscribers';
    const fullUrl = `${adminBase}${targetHash}`;

    if (window.top && window.top !== window) {
      try {
        window.top.location.hash = targetHash.replace(/^#/, '');
        return;
      } catch (e) {
        // Cross-origin fallback
      }
    }
    window.open(fullUrl, '_blank');
  }

  /**
   * Open Bomb Bag Email Campaign Composer or Journeys canvas
   */
  public static openBombBagComposer(lead?: Lead): void {
    const adminBase = '/wp-admin/admin.php?page=xophz-compass';
    const targetHash = lead ? `#/bomb-bag/campaigns/new?lead=${encodeURIComponent(lead.id)}` : '#/bomb-bag/campaigns/new';
    const fullUrl = `${adminBase}${targetHash}`;

    if (window.top && window.top !== window) {
      try {
        window.top.location.hash = targetHash.replace(/^#/, '');
        return;
      } catch (e) {
        // Fallback
      }
    }
    window.open(fullUrl, '_blank');
  }
}
