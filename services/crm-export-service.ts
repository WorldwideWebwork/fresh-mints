import { Lead } from '../types/lead';

export interface WebhookPayload {
  event: 'lead.created' | 'lead.skiptraced' | 'lead.outreach_sent' | 'lead.site_pitch' | 'batch.export' | 'leads.bulk_synced';
  timestamp: string;
  count: number;
  data: any;
  source: string;
}

/**
 * Encapsulated Pure TS Service for CRM Data Portability & Webhook Sync
 * Compatible with HubSpot, Salesforce, GoHighLevel, ActiveCampaign, Zapier, Make.com, etc.
 */
export class CRMExportService {
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

    const rows = leads.map((lead) => [
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

      const fullName = rowMap['full name'] || rowMap['fullname'] || rowMap['name'] || 'Imported Lead';
      const state = rowMap['state'] || 'CA';
      const city = rowMap['city'] || 'Metropolis';
      const licenseNumber = rowMap['license number'] || rowMap['licensenumber'] || `LIC-${Math.floor(100000 + Math.random() * 900000)}`;

      parsedLeads.push({
        id: `imported-${Date.now()}-${i}`,
        fullName,
        profession: (rowMap['profession'] as any) || 'real_estate',
        professionTitle: rowMap['profession title'] || rowMap['title'] || 'Licensed Professional',
        state,
        city,
        licenseNumber,
        issueDate: rowMap['issue date'] || new Date().toISOString().split('T')[0],
        collegeOrSchool: rowMap['college / board school'] || rowMap['school'] || `${state} Licensing Board`,
        graduationYear: 2026,
        licenseStatus: 'Newly Issued',
        skipTraceStatus: rowMap['verified phone'] || rowMap['primary email'] ? 'Traced' : 'Not Traced',
        skipTraceData: rowMap['verified phone'] || rowMap['primary email'] ? {
          tracedAt: new Date().toISOString().split('T')[0],
          confidenceScore: 95,
          verifiedPhone: rowMap['verified phone'] || '',
          phoneType: rowMap['phone type'] || 'Mobile (Carrier Verified)',
          dncStatus: rowMap['dnc status'] || 'Clean - Not on DNC List',
          primaryEmail: rowMap['primary email'] || '',
          emailValidation: 'Valid & Deliverable (98% Score)',
          linkedInUrl: rowMap['linkedin url'] || '',
          instagramHandle: rowMap['instagram handle'] || '',
          currentAddress: rowMap['current address'] || '',
          enrichmentNotes: 'Imported via CSV record',
        } : undefined,
        outreachStatus: 'Uncontacted',
        outreachLogs: [],
        estimatedDealValue: 499,
        createdAt: new Date().toISOString(),
      });
    }

    return parsedLeads;
  }

  /**
   * Send single lead to external webhook (Zapier, Make.com, HubSpot, GoHighLevel)
   */
  public static async postWebhook(
    webhookUrl: string,
    event: WebhookPayload['event'],
    leadOrLeads: Lead | Lead[]
  ): Promise<{ success: boolean; message: string }> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      return { success: false, message: 'Invalid Webhook URL. Must start with http:// or https://' };
    }

    try {
      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        count: Array.isArray(leadOrLeads) ? leadOrLeads.length : 1,
        data: leadOrLeads,
        source: 'Licensify Lead Hunter App',
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`CRM Webhook endpoint returned HTTP ${res.status}`);
      }

      return { success: true, message: `Successfully synced payload to ${webhookUrl}` };
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
