import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBillableExport, fetchPilotReport } from './pilot-report-service';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fetchMock = vi.fn();

const reportBody = {
  month: '2026-10',
  range: { from: '2026-10-01T00:00:00+00:00', to: '2026-11-01T00:00:00+00:00', timezone: 'UTC' },
  platforms: [],
  totals: {
    searches: 0,
    posts_found: 0,
    replies_sent: 0,
    replies_via_webhook: 0,
    opt_ins: 0,
    opt_ins_call_text: 0,
    billable_leads: 0,
    duplicates_excluded: 0,
  },
  agents: { available: false, reason: 'not yet' },
  sources: { events: { available: true }, lead_magnet: { available: true } },
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('window', { wpApiSettings: { root: 'http://mycompass/wp-json/', nonce: 'nonce-123' } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPilotReport', () => {
  it('asks for the month with the REST nonce and returns the parsed report', async () => {
    fetchMock.mockResolvedValue(jsonResponse(reportBody));

    const outcome = await fetchPilotReport('2026-10');

    expect(fetchMock).toHaveBeenCalledWith('http://mycompass/wp-json/xophz-freshmints/v1/pilot-report?month=2026-10', {
      headers: { 'X-WP-Nonce': 'nonce-123' },
    });
    expect(outcome.status).toBe('ok');
  });

  it('keeps the month query when the REST root already has one', async () => {
    vi.stubGlobal('window', { wpApiSettings: { root: 'http://mycompass/?rest_route=/', nonce: 'n' } });
    fetchMock.mockResolvedValue(jsonResponse(reportBody));

    await fetchPilotReport('2026-10');

    expect(fetchMock.mock.calls[0][0]).toBe('http://mycompass/?rest_route=/xophz-freshmints/v1/pilot-report&month=2026-10');
  });

  it.each([401, 403])('says forbidden for HTTP %i', async (status) => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'rest_forbidden', message: 'Sorry' }, status));

    const outcome = await fetchPilotReport('2026-10');

    expect(outcome.status).toBe('forbidden');
  });

  it('reports the server message for another refusal', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Send "month" as YYYY-MM' }, 400));

    expect(await fetchPilotReport('nope')).toEqual({ status: 'failed', reason: 'Send "month" as YYYY-MM' });
  });

  it('fails, not zeros, when the body is not a report', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ platforms: 'many' }));

    expect((await fetchPilotReport('2026-10')).status).toBe('failed');
  });

  it('fails with the transport message when the request throws', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    expect(await fetchPilotReport('2026-10')).toEqual({ status: 'failed', reason: 'offline' });
  });
});

describe('fetchBillableExport', () => {
  it('returns the CSV text and its filename', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ month: '2026-10', filename: 'f.csv', count: 1, duplicates_excluded: 0, csv: 'name\r\n' }),
    );

    const outcome = await fetchBillableExport('2026-10');

    expect(fetchMock.mock.calls[0][0]).toBe('http://mycompass/wp-json/xophz-freshmints/v1/pilot-report/billable?month=2026-10');
    expect(outcome).toEqual({
      status: 'ok',
      export: { month: '2026-10', filename: 'f.csv', count: 1, duplicatesExcluded: 0, csv: 'name\r\n' },
    });
  });

  it('shows the server reason when Lead Magnet is not active', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'freshmints_pilot_report_leads_unavailable', message: 'Lead Magnet is not active.' }, 503));

    expect(await fetchBillableExport('2026-10')).toEqual({ status: 'failed', reason: 'Lead Magnet is not active.' });
  });
});
