import type { Lead } from '../types/lead';
import { normalizeLegacyLeads } from './legacy-lead-claims';

export type CrmWebhookEvent =
  | 'lead.created'
  | 'lead.skiptraced'
  | 'lead.outreach_sent'
  | 'lead.site_pitch'
  | 'batch.export'
  | 'leads.bulk_synced';

export interface CrmWebhookResult {
  success: boolean;
  message: string;
  /** True when the server holds no CRM Webhook URL connector value yet. */
  notConfigured?: boolean;
}

/**
 * The CRM webhook URL is a bearer credential, so it lives in the WordPress Connectors API
 * (`crm_webhook_url`) and only the server POSTs to it. The browser sends the lead payload to
 * this route and never sees, stores or sends the URL.
 */
const CRM_WEBHOOK_PATH = '/xophz-freshmints/v1/crm/webhook';
const CRM_WEBHOOK_NOT_CONFIGURED_CODE = 'freshmints_crm_webhook_not_configured';
const CRM_WEBHOOK_SENT_MESSAGE = 'Payload synced to the connected CRM webhook.';

const readJsonObject = async (response: Response): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await response.json();
    const isObject = typeof body === 'object' && body !== null;
    return isObject ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const stringField = (body: Record<string, unknown>, name: string): string => {
  const value = body[name];
  return typeof value === 'string' ? value : '';
};

export class CRMExportService {
  /**
   * 1-Click Sync single lead directly into Questbook CRM via WP REST API
   */
  public static async syncToQuestbook(lead: Lead): Promise<{ success: boolean; message: string; contactId?: number }> {
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/crm/sync`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ lead }),
      });

      if (!res.ok) {
        throw new Error(`Questbook sync returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: data.success || true,
        message: data.crmMessage || `Successfully synced ${lead.fullName} into Questbook CRM.`,
        contactId: data.contactId,
      };
    } catch (error: any) {
      console.warn('Questbook CRM sync error:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync to Questbook CRM.',
      };
    }
  }

  /**
   * Navigate to Questbook CRM Directory or Contact Detail Record
   */
  public static openQuestbookRecord(contactId?: number): void {
    const adminBase = '/wp-admin/admin.php?page=xophz-compass';
    const targetHash = contactId ? `#/questbook/profile/${contactId}` : '#/questbook/directory';
    const fullUrl = `${adminBase}${targetHash}`;

    // If loaded inside COMPASS iframe or parent window context
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
   * Convert array of Lead records to downloadable CSV file
   */
  public static exportToCSV(leads: Lead[], filename = `fresh_mints_leads_${new Date().toISOString().split('T')[0]}.csv`): void {
    if (!leads || leads.length === 0) return;

    const headers = [
      'ID',
      'Full Name',
      'Profession',
      'Profession Title',
      'State',
      'City',
      'License Number',
      'Issue Date',
      'College / Board School',
      'Graduation Year',
      'License Status',
      'Skip Trace Status',
      'Verified Phone',
      'Phone Type',
      'Primary Email',
      'LinkedIn URL',
      'Instagram Handle',
      'Current Address',
      'DNC Status',
      'Outreach Status',
      'Estimated Value ($)',
      'Created At',
    ];

    // A lead saved by an older build can still hold a DNC clearance or carrier check no lookup produced.
    const rows = normalizeLegacyLeads(leads).leads.map((lead) => [
      lead.id,
      this.escapeCSV(lead.fullName),
      lead.profession,
      this.escapeCSV(lead.professionTitle),
      lead.state,
      this.escapeCSV(lead.city),
      lead.licenseNumber,
      lead.issueDate,
      this.escapeCSV(lead.collegeOrSchool),
      lead.graduationYear,
      lead.licenseStatus,
      lead.skipTraceStatus,
      lead.skipTraceData?.verifiedPhone || '',
      lead.skipTraceData?.phoneType || '',
      lead.skipTraceData?.primaryEmail || '',
      lead.skipTraceData?.linkedInUrl || '',
      lead.skipTraceData?.instagramHandle || '',
      this.escapeCSV(lead.skipTraceData?.currentAddress || ''),
      lead.skipTraceData?.dncStatus || '',
      lead.outreachStatus,
      lead.estimatedDealValue,
      lead.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Parse user-uploaded CSV file content into standard Lead models
   */
  public static parseCSV(csvText: string): Partial<Lead>[] {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const parsedLeads: Partial<Lead>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length < 2) continue;

      const rowMap: Record<string, string> = {};
      headers.forEach((h, index) => {
        rowMap[h] = values[index] ? values[index].trim() : '';
      });

      const fullName = rowMap['full name'] || rowMap['fullname'] || rowMap['name'] || '';
      if (!fullName) {
        continue;
      }
      const state = rowMap['state'] || '';
      const city = rowMap['city'] || '';
      const licenseNumber = rowMap['license number'] || rowMap['licensenumber'] || '';

      parsedLeads.push({
        id: `imported-${Date.now()}-${i}`,
        fullName,
        profession: (rowMap['profession'] as any) || 'real_estate',
        professionTitle: rowMap['profession title'] || rowMap['title'] || 'Licensed Professional',
        state,
        city,
        licenseNumber,
        issueDate: rowMap['issue date'] || new Date().toISOString().split('T')[0],
        collegeOrSchool: rowMap['college / board school'] || rowMap['school'] || '',
        graduationYear: 2026,
        licenseStatus: 'Newly Issued',
        skipTraceStatus: rowMap['verified phone'] || rowMap['primary email'] ? 'Traced' : 'Not Traced',
        skipTraceData: rowMap['verified phone'] || rowMap['primary email'] ? {
          tracedAt: new Date().toISOString().split('T')[0],
          verifiedPhone: rowMap['verified phone'] || '',
          phoneSource: rowMap['verified phone'] ? 'CSV import' : undefined,
          // A CSV without these columns says nothing about line type or DNC status: never claim either.
          phoneType: rowMap['phone type'] || 'Unknown',
          dncStatus: rowMap['dnc status'] || 'Unknown',
          primaryEmail: rowMap['primary email'] || '',
          emailValidation: 'Unverified',
          linkedInUrl: rowMap['linkedin url'] || '',
          instagramHandle: rowMap['instagram handle'] || '',
          currentAddress: rowMap['current address'] || '',
          enrichmentNotes: 'Imported via CSV record',
        } : undefined,
        outreachStatus: 'Uncontacted',
        outreachLogs: [],
        estimatedDealValue: 1650,
        createdAt: new Date().toISOString(),
      });
    }

    return parsedLeads;
  }

  /**
   * Ask the server to relay a lead, or a list of leads, to the CRM webhook (Zapier, Make.com,
   * HubSpot, GoHighLevel) held in the `crm_webhook_url` connector.
   */
  public static async postWebhook(
    event: CrmWebhookEvent,
    leadOrLeads: Lead | Lead[]
  ): Promise<CrmWebhookResult> {
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}${CRM_WEBHOOK_PATH}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ event, data: leadOrLeads }),
      });

      const body = await readJsonObject(res);
      if (res.ok) {
        return { success: true, message: stringField(body, 'message') || CRM_WEBHOOK_SENT_MESSAGE };
      }

      const notConfigured = stringField(body, 'code') === CRM_WEBHOOK_NOT_CONFIGURED_CODE;
      const serverMessage = stringField(body, 'message');
      return {
        success: false,
        message: serverMessage || `The server answered HTTP ${res.status}.`,
        ...(notConfigured ? { notConfigured } : {}),
      };
    } catch (error: any) {
      console.warn('CRM Webhook error:', error);
      return { success: false, message: error.message || 'Failed to post webhook' };
    }
  }

  private static escapeCSV(str?: string): string {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.replace(/^"|"$/g, ''));
    return result;
  }
}
