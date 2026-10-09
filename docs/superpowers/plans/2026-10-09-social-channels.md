# Social Channels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Stack Exchange (Personal Finance & Money) and YouTube comments as Social Radar sources, since Reddit now requires pre-approved commercial access.

**Architecture:** Both run server-side behind the existing `POST /wp-json/xophz-freshmints/v1/social/fetch` route, dispatched by its `platform` field, each returning the same outcome union the Reddit provider already returns. Credentials resolve server-side through a small helper on the plugin's existing cascade and never reach the browser. The client's Reddit provider is generalized into one server-backed provider per platform.

**Tech Stack:** PHP WordPress plugin (`wp_remote_get`), Svelte 5 + TypeScript, Vitest.

**Spec:** `docs/architecture/arch-social-radar-server-side.md` in the parent repo's `docs` submodule (sections 3, 6, 9, 10). Owner-approved scope 2026-10-09: Stack Exchange and YouTube only; Bluesky not selected.

## Global Constraints

- **Branches:** `chem-x/social-channels` in `apps/fresh-mints` and in `wp-content/plugins/xophz-compass-fresh-mints`. Never commit on `main`.
- **NO browser testing by anyone.** Do not open or curl `http://mycompass`. Do not run `pnpm build` or the dev server. The owner tests in the browser.
- **Plugin is mounted live** into the `u-wordpress` container: run `docker exec u-wordpress php -l /var/www/html/wp-content/plugins/xophz-compass-fresh-mints/<path>` on every PHP file touched. Smoke via `docker exec u-wordpress wp --allow-root eval '<php>'` with `wp_set_current_user(1)` and `rest_do_request()`. Ignore other plugins' deprecation notices.
- **Gate:** `pnpm check` is **10 errors / 24 warnings** on main (`648266c`); must not rise. Count with `pnpm check 2>&1 | grep COMPLETED # chemx-bypass: chemx typecheck reports errorCount 0`. Tests via chemx `test` action, `pnpm exec vitest run`; suite is 254 passing. No Svelte plugin in vitest: test pure `.ts`.
- **Hook:** source reads, greps, `git log` and `git diff` go through chemx; where it cannot, append `# chemx-bypass: <reason>`.
- **Credentials never enter the browser, a response, a log line or a reason string.** Missing credential means the provider returns `failed` with reason `<Platform> is not configured.` and makes no request.
- **Zero synthetic data.** Missing fields stay empty; never invent.
- No em dashes. No raw DOM in organisms. No nested ternaries in templates. Validate external payloads.
- **Commit trailer:** `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## The contract (fixed; both batches code against it)

`POST /social/fetch` body: `{ platform: 'reddit' | 'youtube' | 'stack_exchange', keywords: string[], targetChannels: string[] }`. Response: exactly one of `{status:'ok', posts}`, `{status:'blocked', reason}`, `{status:'failed', reason}`. Unknown platform: `failed`, reason `Unsupported platform.` Each post carries the 11 `RawSocialPost` keys: `id, platform, externalId, author, title, content, url, timestamp, score, commentsCount, subredditOrChannel`.

The client sends `targetChannels` only for `reddit`; for `youtube` and `stack_exchange` it sends `[]`.

| Field | `stack_exchange` | `youtube` |
|---|---|---|
| `id` | `se-<question_id>` | `yt-<commentId>` |
| `platform` | `stack_exchange` | `youtube` |
| `externalId` | question_id | commentId |
| `author` | owner display name, HTML entities decoded | `authorDisplayName` |
| `title` | question title, entities decoded | the video's title |
| `content` | question body as plain text (HTML stripped, entities decoded) | `textOriginal` |
| `url` | question `link` | `https://www.youtube.com/watch?v=<videoId>&lc=<commentId>` |
| `timestamp` | `creation_date` as ISO 8601 | comment `publishedAt` |
| `score` | `score` | `likeCount` |
| `commentsCount` | `answer_count` | `totalReplyCount` |
| `subredditOrChannel` | `money.stackexchange.com` | the video's channel title |

## Review Focus

1. **YouTube quota.** One `search.list` costs 100 units of a 10,000/day free quota. A scan must make at most one search and cap comment fetches at 5 videos, or a few scans exhaust the day. Task 1.
2. **A quota-exhausted or invalid key.** YouTube returns 403 with a reason; surface it as `failed` with the real status, without echoing the key. Task 1.
3. **Stack Exchange gzip and backoff.** The API always gzips and may send a `backoff` field; honour the response correctly and never treat an error object as an empty `ok`. Task 1.
4. **Mixed-platform rules saved before this change.** A rule targeting `reddit` and `hacker_news` must behave exactly as today. Task 2.
5. **HTML in Stack Exchange bodies and titles.** Must arrive as plain text with entities decoded, so the analyzer and the reply composer never see `&#39;` or tags. Task 1.

---

### Task 1: Plugin providers, credentials helper, route dispatch

**Files:**
- Create: `includes/social/class-freshmints-social-credentials.php`, `includes/social/providers/class-freshmints-social-provider-stackexchange.php`, `includes/social/providers/class-freshmints-social-provider-youtube.php`
- Modify: `includes/social/class-freshmints-social-rest.php` (dispatch on `platform`), `xophz-compass-fresh-mints.php` (`require_once` the three new files)

**Interfaces:**
- `Freshmints_Social_Credentials::get( string $key ): string`. Recognized keys: `youtube_api_key`, `stackexchange_key`. Resolution: option `xophz_compass_freshmints_social_<key>`, then constant `XOPHZ_COMPASS_FRESHMINTS_SOCIAL_<KEY>`, then `$_ENV` of the same name. Returns `''` when unset. Unrecognized key returns `''`.
- `Freshmints_Social_Provider_Stackexchange::fetch_posts( array $rule ): array` and `Freshmints_Social_Provider_Youtube::fetch_posts( array $rule ): array`, same outcome shape and same `$rule` keys as the Reddit provider.

**Stack Exchange:** `https://api.stackexchange.com/2.3/search/advanced` with `site=money`, `sort=creation`, `order=desc`, `pagesize=15`, `filter=withbody`, and `key` only when `stackexchange_key` is set (it is a non-secret quota key; keyless allows 300 requests/day). Keywords are OR'd: query per keyword, at most 3 requests, dedupe by `question_id`. Works with no credential.

**YouTube:** requires `youtube_api_key`, else `failed` "YouTube is not configured." One `search.list` (`part=snippet`, `type=video`, `q` = keywords joined with `|`, `order=date`, `maxResults=5`, `relevanceLanguage=en`), then `commentThreads.list` (`part=snippet`, `maxResults=20`, `order=time`, `textFormat=plainText`) for each of those at most 5 videos. A video with comments disabled (403 `commentsDisabled`) is skipped, not a failure of the scan. A key or quota error on `search.list` is `failed` with the HTTP status and Google's `reason` string, never the key.

- [ ] **Step 1:** Implement all three classes and the dispatch.
- [ ] **Step 2:** `php -l` every touched file.
- [ ] **Step 3:** Smoke with wp-cli: Stack Exchange `keywords:["annuity"]` returns `ok` with real questions (paste two titles and URLs); YouTube with no key returns "YouTube is not configured."; `platform:"nope"` returns "Unsupported platform."; Reddit still returns its disabled reason.
- [ ] **Step 4:** Commit in the plugin repo, staging files by path.

---

### Task 2: Client server-backed providers, platform types, UI toggles, preset

**Files:**
- Modify: `src/lib/services/social-feed/types.ts`, `src/lib/services/social-feed/providers/reddit-public-provider.ts`, `src/lib/services/social-feed/social-feed-registry.ts`, `src/lib/services/social-feed/rule-presets.ts`, `src/lib/components/organisms/SocialRadarView.svelte`
- Create: `src/lib/services/social-feed/providers/server-feed-provider.ts`, `src/lib/services/social-feed/providers/server-feed-provider.test.ts`

**Interfaces:**
- `SocialPlatform` gains `'youtube' | 'stack_exchange'`.
- `createServerFeedProvider(platform: 'reddit' | 'youtube' | 'stack_exchange', displayName: string): SocialFeedProvider`. Posts to the route above, validates the response exactly as the Reddit provider does today, sends `targetChannels` only for `reddit`.
- `RedditPublicProvider` stays exported (other code imports it) and delegates to the factory, preserving its current display name and behavior.
- The registry registers YouTube (`'YouTube Comments'`) and Stack Exchange (`'Stack Exchange: Personal Finance & Money'`) alongside Hacker News and Reddit.
- `ANNUITY_EDUCATION_PRESET.platforms` becomes `['stack_exchange', 'youtube']`, and its `targetSubreddits` becomes `[]`. Reddit is removed from it because it is disabled pending approval and would put a failure in the banner on every scan.
- SocialRadarView: the rule modal offers toggles for all four platforms. Lead platform badges use a descriptor map (no nested ternary) so each platform gets a distinct, readable badge.

- [ ] **Step 1:** Tests: factory posts the right body per platform, sends channels only for reddit, maps `ok`/`blocked`/`failed`, rejects a malformed post; Reddit behaves as before; preset uses the new platforms with no Reddit; registry exposes all four platforms.
- [ ] **Step 2:** Run; expect failure.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Tests and `pnpm check` (no new errors).
- [ ] **Step 5:** Commit.
