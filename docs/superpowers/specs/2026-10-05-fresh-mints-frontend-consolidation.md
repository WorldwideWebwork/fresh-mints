# Fresh Mints Dual-Frontend Inventory & Authority Determination

**Date:** 2026-10-05
**Repo:** `apps/fresh-mints` (submodule, `git@github.com:WorldwideWebwork/Fresh-Mints.git`)
**Submodule branch at audit time:** `chem-x/social-feed-error-surfacing` (clean tree), HEAD `395c7d3`
**Audit method:** read-only inspection of the main checkout at `/home/xopher/www/x/Xophz-COMPASS`

---

## 0. Audit Environment Note

The Claude worktree this audit was requested from (`claude/funny-noyce-6179cc`, HEAD `8384d8ab`)
**does not contain `apps/fresh-mints` at all.** Its `.gitmodules` predates the submodule and
still points at Bitbucket `mycompass` URLs; `AGENTS.md` is also absent from that tree. All
findings below were gathered read-only from the main checkout. **Remediation must be executed in
the `Fresh-Mints` submodule repo, not in that worktree.**

---

## 1. Verdict: the Svelte tree is authoritative

Nine independent lines of evidence, all pointing the same way:

| # | Evidence | Detail |
|---|---|---|
| 1 | **No React/Next dependency exists** | `package.json` declares only `svelte`, `vite`, `tailwindcss`, `bits-ui`, `lucide-svelte`, `@google/genai`. No `next`, no `react`, no `react-dom`. |
| 2 | **Not installed either** | `node_modules/` contains no `react`, `react-dom`, or `next`. The Next tree's imports are unresolvable — it cannot compile today. |
| 3 | **Outside type-checking** | `tsconfig.json` `include` is `["src/**/*.d.ts", "src/**/*.ts", "src/**/*.js", "src/**/*.svelte"]`. `svelte-check` has never seen `app/`, `components/`, `services/`, or `types/`. |
| 4 | **HTML entry point** | `index.html` loads `/src/main.ts`. |
| 5 | **Build target is the shipped plugin** | `vite.config.ts` sets `build.outDir` to `wp-content/plugins/xophz-compass-fresh-mints/public/dist`. |
| 6 | **Monorepo wiring is vite-only** | Root `package.json`: `build:freshmints` / `dev:freshmints` → `pnpm --filter xophz-compass-fresh-mints build\|dev` → vite. `grep -rn "next build\|next dev\|next start"` across `package.json`, `scripts/`, `.github/` returns **zero hits**. |
| 7 | **Commit recency** | `src/` → `395c7d3`, **2026-10-05**. `app/` → **2026-09-02**. `components/` + `services/` → **2026-08-29**. The Next tree has been frozen ~5 weeks. |
| 8 | **Server tier already migrated to WordPress** | Svelte calls 9 `xophz-freshmints/v1/*` REST endpoints. The plugin's `includes/class-freshmints-api.php` (2,327 lines) registers all 9 plus `/auth/me` and `/stats`. The three Next API routes are superseded by PHP handlers. |
| 9 | **Next build output is dead** | `.next/` is gitignored and last built 2026-08-26. |

**Scale:** Next tree = 53 files / 12,072 LOC. Svelte tree = 68 files / 16,002 LOC.

### Server-tier supersession, endpoint by endpoint

| Next route | LOC | PHP replacement in `class-freshmints-api.php` |
|---|---|---|
| `app/api/registry/fetch-live/route.ts` | 178 | `handle_fetch_live_registry` (:1313–1615) |
| `app/api/leads/check-website/route.ts` | 414 | `handle_check_website` (:869) + `check_domain_mx_records` (:454), `generate_domain_email_permutations` (:496), `scrape_website_contact_info` (:541) |
| `app/api/gemini/generate/route.ts` | 416 | `handle_gemini_generate` (:240) + `call_gemini_api` (:175) |

The PHP registry handler is a **superset** of the TS implementation — it adds FINRA BrokerCheck
(`api.brokercheck.finra.org/search/individual`) alongside CMS NPPES and NY Open Data — **with one
exception documented in §2.1.**

---

## 2. What exists only in the Next.js tree

### 2.1 Genuine capability gaps — must port before retiring

| Item | LOC | Why it is a gap |
|---|---|---|
| `services/socrata-registry-service.ts` | 130 | Queries **two** datasets: `data.ny.gov/resource/k397-673v.json` **and `data.ca.gov/api/3/action/datastore_search`** (CKAN). The PHP handler only implements the NY dataset. **California open-license lookup exists nowhere else.** |
| `components/organisms/AddLeadModal.tsx` | 210 | No manual lead-entry form exists in Svelte. `leadStore.addLead()` has exactly two callers — CSV import (`lead-store.svelte.ts:956`) and social-lead conversion (`:1089`). There is no way to type in a lead by hand. |
| `components/organisms/ValuationExplainerModal.tsx` | 209 | `/valuation/i` appears in the Svelte tree only inside `services/website-templates.ts`, `services/outreach-generator.ts`, and `types/lead.ts` — **never in a component.** No UI surfaces the valuation rationale. |

### 2.2 Duplicated — delete, no port needed

| Item | LOC | Status |
|---|---|---|
| `services/nppes-registry-service.ts` | 163 | Same endpoint (`npiregistry.cms.hhs.gov/api/`) as PHP `handle_fetch_live_registry` (:1341). Framework-agnostic but redundant. |
| `services/live-registry-engine.ts` | 57 | A thin `fetch('/api/registry/fetch-live')` wrapper. **Zero unique logic.** Fully superseded by `leadStore.fetchLiveOpenRegistryData()`, which posts to `/wp-json/xophz-freshmints/v1/registry/fetch-live` with an `X-WP-Nonce`. |
| `services/crm-export-service.ts`, `indexeddb-storage.ts`, `outreach-generator.ts`, `skip-trace.ts`, `website-templates.ts` | — | All have `src/lib/services/` counterparts. |

### 2.3 UI covered in Svelte under different names or placements

| Next organism | LOC | Svelte coverage |
|---|---|---|
| `AddCustomTabModal.tsx` | 311 | `CustomTabModal.svelte` |
| `OutreachComposerModal.tsx` | 575 | `OutreachGeneratorModal.svelte` |
| `WebsitePreviewModal.tsx` | 394 | `PracticeWebsitePreview.svelte` + `WebsiteBuilderModal.svelte` + `PracticeWebsiteTemplate.svelte` |
| `SkipTraceModal.tsx` | 269 | Inlined across `LeadDetailModal.svelte`, `LeadTable.svelte`, `LeadCard.svelte`, `RepHubView.svelte`, `PlacesSearchView.svelte` + `services/skip-trace.ts` |
| `CrmExportModal.tsx` | 331 | `RepHubView.svelte`, `LeadDetailModal.svelte`, `LeadRow.svelte` + `services/crm-export-service.ts` + `/crm/sync` |
| `CustomFilteredView.tsx` | 180 | `CustomTabModal.svelte` + `DashboardLayout.svelte` + lead-store custom-tab state |

All atoms (`Badge`, `Button`, `Input`, `Select`, `StatusIndicator`), all molecules
(`ConfirmDialog`, `ContactBadgeList`, `FilterBar`, `LeadCard`, `LeadRow`, `StatCard`, `Toast`),
the `DashboardLayout` template, and `AnalyticsView` / `KanbanBoard` / `LeadTable` /
`RegistrySearchView` / `RepHubView` / `W4EconomicsView` / `WebsiteAuditModal` exist in **both**
trees. Zero Next-only atoms, molecules, or templates.

### 2.4 Next-only infrastructure — a deployment decision, not a port

| Item | LOC | Note |
|---|---|---|
| `middleware.ts` | 35 | Subdomain routing for `*.worldwidewebwork.com`: `freshmints.` → dashboard, `preview.` → `/preview/*`, `<tenant>.` → `/preview/<tenant>/*`, apex/`www` → redirect to `www.worldwidewebwork.com`. **Edge routing, not application code.** |
| `app/preview/[slug]/PreviewClient.tsx` | 685 | Public SSR preview page. Svelte covers previews in-app: `App.svelte:75` reads `wpApiSettings.previewSlug`, with standalone preview mode at `:269` and `PracticeWebsitePreview.svelte` / `PracticeWebsiteTemplate.svelte`. |
| `app/preview/[slug]/page.tsx`, `app/preview/page.tsx` | 32, 6 | Route shells. |
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | 25, 9, — | Next app-shell. |
| `next.config.ts`, `next-env.d.ts`, `.eslintrc.json`, `metadata.json` | — | Tracked Next scaffolding. |
| `hooks/use-lead-store.ts`, `use-mobile.ts`, `use-toast.ts` | — | Superseded by `src/lib/stores/*.svelte.ts` (runes). |
| `lib/store.ts`, `lib/sample-data.ts`, `lib/utils.ts` | — | Superseded by `lead-store.svelte.ts` + `services/initial-seeds.ts`. `lib/sample-data.ts` is also a **§2.D Zero Synthetic or Mock Data** concern. |

**Open question for the owner:** if `preview.worldwidewebwork.com` or tenant subdomains are
live in production today, that traffic is served by something. Retiring `middleware.ts` requires
confirming WordPress/DNS now owns that routing.

---

## 3. What exists only in the Svelte tree

This is the newest work and confirms the direction of travel.

**`src/lib/services/social-feed/` — an entire module with no Next counterpart (7 files):**
`providers/reddit-public-provider.ts`, `providers/hacker-news-provider.ts`,
`providers/mock-feed-provider.ts`, `social-feed-registry.ts`, `social-intent-analyzer.ts`,
`social-post-dispatcher.ts`, `types.ts`

**Organisms (13):** `AuthLoginView`, `SocialRadarView`, `SocialTokensModal`, `UpgradePlanModal`,
`PlacesSearchView`, `ColdCallScriptModal`, `ImportCSVModal`, `LeadDetailModal`, `LoadingScreen`,
`SettingsModal`, `PracticeWebsitePreview`, `PracticeWebsiteTemplate`, `WebsiteBuilderModal`

**Atoms (5):** `Card`, `Dialog`, `IndustryBadge`, `IndustryIcon`, `Tooltip`
**Molecules (1):** `VisualPitchCard`
**Stores:** `auth-store.svelte.ts`, `social-tokens-store.svelte.ts`, `theme.svelte.ts`,
`toast.svelte.ts`, `lead-store.svelte.ts`
**Services:** `bomb-bag-service.ts`, `clipboard.ts`, `initial-seeds.ts`, `visual-pitch-generator.ts`

---

## 4. Type drift — direct AGENTS.md §1.F violation

### 4.1 `types/lead.ts` (663) vs `src/lib/types/lead.ts` (740) — 123 differing lines

**The dangerous part — conflicting money values in `PROFESSION_CONFIGS`:**

| Profession | Next tree | Svelte tree |
|---|---|---|
| `nursing` | `hostingTier: 'quantum'`, `averageWebsiteValue: 1250` | `hostingTier: 'bronze'`, `averageWebsiteValue: 1650` |
| `beauty` | `hostingTier: 'quantum'`, `averageWebsiteValue: 1250` | `hostingTier: 'bronze'`, `averageWebsiteValue: 1650` |

`averageWebsiteValue` feeds `estimatedDealValue` and the outreach pitch copy. `hardwareSpecs`
for the entry tier also differs (`'1 vCPU • 512MB RAM • 10GB SSD (No WAF/Staging)'` vs
`'1 vCPU • 512MB RAM • 10GB SSD'`). **Two trees quote customers different prices for the same
profession.** This is exactly the silent divergence §1.F exists to prevent.

**Svelte-only type additions:** `LeadSource`, `SocialLeadContext`, `GooglePlaceBusiness`,
`GooglePlacesSearchParams`, `GooglePlacesWebsiteStatus`, `WebsitePreviewConfig.templateTheme`,
`Lead.leadSource`, `Lead.socialContext`

**Next-only in `lead.ts`:** nothing structural — only inline comments the Svelte copy dropped.

### 4.2 `types/states.ts` (35) vs `src/lib/types/states.ts` (63) — incompatible interfaces

| | Next | Svelte |
|---|---|---|
| Shape | `{ code, name, majorCities: string[] }` | `{ code, name, fullName }` |
| Coverage | **20 states** | **all 50 states** |
| Extra export | `STATE_MODAL_OPTIONS` | — |
| Option label | `s.name` (`"Arizona (AZ)"`) | `s.fullName` (`"Arizona"`) |

**Each tree holds data the other lacks.** Next has per-state `majorCities` (used for city
dropdowns) for 20 states; Svelte has complete 50-state coverage but no city data. A canonical
file needs all 50 states × `fullName` × `majorCities`, plus `STATE_MODAL_OPTIONS`.

### 4.3 AGENTS.md sections breached

- **§1.F Pre-Split Pattern Discovery & Harmonization** — "Identify Recurring Structures: map …
  **mirrored type definitions** across files"; "Canonical Extraction First"; "Zero Bespoke
  Pattern Proliferation". Two independent definitions of `Lead`, `ProfessionCategory`,
  `PROFESSION_CONFIGS`, and `US_STATES` is the precise failure mode, and they have already
  diverged on pricing.
- **§2.A Anti-Type-Monolith** — "Max 500 lines per domain type file": both `lead.ts` files breach
  it (663 and 740). Also "Root `types/*.d.ts` is reserved strictly for universal system
  primitives … never domain entity models" — the Next tree's root `types/lead.ts` is pure domain
  entities.
- **§1.G Git Branching** — remediation must begin on a `chem-x/<name-of-improvement>` branch.
- **§10.A Co-located Test Files** — `apps/fresh-mints` has **zero** test files and no `test`
  script; only `check` (`svelte-check`). Vitest `^4.1.11` is available at the workspace root.
- **§2.D Zero Synthetic or Mock Data** — `lib/sample-data.ts` (Next) and
  `social-feed/providers/mock-feed-provider.ts` (Svelte) warrant separate review.
- **§1.A Hard Line Limits** — `lead-store.svelte.ts` is 1,113 lines and
  `class-freshmints-api.php` is 2,327 lines. Flagged; out of scope for this consolidation.

---

## 5. Stray and stale artifacts

| Path | Tracked | Finding |
|---|---|---|
| `scratch-test-api.php` | yes | **2 lines, a single comment, no executable code.** Pure cruft. |
| `test-grounding.mjs` | yes | 75-line ad-hoc Gemini grounding probe. Reads `process.env.GEMINI_API_KEY`, hardcodes a `beauty`/`AZ` query. Belongs in `scripts/` or nowhere. |
| `.next/` | no (gitignored) | Stale build output, 2026-08-26. |
| `public/dist/` (plugin) | yes | **Shipped bundle is stale:** `index-CdDoAITf.js` / `index-B4blakX_.css` dated 2026-09-23, but `src/` was last changed 2026-10-05. Production is ~2 weeks behind source. |
| `scripts/m3_guides.py:375` | yes (monorepo) | Documents the fresh-mints build output as `apps/fresh-mints/dist/`. Wrong — `vite.config.ts` writes to `wp-content/plugins/xophz-compass-fresh-mints/public/dist`. |

---

## 6. Recommendation

**Retire the Next.js tree.** Port three things first (§2.1), harmonize two type files into
canonical capsules (§4), then delete.

Net deletion after porting: ~11,700 LOC across 50 files, plus the two stray root files and the
Next scaffolding.

**One decision is blocked on the owner and gates the type harmonization:**
for `nursing` and `beauty`, is the correct pricing `quantum` / \$1,250 or `bronze` / \$1,650?
The code cannot answer this; it is a business-data call. Everything else in the plan proceeds
independently.
