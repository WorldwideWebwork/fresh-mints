# Type Error Baseline

**Recorded**: 2026-10-05

**Reproduction command**: `pnpm --filter xophz-compass-fresh-mints check`

**svelte-check version**: 4.7.6

**Summary**: `pnpm check` reports 31 errors across 8 files, plus 24 warnings.

Note the two different file counts, which are easy to conflate. 8 is the number of files
carrying at least one ERROR. svelte-check's own FILES_WITH_PROBLEMS figure is 15, because it
also counts files that carry only warnings.

**Correction (2026-10-07)**: this document originally recorded 27 errors. The measured
count is 31. The four unrecorded errors are all lucide-svelte icon typing in
AnalyticsView.svelte (lines 34, 42, 50, 58), of the form "Type 'typeof DollarSign' is not
assignable to type 'Component<...>'". They are type-only and have no runtime effect.
Neither AnalyticsView.svelte nor StatCard.svelte was edited by the consolidation plan; the
errors surfaced when adding vitest re-resolved workspace peer dependencies, moving the vite
snapshot's @types/node from 25.9.8 to 22.20.4. That dependency movement is consistent with an
environment cause but is NOT demonstrated: no revert experiment was run, and nothing directly
links that resolution change to lucide-svelte's Component typing. What is established is that
the plan did not edit either file, and that commit 92954af also measures 31 under the current
node_modules.

Tasks 1 through 6 each reported 27 before and after, which tracked this document rather than a
fresh measurement.

**Root cause**: `svelte-check` requires a separate `svelte.config.js` file to understand Svelte compiler configuration. Before creating it, every file reported "No Svelte configuration found in vite config" (42 copies of the error), masking 31 real type errors beneath the noise.

## Errors by Root Cause

### 1. PracticeWebsiteTemplate.svelte: Local identifier `state` collides with `$state` rune (14 errors)

A local variable named `state` collides with Svelte's `$state` rune. Svelte reads `$state` as a store subscription, causing both "Block-scoped variable used before declaration" and "Cannot use 'state' as a store" errors on lines 50, 51, 52, 53, 54, 56, and 65 (each line appears twice in the error list due to multiple error types).

**Fix**: Rename the local `state` variable to avoid collision with the `$state` rune. One fix clears all 14 errors.

**Error messages**:
- "Block-scoped variable '$state' used before its declaration" (lines 50, 51, 52, 53, 54, 56, 65)
- "Cannot use 'state' as a store..." (lines 50, 51, 52, 53, 54, 56, 65)

---

### 2. LeadDetailModal.svelte: Null dereferences and invalid Badge variant (7 errors)

Multiple issues:
- `lead` dereferenced without null guards (lines 586, 613)
- `detectedWebUrl` dereferenced without null guards (lines 632, 639, 646)
- Badge component given `variant="secondary"`, which is not in its union type (lines 709, 740)

**Fix**: Add null guards before dereferencing `lead` and `detectedWebUrl`. Change Badge `variant` to one of the supported values ("default", "outline", "success", "info", "warning", "danger").

**Error messages**:
- "'lead' is possibly 'null'" (lines 586, 613)
- "'detectedWebUrl' is possibly 'null' or 'undefined'" (lines 632, 639, 646)
- "Type '\"secondary\"' is not assignable to type '\"default\" | \"outline\" | ...'" (lines 709, 740)

---

### 3. AuthLoginView.svelte: Missing ThemeStore methods (2 errors) [RESOLVED]

Calls to `currentTheme` and `toggleTheme` on `ThemeStore`, neither of which existed on the store.

**Fix**: Updated the view to call `themeStore.toggle()` and evaluate `themeStore.isDark`, aligning with the existing `ThemeStore` API and `DashboardLayout.svelte`.

**Status**: Resolved. Cleared 2 type errors.

---

### 4. ContactBadgeList.svelte: Undefined component reference (1 error) [RESOLVED]

`Globe` component referenced without import, creating an undefined component at runtime.

**Fix**: Added `Globe` to the `lucide-svelte` icon import list.

**Status**: Resolved. Cleared 1 type error.

---

### 5. OutreachGeneratorModal.svelte: Missing required properties (1 error)

`OutreachLogItem` constructed without required `status` and `toneUsed` properties.

**Fix**: Add `status` and `toneUsed` to the object being passed to OutreachLogItem.

**Error message**:
- "Argument of type '{ type: \"email\"; subject: string; content: string; }' is missing the following properties from type 'Omit<OutreachLogItem, \"id\" | \"timestamp\">': status, toneUsed" (line 52)

---

### 6. PlacesSearchView.svelte: Type mismatch (1 error)

`number` assigned where `string` is required.

**Fix**: Ensure the value is cast to string or the receiving parameter accepts numbers.

**Error message**:
- "Type 'number' is not assignable to type 'string'" (line 362)

---

### 7. lead-store.svelte.ts:646: ExistingWebsiteAudit status value not in union (1 error)

`ExistingWebsiteAudit.status` set to `'Website Found'`, which is not in its union type. The union expects `'Has Existing Website'` (used on line 569 for the same concept).

**Fix**: Standardize on a single status value name. Use `'Has Existing Website'` (the value already used elsewhere in the file) instead of `'Website Found'`.

**Error message**:
- "Type '\"No Website Found - High Opportunity\" | \"Website Found\"' is not assignable to type '\"No Website Found - High Opportunity\" | \"Has Existing Website\" | \"Directory Listing Only\" | \"Inconclusive\"'..." (line 646)

---

### 8. AnalyticsView.svelte: lucide-svelte icon typing (4 errors)

Lucide icon components passed to `StatCard` do not satisfy the Svelte 5 `Component` type.
Type-only, with no runtime effect: the icons render correctly.

This section was missing from the original baseline, which is why it recorded 27 instead of 31.

**Fix**: widen the `StatCard` icon prop to the type lucide-svelte actually exports, rather than
casting at each call site.

**Error messages**:
- "Type 'typeof DollarSign' is not assignable to type 'Component<{ class?: string | undefined; }, {}, string>'" (line 34)
- Same shape for `Award` (line 42), `Send` (line 50) and `TrendingUp` (line 58)

---

## Runtime-Crash Class Issues

The following three errors will cause runtime crashes or wrong rendering if not fixed:

1. **AuthLoginView.svelte** (2 errors): Missing `currentTheme` and `toggleTheme` methods will crash when the login view attempts to use them.
2. **ContactBadgeList.svelte** (1 error): Undefined `Globe` component will cause template rendering to fail.
3. **PracticeWebsiteTemplate.svelte** (14 errors): The `$state` collision will cause incorrect reactivity and store subscription behavior.

---

## Recommendations for Later Tasks

- Track that no *new* errors are introduced beyond this baseline of 31
- Consider prioritizing the three runtime-crash class issues above (PracticeWebsiteTemplate, ContactBadgeList, AuthLoginView) as they will fail at runtime, while other issues are strictness violations
