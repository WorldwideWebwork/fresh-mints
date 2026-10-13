import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Lead, SkipTraceResult } from '../types/lead';
import { CRMExportService } from './crm-export-service';

const WEBHOOK_ROUTE = 'http://mycompass/wp-json/xophz-freshmints/v1/crm/webhook';

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const makeLead = (overrides: Partial<Lead> = {}): Lead =>
  ({
    id: 'lead-1',
    fullName: 'Test Person',
    profession: 'real_estate',
    professionTitle: 'Licensed Professional',
    state: 'NY',
    city: 'Albany',
    licenseNumber: 'L-100',
    issueDate: '2026-10-01',
    collegeOrSchool: '',
    graduationYear: 2026,
    licenseStatus: 'Newly Issued',
    skipTraceStatus: 'Not Traced',
    outreachStatus: 'Uncontacted',
    outreachLogs: [],
    estimatedDealValue: 1650,
    createdAt: '2026-10-09T12:00:00.000Z',
    ...overrides,
  }) as Lead;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('window', {
    wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' },
  });
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('CRMExportService.postWebhook', () => {
  it('posts the lead to the server route with the REST nonce, never to a webhook URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, message: 'Payload synced.', status: 200 }));
    const lead = makeLead();

    const result = await CRMExportService.postWebhook('lead.created', lead);

    expect(result).toEqual({ success: true, message: 'Payload synced.' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe(WEBHOOK_ROUTE);
    expect(init.method).toBe('POST');
    expect(init.headers['X-WP-Nonce']).toBe('nonce-123');
    expect(JSON.parse(init.body)).toEqual({ event: 'lead.created', data: lead });
  });

  it('sends a list of leads as a list', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));
    const leads = [makeLead({ id: 'a' }), makeLead({ id: 'b' })];

    await CRMExportService.postWebhook('batch.export', leads);

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).data).toHaveLength(2);
  });

  it('falls back to a default success message when the server sends none', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));

    const result = await CRMExportService.postWebhook('lead.created', makeLead());

    expect(result.success).toBe(true);
    expect(result.message).toBe('Payload synced to the connected CRM webhook.');
  });

  it('reports an explicit not-configured outcome when no CRM Webhook URL connector value exists', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          code: 'freshmints_crm_webhook_not_configured',
          message: 'No CRM webhook is configured. Add the CRM Webhook URL under Settings > Connectors.',
          data: { status: 400, connector: 'crm_webhook_url' },
        },
        400,
      ),
    );

    const result = await CRMExportService.postWebhook('lead.created', makeLead());

    expect(result.success).toBe(false);
    expect(result.notConfigured).toBe(true);
    expect(result.message).toContain('Settings > Connectors');
  });

  it('surfaces the server message on a relay failure without calling it not-configured', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { code: 'freshmints_crm_webhook_rejected', message: 'The CRM webhook responded with HTTP 500.' },
        502,
      ),
    );

    const result = await CRMExportService.postWebhook('lead.created', makeLead());

    expect(result).toEqual({ success: false, message: 'The CRM webhook responded with HTTP 500.' });
  });

  it('names the HTTP status when the failure body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

    const result = await CRMExportService.postWebhook('lead.created', makeLead());

    expect(result).toEqual({ success: false, message: 'The server answered HTTP 502.' });
  });

  it('returns a failure when the request itself fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network down'));

    const result = await CRMExportService.postWebhook('lead.created', makeLead());

    expect(result).toEqual({ success: false, message: 'Network down' });
  });

  it('has no URL parameter to take: the only fetch target is the same-site route', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));

    await CRMExportService.postWebhook('lead.created', makeLead());

    expect(CRMExportService.postWebhook.length).toBe(2);
    const targets = fetchMock.mock.calls.map(([endpoint]) => String(endpoint));
    expect(targets.every((target) => target === WEBHOOK_ROUTE)).toBe(true);
  });
});

const CSV_HEADER_NO_COMPLIANCE_COLUMNS = 'Full Name,State,City,Verified Phone,Primary Email';
const CSV_HEADER_WITH_COMPLIANCE_COLUMNS = `${CSV_HEADER_NO_COMPLIANCE_COLUMNS},Phone Type,DNC Status`;
const INVENTED_CLAIM = /mobile|carrier|verified|clean|not on dnc|cleared|safe/i;

describe('CRMExportService.parseCSV compliance defaults', () => {
  it('marks phone type and DNC status Unknown when the CSV has no such columns', () => {
    const [lead] = CRMExportService.parseCSV(
      `${CSV_HEADER_NO_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,phone-from-csv,`,
    );

    expect(lead.skipTraceData?.verifiedPhone).toBe('phone-from-csv');
    expect(lead.skipTraceData?.phoneSource).toBe('CSV import');
    expect(lead.skipTraceData?.phoneType).toBe('Unknown');
    expect(lead.skipTraceData?.dncStatus).toBe('Unknown');
  });

  it('never claims a carrier check or a DNC clearance the CSV did not supply', () => {
    const [lead] = CRMExportService.parseCSV(
      `${CSV_HEADER_NO_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,phone-from-csv,`,
    );

    expect(lead.skipTraceData?.phoneType).not.toMatch(INVENTED_CLAIM);
    expect(lead.skipTraceData?.dncStatus).not.toMatch(INVENTED_CLAIM);
  });

  it('treats blank phone type and DNC cells as Unknown', () => {
    const [lead] = CRMExportService.parseCSV(
      `${CSV_HEADER_WITH_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,phone-from-csv,,,`,
    );

    expect(lead.skipTraceData?.phoneType).toBe('Unknown');
    expect(lead.skipTraceData?.dncStatus).toBe('Unknown');
  });

  it('keeps the phone type and DNC status the CSV supplies', () => {
    const [lead] = CRMExportService.parseCSV(
      `${CSV_HEADER_WITH_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,phone-from-csv,,Landline,On DNC List`,
    );

    expect(lead.skipTraceData?.phoneType).toBe('Landline');
    expect(lead.skipTraceData?.dncStatus).toBe('On DNC List');
  });

  it('creates no trace data for a row with neither phone nor email', () => {
    const [lead] = CRMExportService.parseCSV(
      `${CSV_HEADER_NO_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,,`,
    );

    expect(lead.skipTraceData).toBeUndefined();
    expect(lead.skipTraceStatus).toBe('Not Traced');
  });
});

describe('CRMExportService.exportToCSV compliance columns', () => {
  const exportedCsv = async (leads: Lead[]): Promise<string> => {
    let exported: Blob | undefined;
    vi.stubGlobal('URL', {
      createObjectURL: (blob: Blob) => {
        exported = blob;
        return 'blob:test';
      },
    });
    vi.stubGlobal('document', {
      createElement: () => ({ setAttribute: () => undefined, click: () => undefined, style: {} }),
      body: { appendChild: () => undefined, removeChild: () => undefined },
    });

    CRMExportService.exportToCSV(leads, 'test.csv');
    return exported ? exported.text() : '';
  };

  it('exports an imported Unknown phone type and DNC status as Unknown, never as clean', async () => {
    const [imported] = CRMExportService.parseCSV(
      `${CSV_HEADER_NO_COMPLIANCE_COLUMNS}\nTest Person,NY,Albany,phone-from-csv,`,
    );

    const csv = await exportedCsv([makeLead(imported as Partial<Lead>)]);
    const [header, row] = csv.split('\n');
    const columns = header.split(',');
    const cells = row.split(',');

    expect(cells[columns.indexOf('Phone Type')]).toBe('Unknown');
    expect(cells[columns.indexOf('DNC Status')]).toBe('Unknown');
    expect(csv).not.toMatch(/Carrier Verified|Not on DNC List/);
  });

  const legacyTrace: SkipTraceResult = {
    verifiedPhone: 'phone-on-file',
    phoneType: 'Mobile (Carrier Verified)',
    phoneSource: 'Google Places',
    confidenceScore: 98,
    dncStatus: 'Clean - Not on DNC List',
    primaryEmail: 'email-on-file',
    emailValidation: 'Website Scraped & Verified',
    currentAddress: 'Albany',
    enrichmentNotes: '',
  };
  const columnsOf = (csv: string): Record<string, string> => {
    const [header, row] = csv.split('\n');
    const cells = row.split(',');
    return Object.fromEntries(header.split(',').map((name, index) => [name, cells[index]]));
  };

  it('exports a lead saved by an older build with Unknown, not its stored clearance or carrier check', async () => {
    const legacyLead = makeLead({ skipTraceStatus: 'Traced', skipTraceData: legacyTrace });

    const csv = await exportedCsv([legacyLead]);
    const exported = columnsOf(csv);

    expect(exported['Phone Type']).toBe('Unknown');
    expect(exported['DNC Status']).toBe('Unknown');
    expect(exported['Verified Phone']).toBe('phone-on-file');
    expect(csv).not.toMatch(/Carrier Verified|Not on DNC List|Public (Business )?Directory/);
  });

  it('also exports the stored public-directory label as Unknown', async () => {
    const csv = await exportedCsv([
      makeLead({ skipTraceStatus: 'Traced', skipTraceData: { ...legacyTrace, dncStatus: 'Public Business Directory' } }),
    ]);

    expect(columnsOf(csv)['DNC Status']).toBe('Unknown');
  });

  it('leaves the stored lead as it was; only the exported copy is normalized', async () => {
    const legacyLead = makeLead({ skipTraceStatus: 'Traced', skipTraceData: legacyTrace });

    await exportedCsv([legacyLead]);

    expect(legacyLead.skipTraceData?.dncStatus).toBe('Clean - Not on DNC List');
    expect(legacyLead.skipTraceData?.phoneType).toBe('Mobile (Carrier Verified)');
  });

  it('exports a real phone type and DNC status exactly as stored', async () => {
    const csv = await exportedCsv([
      makeLead({
        skipTraceStatus: 'Traced',
        skipTraceData: { ...legacyTrace, phoneType: 'Landline', dncStatus: 'On DNC List' },
      }),
    ]);
    const exported = columnsOf(csv);

    expect(exported['Phone Type']).toBe('Landline');
    expect(exported['DNC Status']).toBe('On DNC List');
  });
});
