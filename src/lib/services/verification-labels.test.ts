// Guards the honest-labels rule: nothing in this app verifies an email address or a phone
// number, so no source file may write or show wording that says a check ran. The scan walks
// the real source tree so a recurrence in any component, store or service fails here.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE_FILE = /\.(?:ts|svelte)$/;
const TEST_FILE = /\.test\.ts$/;

// Claims older builds wrote or showed with no check behind them.
const UNBACKED_CLAIMS = [
  'Website Scraped & Verified',
  'Grounding Verified',
  'Valid & Deliverable',
  'Clean - Not on DNC',
  'Carrier Verified',
  'Phone verified',
  'No contact verified',
  'Contact Verified',
];
// Only 'Unknown' is honest while no DNC lookup exists in the app.
const DNC_LITERAL_OTHER_THAN_UNKNOWN = /dncStatus:\s*(['"`])(?!Unknown\1)[^'"`]*\1/;

const toPosix = (path: string): string => path.split(sep).join('/');

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    const isSource = entry.isFile() && SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name);
    return isSource ? [toPosix(relative(SRC_ROOT, path))] : [];
  });
}

const read = (file: string): string => readFileSync(join(SRC_ROOT, file), 'utf8');

describe('verification labels', () => {
  const files = listSourceFiles(SRC_ROOT);

  it('scans the files that write and show skip-trace labels', () => {
    expect(files).toContain('lib/stores/lead-store.svelte.ts');
    expect(files).toContain('lib/components/organisms/WebsiteAuditModal.svelte');
    expect(files).toContain('lib/components/organisms/LeadDetailModal.svelte');
    expect(files).toContain('lib/services/skip-trace.ts');
  });

  it('writes and shows no claim that a check ran when none did', () => {
    const found = files.flatMap((file) => {
      const text = read(file);
      return UNBACKED_CLAIMS.filter((claim) => text.includes(claim)).map((claim) => `${file}: ${claim}`);
    });

    expect(found).toEqual([]);
  });

  it('writes no DNC status other than Unknown', () => {
    const found = files.filter((file) => DNC_LITERAL_OTHER_THAN_UNKNOWN.test(read(file)));

    expect(found).toEqual([]);
  });

  it('does not head a Places phone column as verified', () => {
    expect(read('lib/components/organisms/PlacesSearchView.svelte')).not.toMatch(/<th[^>]*>\s*Verified Phone/);
  });

  it('normalizes legacy contact claims when leads load and before they are exported', () => {
    expect(read('lib/stores/lead-store.svelte.ts')).toContain('normalizeLegacyLeads(storedLeads)');
    expect(read('lib/services/crm-export-service.ts')).toContain('normalizeLegacyLeads(leads)');
  });

  it('falls back to a formatter that reads Not checked, not a literal claim', () => {
    const modal = read('lib/components/organisms/LeadDetailModal.svelte');

    expect(modal).toContain('formatEmailValidation(lead.skipTraceData)');
    expect(modal).not.toMatch(/emailValidation\s*\|\|\s*['"]/);
  });
});
