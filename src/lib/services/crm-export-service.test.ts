import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Lead } from '../types/lead';
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
