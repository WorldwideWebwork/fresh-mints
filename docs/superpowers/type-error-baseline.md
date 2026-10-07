# Type Error Baseline

**Recorded**: 2026-10-05

**Reproduction command**: `pnpm --filter xophz-compass-fresh-mints check`

**svelte-check version**: 4.7.6

**Summary**: `pnpm check` reports 27 errors and 24 warnings in 14 files.

**Root cause**: `svelte-check` requires a separate `svelte.config.js` file to understand Svelte compiler configuration. Before creating it, every file reported "No Svelte configuration found in vite config" (42 copies of the error), masking 27 real type errors beneath the noise.

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

### 3. AuthLoginView.svelte: Missing ThemeStore methods (2 errors)

Calls to `currentTheme` and `toggleTheme` on `ThemeStore`, neither of which exist on the store.

**Fix**: Implement missing methods on `ThemeStore` or update the view to use the correct API.

**Error messages**:
- "Property 'toggleTheme' does not exist on type 'ThemeStore'" (line 110)
- "Property 'currentTheme' does not exist on type 'ThemeStore'" (line 114)

**Classification**: Runtime-crash class. This will fail at runtime when the login view tries to call these methods.

---

### 4. ContactBadgeList.svelte: Undefined component reference (1 error)

`Globe` component referenced without import, creating an undefined component at runtime.

**Fix**: Add missing import for `Globe` component.

**Error message**:
- "Cannot find name 'Globe'" (line 47)

**Classification**: Runtime-crash class. The component will not render; template will fail with "component is not defined".

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

## Runtime-Crash Class Issues

The following three errors will cause runtime crashes or wrong rendering if not fixed:

1. **AuthLoginView.svelte** (2 errors): Missing `currentTheme` and `toggleTheme` methods will crash when the login view attempts to use them.
2. **ContactBadgeList.svelte** (1 error): Undefined `Globe` component will cause template rendering to fail.
3. **PracticeWebsiteTemplate.svelte** (14 errors): The `$state` collision will cause incorrect reactivity and store subscription behavior.

---

## Recommendations for Later Tasks

- Track that no *new* errors are introduced beyond this baseline of 27
- Consider prioritizing the three runtime-crash class issues above (PracticeWebsiteTemplate, ContactBadgeList, AuthLoginView) as they will fail at runtime, while other issues are strictness violations
