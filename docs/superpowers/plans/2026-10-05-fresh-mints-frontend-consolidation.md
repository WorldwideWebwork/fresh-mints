# Fresh Mints Frontend Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the dead Next.js tree in `apps/fresh-mints` after porting its three remaining unique capabilities, leaving the Svelte 5 tree as the single canonical source.

**Architecture:** The Svelte tree in `src/` is authoritative — it is the only tree with dependencies installed, the only tree type-checked, and the only tree wired to a build. Port the California open-data registry source into the WordPress PHP API (where the server tier already lives), port two missing modals into Svelte organisms, harmonize the two mirrored type files into canonical capsules, then delete `app/`, `components/`, `services/`, `types/`, `hooks/`, `lib/`, and the Next scaffolding.

**Tech Stack:** Svelte 5 (runes), Vite 6, TypeScript 5.8, Tailwind 4, Vitest 4 (added by Task 1), PHP (WordPress REST)

**Spec:** `docs/superpowers/specs/2026-10-05-fresh-mints-frontend-consolidation.md`

## Global Constraints

- **Branch first (AGENTS.md §1.G):** all work on `chem-x/frontend-consolidation`. Atomic, intention-revealing commits. PR targets `main`.
- **Two repositories.** Tasks 1, 2, 4, 5, 6, 7 are in the `Fresh-Mints` submodule (`apps/fresh-mints`). **Task 3 is in a different submodule:** `wp-content/plugins/xophz-compass-fresh-mints`, which needs its own `chem-x/` branch and its own PR.
- **Single canonical source per pattern (AGENTS.md §1.F).** After this plan, exactly one definition of `Lead`, `ProfessionCategory`, `PROFESSION_CONFIGS`, and `US_STATES` may exist in the repo.
- **`pnpm check` is the verification gate, and Task 0 must repair it first.** `tsc` alone misses 26 of the 27 real errors because it does not parse `.svelte`.
- **Max 500 lines per domain type file (AGENTS.md §2.A).** `src/lib/types/lead.ts` is 740 lines and must be decomposed by Task 2.
- **Tier separation (AGENTS.md §1.H).** Raw DOM only in `src/lib/components/atoms/`. New organisms compose existing atoms (`Button`, `Input`, `Select`, `Card`, `Dialog`, `Badge`).
- **Svelte 5 same-name shorthand (AGENTS.md §1.E).** Write `{lead}`, never `lead={lead}`.
- **Zero synthetic data (AGENTS.md §2.D).** Nothing ported may introduce seeded or placeholder leads.
- **Delete nothing before Task 7.** Tasks 1–6 are additive.

## Review Focus

Input classes the spec implies that no task's own happy path exercises. Each has its test assigned to the owning task.

1. **A state code with no `majorCities` data** — all 50 states now exist but only 20 had city lists; a city dropdown for the other 30 must render empty, not crash. → Task 1.
2. **`PROFESSION_CONFIGS` lookup with an unknown profession key** — `getDefaultWebsiteConfig` and `estimatedDealValue` both index it; an unmapped key must fall back to `real_estate`, not yield `undefined.averageWebsiteValue`. → Task 2.
3. **CA CKAN `datastore_search` returning a non-Socrata envelope** — the CA response shape is `{result: {records: []}}`, unlike NY's bare array. A malformed or empty `result` must yield zero leads, not a PHP warning. → Task 3.
4. **Manual lead entry with a duplicate license number** — `addLead` merges on `licenseNumber`; a hand-typed duplicate must be rejected with a message, not silently create a second record. → Task 4.
5. **Valuation modal for a lead whose `estimatedDealValue` is 0 or absent** — leads imported from CSV may carry no value; the explainer must show the profession default rather than divide by zero. → Task 5.

---

### Task 0: Repair the type-check gate

Every later task in this plan verifies with `pnpm check`. That command is currently broken, so
those steps cannot pass or fail meaningfully. `svelte-check` reports 69 errors, of which **42 are
the same message repeated** — `No Svelte configuration found in vite config / Error in vite.config`
— because `vite.config.ts` uses `__dirname` at module scope while `package.json` sets
`"type": "module"`. Vite's own config loader tolerates it; `svelte-check`'s does not.

`tsc --noEmit` is **not** a substitute: it does not parse `.svelte` files, so it sees 1 of the 27
real errors. This task must land before Task 1.

**Files:**
- Modify: `vite.config.ts` (line 5, the `workspaceRoot` computation)
- Create: `docs/superpowers/type-error-baseline.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `pnpm check`, and a recorded baseline every later task compares against.

- [ ] **Step 1: Capture the broken baseline**

Run: `pnpm --filter xophz-compass-fresh-mints check 2>&1 | tail -3`
Expected: `svelte-check found 69 errors and 0 warnings in 43 files` (the exact count may drift;
record whatever it prints).

- [ ] **Step 2: Replace `__dirname` with an ESM-safe equivalent**

In `vite.config.ts`, add `import { fileURLToPath } from 'node:url'` and replace the two
`__dirname` uses (line 5's `path.resolve(__dirname, '../..')` and the `@` alias's
`path.resolve(__dirname, './src')`) with a `const dirname = path.dirname(fileURLToPath(import.meta.url))`
computed once at module scope.

- [ ] **Step 3: Verify the noise is gone and the build still points at the plugin dist**

Run: `pnpm --filter xophz-compass-fresh-mints check 2>&1 | tail -3`
Expected: 27 errors, 0 of them mentioning `vite.config`. If any `Error in vite.config` remains,
the alias replacement was missed.

Then confirm the build target is unchanged — this config computes the shipped output path, so a
mistake here silently writes the bundle somewhere else:

```bash
pnpm --filter xophz-compass-fresh-mints build 2>&1 | tail -4
```
Expected: output paths under `wp-content/plugins/xophz-compass-fresh-mints/public/dist/`, **not**
a path inside `apps/fresh-mints/`.

- [ ] **Step 4: Record the real baseline by root cause**

Write `docs/superpowers/type-error-baseline.md` listing the 27 errors grouped by root cause, so
later tasks can tell a regression from an inherited failure. As of 2026-10-05 the 27 collapse into
six causes:

| Count | File | Root cause |
|---|---|---|
| 14 | `PracticeWebsiteTemplate.svelte` | A local identifier `state` collides with the `$state` rune — Svelte reads `$state` as a store subscription on it (`Cannot use 'state' as a store`, `used before its declaration`). One fix clears all 14. |
| 7 | `LeadDetailModal.svelte` | `lead` and `detectedWebUrl` dereferenced without null guards; `Badge` given `variant="secondary"`, which is not in its union. |
| 2 | `AuthLoginView.svelte` | Calls `currentTheme` and `toggleTheme`, neither of which exists on `ThemeStore`. |
| 1 | `ContactBadgeList.svelte` | `Globe` referenced with no import — an undefined component at runtime. |
| 1 | `OutreachGeneratorModal.svelte` | `OutreachLogItem` built without its required `status` and `toneUsed`. |
| 1 | `PlacesSearchView.svelte` | `number` assigned where `string` is required. |
| 1 | `lead-store.svelte.ts:646` | `ExistingWebsiteAudit.status` can be `'Website Found'`, not in its union. `:569` already uses `'Has Existing Website'` for the same concept. |

Three of these are runtime-crash or wrong-render class, not strictness: the undefined `Globe`
component, the missing `ThemeStore` methods on the login screen, and the `$state` collision.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts docs/superpowers/type-error-baseline.md
git commit -m "fix(build): make vite config ESM-safe so svelte-check can load it

svelte-check could not resolve the config because __dirname is undefined
at module scope in a \"type\": \"module\" package, masking 27 real type
errors behind 42 copies of one config-loading error."
```

- [ ] **Step 6: Decide whether to fix the 27 now or gate on them**

Ask the owner: clear all 27 before starting Task 1, or record them as the baseline and require
only "no *new* errors" per task? The three runtime-crash-class items above argue for fixing at
least those first. Either way, later tasks compare against the recorded baseline, not against zero.

---

### Task 1: Canonical `US_STATES` with full coverage and city data

The two `states.ts` files have incompatible shapes and each holds data the other lacks: Next has `majorCities` for 20 states, Svelte has `fullName` for all 50. This task produces the union, and establishes the test harness the rest of the plan uses.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script and `vitest` devDependency)
- Modify: `src/lib/types/states.ts` (63 lines — replace)
- Test: `src/lib/types/states.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```typescript
  export interface USState { code: string; name: string; fullName: string; majorCities: string[] }
  export const US_STATES: USState[]            // all 50, ordered alphabetically by fullName (consumers label by fullName)
  export const STATE_FILTER_OPTIONS: { value: string; label: string }[]  // 'all' + 50
  export const STATE_MODAL_OPTIONS: { value: string; label: string }[]   // 50, no 'all'
  export function getMajorCities(code: string): string[]
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/types/states.test.ts
import { describe, it, expect } from 'vitest';
import { US_STATES, STATE_FILTER_OPTIONS, STATE_MODAL_OPTIONS, getMajorCities } from './states';

describe('US_STATES', () => {
  it('covers all 50 states with unique codes', () => {
    expect(US_STATES).toHaveLength(50);
    expect(new Set(US_STATES.map((s) => s.code)).size).toBe(50);
  });

  it('preserves majorCities for the 20 states that had them', () => {
    expect(getMajorCities('AZ')).toContain('Phoenix');
    expect(getMajorCities('CA')).toContain('Los Angeles');
    expect(getMajorCities('NY')).toContain('Brooklyn');
    expect(getMajorCities('OR')).toContain('Bend');
  });

  // Review Focus 1
  it('returns an empty array for a state with no city data', () => {
    expect(getMajorCities('WY')).toEqual([]);
    expect(getMajorCities('ZZ')).toEqual([]);
  });

  it('labels filter options by fullName and leads with an all-states entry', () => {
    expect(STATE_FILTER_OPTIONS[0]).toEqual({ value: 'all', label: 'All US States & Territories' });
    expect(STATE_FILTER_OPTIONS).toHaveLength(51);
    expect(STATE_FILTER_OPTIONS).toContainEqual({ value: 'AZ', label: 'Arizona' });
  });

  it('omits the all-states entry from modal options', () => {
    expect(STATE_MODAL_OPTIONS).toHaveLength(50);
    expect(STATE_MODAL_OPTIONS.map((o) => o.value)).not.toContain('all');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run src/lib/types/states.test.ts`
Expected: FAIL — no `test` script / `getMajorCities` and `STATE_MODAL_OPTIONS` are not exported.

- [ ] **Step 3: Add the test harness**

In `package.json`, add `"test": "vitest"` to scripts and `"vitest": "^4.1.11"` to devDependencies (matching the workspace root version). Create `vitest.config.ts` reusing `vite.config.ts`'s `@` alias with `environment: 'node'`.

- [ ] **Step 4: Rewrite `src/lib/types/states.ts`**

Replace the 50 three-field entries with four-field entries. Take `code`/`fullName` from the existing Svelte file (all 50) and `name`/`majorCities` from `types/states.ts` (20 states); the other 30 get `majorCities: []` and `name` composed as `` `${fullName} (${code})` ``. Export `STATE_MODAL_OPTIONS` and `getMajorCities` as specified above. Keep `STATE_FILTER_OPTIONS`'s existing `'All US States & Territories'` label.

- [ ] **Step 5: Run tests and svelte-check**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run && pnpm --filter xophz-compass-fresh-mints check`
Expected: tests PASS; `svelte-check` reports no errors beyond those in `docs/superpowers/type-error-baseline.md` (Task 0).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json src/lib/types/states.ts src/lib/types/states.test.ts
git commit -m "feat(types): canonical US_STATES with 50-state coverage and major-city data"
```

---

### Task 2: Reconcile `PROFESSION_CONFIGS` and decompose `lead.ts`

> **BLOCKED until the owner answers:** for `nursing` and `beauty`, is the correct pricing
> `hostingTier: 'quantum'` / `averageWebsiteValue: 1250` (Next tree) or `'bronze'` / `1650`
> (Svelte tree)? Do not guess — this is customer-facing pricing. Steps 3–4 cannot start without it.

`src/lib/types/lead.ts` is 740 lines, breaching the 500-line cap in AGENTS.md §2.A. Split it while the single consumer tree makes the move cheap.

**Files:**
- Create: `src/lib/types/profession.ts`, `src/lib/types/hosting.ts`, `src/lib/types/social.ts`, `src/lib/types/places.ts`
- Modify: `src/lib/types/lead.ts` (740 → under 500; re-exports the new capsules so existing imports keep working)
- Test: `src/lib/types/profession.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `profession.ts` → `ProfessionCategory`, `ProfessionMetadata`, `PROFESSION_CONFIGS`, `getProfessionConfig(key: string): ProfessionMetadata`. `hosting.ts` → `W4HostingTier`, `W4HostingPlan`, `W4_HOSTING_PLANS`, `GlobalPlanInclusion`, `GLOBAL_PLAN_INCLUSIONS`, `MarketPriceComparison`, `MARKET_PRICE_COMPARISONS`, `TURNKEY_SCOPE_GUARANTEE`. `social.ts` → `LeadSource`, `SocialLeadContext`. `places.ts` → `GooglePlaceBusiness`, `GooglePlacesSearchParams`, `GooglePlacesSearchResponse`, `GooglePlacesWebsiteStatus`. `lead.ts` keeps `Lead`, `WebsitePreviewConfig`, `WebsiteServiceItem`, `ExistingWebsiteAudit`, `OutreachLogItem`, `OutreachStatus`, `OUTREACH_STAGES`, `LicenseStatus`, `SkipTraceStatus`, `SkipTraceResult`, `CustomTabConfig` and re-exports all of the above.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/types/profession.test.ts
import { describe, it, expect } from 'vitest';
import { PROFESSION_CONFIGS, getProfessionConfig } from './profession';

describe('PROFESSION_CONFIGS', () => {
  it('pins the reconciled nursing and beauty pricing', () => {
    // Values below are placeholders — replace with the owner's answer before implementing.
    expect(PROFESSION_CONFIGS.nursing.hostingTier).toBe('<DECIDED_TIER>');
    expect(PROFESSION_CONFIGS.nursing.averageWebsiteValue).toBe(/* <DECIDED_VALUE> */ 0);
    expect(PROFESSION_CONFIGS.beauty.hostingTier).toBe('<DECIDED_TIER>');
    expect(PROFESSION_CONFIGS.beauty.averageWebsiteValue).toBe(/* <DECIDED_VALUE> */ 0);
  });

  it('keys every config by its own id', () => {
    for (const [key, cfg] of Object.entries(PROFESSION_CONFIGS)) expect(cfg.id).toBe(key);
  });

  it('gives every profession a positive averageWebsiteValue', () => {
    for (const cfg of Object.values(PROFESSION_CONFIGS)) expect(cfg.averageWebsiteValue).toBeGreaterThan(0);
  });

  // Review Focus 2
  it('falls back to real_estate for an unknown profession key', () => {
    expect(getProfessionConfig('not_a_profession')).toBe(PROFESSION_CONFIGS.real_estate);
    expect(getProfessionConfig('').averageWebsiteValue).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run src/lib/types/profession.test.ts`
Expected: FAIL — `./profession` does not exist.

- [ ] **Step 3: Extract the four type capsules**

Move the declarations listed in Interfaces out of `lead.ts` into the four new files, each under 500 lines. Add `getProfessionConfig` with the `real_estate` fallback. Have `lead.ts` re-export everything it moved, so no consumer import changes in this task.

- [ ] **Step 4: Apply the owner's pricing decision**

Set `nursing` and `beauty` `hostingTier` / `averageWebsiteValue` to the decided values in `profession.ts`, and update the placeholders in the Step 1 test to match. Also reconcile the entry-tier `hardwareSpecs` string (`'1 vCPU • 512MB RAM • 10GB SSD'` vs the `' (No WAF/Staging)'` suffix) in the same commit.

- [ ] **Step 5: Verify**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run && pnpm --filter xophz-compass-fresh-mints check && wc -l src/lib/types/*.ts`
Expected: tests PASS; no new `svelte-check` errors; every file in `src/lib/types/` under 500 lines.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types/
git commit -m "refactor(types): split lead.ts into domain capsules and reconcile profession pricing"
```

---

### Task 3: Port the California open-data registry into the PHP API

**Different repository.** Work in `wp-content/plugins/xophz-compass-fresh-mints` on its own `chem-x/ca-open-data-registry` branch, with its own PR.

`services/socrata-registry-service.ts` queries `data.ca.gov/api/3/action/datastore_search` (CKAN). The PHP handler implements only the NY dataset, so California lookups exist nowhere else. This is the one true capability loss if the Next tree is deleted as-is.

**Files:**
- Modify: `includes/class-freshmints-api.php` — the Socrata branch at :1509–1540, inside `handle_fetch_live_registry` (:1313)
- Test: manual `curl` verification (this plugin has no PHP test harness; adding one is out of scope)

**Interfaces:**
- Consumes: the CA endpoint, limit, and field mapping documented in `apps/fresh-mints/services/socrata-registry-service.ts:25` and `fetchCALicenses`.
- Produces: no signature change. `handle_fetch_live_registry` returns the same `{ leads, source, groundingNotes }` envelope; `source` gains the value `'State Socrata Open Data (CA)'`.

- [ ] **Step 1: Read the TS reference implementation**

Read `apps/fresh-mints/services/socrata-registry-service.ts` in full (130 lines) and note `CA_ENDPOINT`, the `fetchCALicenses` query parameters, and the record-to-`Lead` field mapping. The CA response envelope is `{ result: { records: [...] } }` — not NY's bare array.

- [ ] **Step 2: Add a `fetch_ca_licenses` private method**

Add `private function fetch_ca_licenses( $profession, $limit )` beside the existing NY branch. Use `wp_remote_get` with the same timeout and error handling as the NY call at :1524. Guard the envelope: if `result` or `result.records` is missing or not an array, return `array()`. Normalize each record into the same lead shape the NY branch produces, with ids prefixed `socrata-ca-`.

- [ ] **Step 3: Dispatch on state**

In the Socrata branch at :1509, route `$state === 'NY'` to the existing NY call and `$state === 'CA'` to `fetch_ca_licenses`. Leave all other states on their current path. Set `source` to `'State Socrata Open Data (CA)'` when the CA branch returns results.

- [ ] **Step 4: Verify against the live endpoint**

```bash
curl -s "https://data.ca.gov/api/3/action/datastore_search?limit=3" | head -c 400
```
Expected: a JSON body containing `"result"` and `"records"`, confirming the envelope shape the guard handles.

Then, against a local WordPress with the plugin active:
```bash
curl -s -X POST "$WP_URL/wp-json/xophz-freshmints/v1/registry/fetch-live" \
  -H 'Content-Type: application/json' -H "X-WP-Nonce: $NONCE" \
  -d '{"profession":"nursing","state":"CA","limit":5,"date_window":"all"}' | head -c 600
```
Expected: a `leads` array and `"source":"State Socrata Open Data (CA)"`. **Review Focus 3:** re-run with `"state":"CA"` against a profession with no CA records and confirm an empty `leads` array with no PHP warning in `debug.log`.

- [ ] **Step 5: Commit (plugin repo)**

```bash
git add includes/class-freshmints-api.php
git commit -m "feat(registry): add California CKAN open-data source to live registry lookup"
```

---

### Task 4: Port `AddLeadModal` to a Svelte organism

`leadStore.addLead()` has only two callers — CSV import and social-lead conversion. There is no manual-entry form in the Svelte UI.

**Files:**
- Create: `src/lib/components/organisms/AddLeadModal.svelte`
- Create: `src/lib/services/lead-validation.ts`
- Modify: `src/lib/components/templates/DashboardLayout.svelte` (mount the modal and its trigger)
- Test: `src/lib/services/lead-validation.test.ts`

**Interfaces:**
- Consumes: `getProfessionConfig`, `PROFESSION_CONFIGS` (Task 2); `US_STATES`, `STATE_MODAL_OPTIONS`, `getMajorCities` (Task 1); `leadStore.addLead(lead: Partial<Lead>): Promise<Lead>`; `leadStore.leads`; atoms `Dialog`, `Input`, `Select`, `Button`.
- Produces: `validateNewLead(input: Partial<Lead>, existing: Lead[]): { ok: true; lead: Partial<Lead> } | { ok: false; errors: Record<string, string> }`. The reference UI is `components/organisms/AddLeadModal.tsx` (210 lines) — read it for the field set, then compose Svelte atoms rather than translating JSX.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/services/lead-validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateNewLead } from './lead-validation';

const valid = { fullName: 'Jane Doe', profession: 'nursing', state: 'CA', city: 'Fresno', licenseNumber: 'RN-99001' } as const;

describe('validateNewLead', () => {
  it('accepts a complete lead and defaults its deal value from the profession', () => {
    const res = validateNewLead({ ...valid }, []);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.lead.estimatedDealValue).toBeGreaterThan(0);
  });

  it('requires fullName, profession, state and licenseNumber', () => {
    const res = validateNewLead({ city: 'Fresno' }, []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(Object.keys(res.errors).sort()).toEqual(['fullName', 'licenseNumber', 'profession', 'state']);
  });

  // Review Focus 4
  it('rejects a licenseNumber that already exists', () => {
    const existing = [{ licenseNumber: 'RN-99001' }] as any;
    const res = validateNewLead({ ...valid }, existing);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.licenseNumber).toMatch(/already/i);
  });

  it('rejects a state code that is not a real US state', () => {
    const res = validateNewLead({ ...valid, state: 'ZZ' }, []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.state).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run src/lib/services/lead-validation.test.ts`
Expected: FAIL — `./lead-validation` does not exist.

- [ ] **Step 3: Implement `validateNewLead` in `src/lib/services/lead-validation.ts`**

Pure function, no store or DOM access. Validate against `US_STATES` codes and the required-field list above, check `licenseNumber` against `existing`, and on success return the lead with `estimatedDealValue` defaulted from `getProfessionConfig(profession).averageWebsiteValue`, `leadSource: 'manual'`, and `createdAt` set.

- [ ] **Step 4: Build `AddLeadModal.svelte`**

Compose `Dialog`, `Input`, `Select`, `Button` — no raw DOM (AGENTS.md §1.H). Use `$state` for the form and `$derived` for validity. Drive the city field from `getMajorCities(state)`, falling back to a free-text `Input` when the list is empty (Review Focus 1). On submit, call `validateNewLead`, then `leadStore.addLead` on success, surfacing errors through `toast`. Use same-name shorthand throughout.

- [ ] **Step 5: Mount it in `DashboardLayout.svelte`**

Add an "Add Lead" trigger alongside the existing import action and render the modal behind a `$state` boolean.

- [ ] **Step 6: Verify**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run && pnpm --filter xophz-compass-fresh-mints check`
Expected: tests PASS; no new `svelte-check` errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/services/lead-validation.ts src/lib/services/lead-validation.test.ts \
        src/lib/components/organisms/AddLeadModal.svelte \
        src/lib/components/templates/DashboardLayout.svelte
git commit -m "feat(leads): add manual lead entry modal with validated input"
```

---

### Task 5: Port `ValuationExplainerModal` to a Svelte organism

Valuation math exists in `services/website-templates.ts` and `services/outreach-generator.ts`, but nothing in the Svelte UI explains a lead's deal value to a rep.

**Files:**
- Create: `src/lib/components/organisms/ValuationExplainerModal.svelte`
- Create: `src/lib/services/valuation-breakdown.ts`
- Modify: `src/lib/components/organisms/LeadDetailModal.svelte` (add the trigger)
- Test: `src/lib/services/valuation-breakdown.test.ts`

**Interfaces:**
- Consumes: `getProfessionConfig`, `W4_HOSTING_PLANS` (Task 2); atoms `Dialog`, `Card`, `Badge`, `Button`.
- Produces: `buildValuationBreakdown(lead: Lead): ValuationBreakdown` where `ValuationBreakdown` is `{ dealValue: number; profession: ProfessionCategory; hostingTier: W4HostingTier; twoYearFlatPackagePrice: number; callerCommission: number; twoYearHostingCost: number; twoYearDomainCost: number; netConsultingProfit: number; usedProfessionDefault: boolean }`. The reference UI is `components/organisms/ValuationExplainerModal.tsx` (209 lines).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/services/valuation-breakdown.test.ts
import { describe, it, expect } from 'vitest';
import { buildValuationBreakdown } from './valuation-breakdown';

const lead = { profession: 'dental', estimatedDealValue: 2650 } as any;

describe('buildValuationBreakdown', () => {
  it('reports the lead deal value and derives net profit from the tier', () => {
    const b = buildValuationBreakdown(lead);
    expect(b.dealValue).toBe(2650);
    expect(b.usedProfessionDefault).toBe(false);
    expect(b.netConsultingProfit).toBe(
      b.twoYearFlatPackagePrice - b.callerCommission - b.twoYearHostingCost - b.twoYearDomainCost
    );
  });

  // Review Focus 5
  it('falls back to the profession default when the lead carries no value', () => {
    for (const v of [0, undefined, null]) {
      const b = buildValuationBreakdown({ profession: 'dental', estimatedDealValue: v } as any);
      expect(b.dealValue).toBeGreaterThan(0);
      expect(b.usedProfessionDefault).toBe(true);
    }
  });

  it('falls back to real_estate for an unmapped profession', () => {
    const b = buildValuationBreakdown({ profession: 'astronaut', estimatedDealValue: 0 } as any);
    expect(b.dealValue).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run src/lib/services/valuation-breakdown.test.ts`
Expected: FAIL — `./valuation-breakdown` does not exist.

- [ ] **Step 3: Implement `buildValuationBreakdown` in `src/lib/services/valuation-breakdown.ts`**

Pure function. Resolve the profession via `getProfessionConfig`, read the hosting-tier figures from `W4_HOSTING_PLANS[config.hostingTier]`, and set `dealValue` to `lead.estimatedDealValue` when positive, otherwise the profession's `averageWebsiteValue` with `usedProfessionDefault: true`.

- [ ] **Step 4: Build `ValuationExplainerModal.svelte`**

Compose `Dialog`, `Card`, `Badge`, `Button`. Render the breakdown as labelled rows; no raw DOM, no inline styles (AGENTS.md §1.H, §5.A). When `usedProfessionDefault` is true, show a `Badge` saying the figure is a profession average.

- [ ] **Step 5: Add the trigger in `LeadDetailModal.svelte`**

Add a "Why this value?" action beside the displayed deal value.

- [ ] **Step 6: Verify**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run && pnpm --filter xophz-compass-fresh-mints check`
Expected: tests PASS; no new `svelte-check` errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/services/valuation-breakdown.ts src/lib/services/valuation-breakdown.test.ts \
        src/lib/components/organisms/ValuationExplainerModal.svelte \
        src/lib/components/organisms/LeadDetailModal.svelte
git commit -m "feat(leads): add valuation explainer modal with deal-value breakdown"
```

---

### Task 6: Delete the Next.js tree and stray artifacts

Only after Tasks 1–5 are merged. Nothing here is reachable: no `react`/`next` dependency is declared or installed, `tsconfig.json` excludes all of it, and no script in the monorepo runs `next build`.

**Files:**
- Delete: `app/`, `components/`, `services/`, `types/`, `hooks/`, `lib/`
- Delete: `next.config.ts`, `next-env.d.ts`, `middleware.ts`, `.eslintrc.json`, `metadata.json`, `scratch-test-api.php`, `test-grounding.mjs`
- Delete (untracked): `.next/`
- Modify: `.gitignore` (drop the now-pointless `.next/` entry)
- Modify (monorepo): `scripts/m3_guides.py:375`

**Interfaces:**
- Consumes: Tasks 1–5 must be merged — they hold the only copies of the CA registry source, the two modals, and the merged state data.
- Produces: nothing.

- [ ] **Step 1: Prove the trees are disjoint before deleting**

```bash
# NOTE: a bare grep is UNUSABLE here. types/, services/, lib/ and components/ exist as
# directory names in BOTH trees, so this pattern returns ~35 false positives that are all
# legitimate imports inside src/lib/. Resolve each specifier to the path it actually lands on
# and assert none escapes src/, then prove the check works by injecting a deliberately
# escaping import and confirming it is flagged.
grep -rn "from '\.\./\(components\|services\|types\|hooks\|lib\)\|from '@/\(components\|services\|hooks\|lib\)" src/ ; echo "exit=$?"
```
Expected: no matches (`exit=1`). `src/` must not import from the Next tree. **If anything matches, stop** and port that import before continuing.

- [ ] **Step 2: Confirm nothing in the monorepo builds the Next tree**

```bash
grep -rn "next build\|next dev\|next start" ../../package.json ../../scripts ../../.github 2>/dev/null; echo "exit=$?"
```
Expected: no matches (`exit=1`).

- [ ] **Step 3: Delete**

```bash
git rm -r app components services types hooks lib
git rm next.config.ts next-env.d.ts middleware.ts .eslintrc.json metadata.json \
       scratch-test-api.php test-grounding.mjs
rm -rf .next
```

If the subdomain routing in `middleware.ts` is still serving production traffic (see the spec's §2.4 open question), **do not delete it** — move it to `docs/` as a routing reference and note what now owns that behavior.

- [ ] **Step 4: Verify the build still produces the shipped bundle**

```bash
pnpm --filter xophz-compass-fresh-mints test -- --run
pnpm --filter xophz-compass-fresh-mints check
pnpm --filter xophz-compass-fresh-mints build
ls -la ../../wp-content/plugins/xophz-compass-fresh-mints/public/dist/assets/
```
Expected: tests PASS; no new `svelte-check` errors; `build` succeeds; freshly dated `index-*.js` and `index-*.css` in the plugin dist (replacing the stale 2026-09-23 pair).

- [ ] **Step 5: Fix the stale build-output doc (monorepo)**

In `scripts/m3_guides.py:375`, change the fresh-mints output path from `apps/fresh-mints/dist/` to `wp-content/plugins/xophz-compass-fresh-mints/public/dist/`. Commit separately in the monorepo.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: retire dead Next.js tree and stray scratch files

The Svelte tree in src/ is the only buildable frontend: no react/next
dependency is declared or installed, tsconfig excludes app/, components/,
services/ and types/, and no script in the monorepo runs next build. The
server tier moved to WordPress REST in class-freshmints-api.php.

Unique capabilities were ported first: the California CKAN registry source
(plugin repo), AddLeadModal, and ValuationExplainerModal."
```

---

### Task 7: Guard against the drift returning

A single canonical source only stays canonical if something checks.

**Files:**
- Create: `src/lib/types/canonical.test.ts`

**Interfaces:**
- Consumes: Task 6's deletions.
- Produces: nothing.

- [ ] **Step 1: Write the test**

```typescript
// src/lib/types/canonical.test.ts
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../../..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git' || e === 'dist' || e === '.next') continue;
    const p = join(dir, e);
    statSync(p).isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

describe('single canonical source (AGENTS.md 1.F)', () => {
  const files = walk(ROOT).filter((f) => /\.(ts|tsx|svelte)$/.test(f));

  it('declares PROFESSION_CONFIGS exactly once', () => {
    const owners = files.filter((f) => /export const PROFESSION_CONFIGS/.test(readFileSync(f, 'utf8')));
    expect(owners).toHaveLength(1);
    expect(owners[0]).toMatch(/src\/lib\/types\/profession\.ts$/);
  });

  it('declares US_STATES exactly once', () => {
    const owners = files.filter((f) => /export const US_STATES/.test(readFileSync(f, 'utf8')));
    expect(owners).toHaveLength(1);
    expect(owners[0]).toMatch(/src\/lib\/types\/states\.ts$/);
  });

  it('keeps every domain type file under 500 lines (AGENTS.md 2.A)', () => {
    for (const f of files.filter((f) => /src\/lib\/types\/.*\.ts$/.test(f) && !/\.test\.ts$/.test(f))) {
      expect(readFileSync(f, 'utf8').split('\n').length, f).toBeLessThan(500);
    }
  });

  it('has no react or next dependency', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const d of ['react', 'react-dom', 'next']) expect(deps).not.toHaveProperty(d);
  });
});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter xophz-compass-fresh-mints test -- --run src/lib/types/canonical.test.ts`
Expected: PASS. If the `PROFESSION_CONFIGS` or `US_STATES` assertion fails with 2 owners, Task 6's deletion is incomplete.

- [ ] **Step 3: Commit and open the PRs**

```bash
git add src/lib/types/canonical.test.ts
git commit -m "test(types): assert a single canonical source per pattern"
git push -u origin chem-x/frontend-consolidation
```

Open two PRs targeting `main` (AGENTS.md §1.G): one on `Fresh-Mints` for Tasks 1, 2, 4, 5, 6, 7, and one on `xophz-compass-fresh-mints` for Task 3. **Land Task 3's PR first** — deleting the TS Socrata service before CA exists in PHP is the only ordering that loses a capability.
