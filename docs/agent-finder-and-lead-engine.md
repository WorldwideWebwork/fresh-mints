# Agent Finder and Lead Engine

What the annuity pilot stack does today, in plain language. It covers four things that work together:

| Part | What it does | Where it lives |
| :--- | :--- | :--- |
| Agent Finder | Finds newly licensed insurance agents in Texas and Iowa every week and hands them to HighLevel | `xophz-compass-fresh-mints` plugin |
| Lead Engine | Finds public posts where someone asks about annuities, drafts an education-first reply, and attaches a tracked link to the guide page. A person reviews and sends every reply | Social Radar (this app) and the same plugin |
| Lead Magnet capture | The guide page form. Records consent, stores the lead, passes it to HighLevel | `xophz-compass-lead-magnet` plugin |
| Pilot report | Monthly counts and the billable-leads CSV | This app (Pilot Report) and the same plugin |

How a lead moves:

```
Post on Reddit, YouTube or Stack Exchange
  -> Social Radar scores it against the annuity rule pack
  -> a person edits and sends the reply (the app never posts anywhere)
  -> reply carries a link to the guide page, with tracking parameters
  -> visitor fills the form, ticks the consent box (or leaves the phone blank)
  -> lead stored with the consent text they saw
  -> HighLevel receives it as lead_magnet_opt_in with consent tags
  -> Pilot report counts it

State licence registry (Texas, Iowa)
  -> weekly sync finds first-time licensees
  -> HighLevel receives each as agent_finder_new_agent, tagged no_consent_yet
```

Plugin READMEs hold the route-level detail. This page is the whole picture:
[Fresh Mints README](../../../wp-content/plugins/xophz-compass-fresh-mints/README.md),
[Lead Magnet README](../../../wp-content/plugins/xophz-compass-lead-magnet/README.md). Each plugin's `docs/CHANGELOG.md` records what changed and when.

## 1. Agent Finder

### Sources

| State | Dataset | Terms |
| :--- | :--- | :--- |
| Texas | Texas Department of Insurance producer licences, data.texas.gov dataset `kxv3-diwf` (read through the Socrata API) | Public open data |
| Iowa | Iowa Insurance Division "Insurance Producers Licensed in Iowa", Iowa Data Hub dataset 669 (a 52 MB zipped CSV export, about 232,000 rows) | CC BY 4.0. The credit must travel with the data |

The Iowa credit, exactly as the plugin attaches it to every Iowa response and lead:

> Source: Iowa Insurance Division, "Insurance Producers Licensed in Iowa", Iowa Data Hub (https://data.iowa.gov/catalog/dataset/669), licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Filtered and reformatted by Fresh Mints.

No restriction on solicitation was found in the Iowa dataset terms; data@iowa.gov can confirm in writing. The Iowa Data Hub has no query API. The adapter downloads the export, filters it while it streams, and caches the few people it keeps for six hours. A cold fetch takes about 8 to 10 seconds. If the download fails, is not a readable zip, lacks a needed column, has fewer than 10,000 rows, or runs out of its time budget, the adapter returns no leads, marks the run incomplete and caches nothing.

The Texas dataset has no street address, phone or email. The Iowa dataset publishes a business email, phone and address; see "Iowa contact details" below.

Other states were checked. See [research/state-licensee-open-data.md](research/state-licensee-open-data.md) for which publish usable data, which sell lists, and which have no list.

### What "newly licensed" means

The rule is the same in spirit and different in mechanics, because the datasets differ.

| | Texas | Iowa |
| :--- | :--- | :--- |
| Dataset rows are | One per licence | One per person |
| A person counts when | Their earliest licence of any line, anywhere in the dataset, has an issue date on or after the window start, and they hold a life qualification on a licence row with a Texas address issued in the window | `first_active_date` is on or after the window start, `iowa_resident` is Y, the mailing-address state is IA, and `loa_has_life` is Yes |
| How it is checked | Candidate life rows in the window, then a per-NPN `min(license_issue_date)` check across every row of that NPN | One date comparison. `first_active_date` is already the first date and renewals do not reset it |
| A person without an NPN | Skipped and counted (3 of 2,857 rows in one 30-day window) | Not applicable |
| If a check cannot be made | The person is left out, never passed unchecked. The run is marked incomplete | Same |

The window starts at midnight UTC, N days back from today.

A Texan who has held a licence for years and just added a life line is not returned. The older "any life licence in the window" behaviour still exists behind a parameter, and nothing uses it.

Known limits of the rule:

- The Texas dataset appears to hold only current licences. Someone whose earlier licence lapsed and dropped out would look first-licensed.
- Iowa's date is the first date in Iowa, not the first licence anywhere. A resident who moved to Iowa and converted a licence still looks new. Of 139 Iowa residents first active in the last 365 days who also appear in the Texas data, 9 held an older Texas licence.

Size on 2026-10-12: Texas about 435 people for 7 days and 2,631 for 30. Iowa 18 for 7 days and 117 for 30.

### annuity_capable

Each stored agent has a true or false `annuity_capable` flag. It is set from the person's whole record in the window, not from one licence row.

| State | True when |
| :--- | :--- |
| Texas | They hold any life qualification in the window that is `Life, Accident, Health & HMO` or `Life Agent/Agency`. Every other life qualification is stored false |
| Iowa | The dataset's `loa_has_life` line of authority is Yes. Iowa Code 522B.6(2)(a) says the life line covers life insurance "including benefits of endowment and annuities", so every stored Iowa agent is true. The variable line is not used as a stand-in |

`first_issue_date` is likewise the person's first licence date (Texas: the date from the first-issue check, which for a few people is earlier than their life licence; Iowa: `first_active_date`).

### Schedule and catch-up windows

| Item | Behaviour |
| :--- | :--- |
| When | Weekly. The first slot is the next Monday at 12:00 UTC |
| Scheduler | Action Scheduler (WooCommerce ships it) when loaded, otherwise WP-Cron. Only one of them holds the event. Set the filter `freshmints_agent_finder_use_action_scheduler` to false to force WP-Cron |
| Re-checked | On `init`, at most every 6 hours. Activation sets it up and deactivation removes it. The tables and rows are kept on deactivation |
| States | Texas, then Iowa, as separate runs. Each state keeps its own record of when it last completed |
| Window | 7 days. If the last fully completed run for that state ended longer ago than that, the window reaches back to it, up to 30 days |
| Beyond 30 days | Runs 30 days and records the run as complete with the code `window_capped`. The gap beyond 30 days cannot be recovered |
| Overlap | The window start rounds down to midnight UTC, so there is always at least a day of overlap. That absorbs rows published late. Storing by NPN makes overlap free |
| Limits | 10,000 leads and 120 seconds per state |
| Partial run | A request failure, the time budget, a row cap or an exception records the run as partial with a code (`registry_incomplete`, `registry_unavailable`, `sync_exception`, `lead_limit_reached`). Its verified agents are kept. A partial run does not count as completed, so the next window still reaches back |
| Two syncs at once | A lock option stops it. A second call gets HTTP 409 `freshmints_agent_finder_running`. A dead lock is taken over after 15 minutes |

Iowa keeps the last 400 days of first-active people in its cache. A window longer than that returns what the cache holds and marks the run incomplete.

### Storage

Two tables, created on activation and upgraded on the next request (`dbDelta`, current version 2). They were chosen over a post type for lookup by NPN, paging over thousands of rows, and a unique key that makes the sync repeatable.

- `{prefix}freshmints_af_agents`: one row per person, `npn` unique. Fields: name, licence type, qualification, `annuity_capable`, `first_issue_date`, city, state, ZIP, source label, `registry_contact` (Iowa only, JSON), the run that first saw the person, and delivery columns (`delivery_status` pending, delivered or failed; `delivered_at`; `attempts`).
- `{prefix}freshmints_af_runs`: one row per state per run. Fields: state, trigger (`cron` or `manual`), start and finish, window start and end, found, new, skipped, partial, error code, duration. A run with no finish time was interrupted.

Rules that follow from the design:

- The first sighting wins. The sync never rewrites an existing row, delivered or not, so a fix to how values are computed applies only to agents stored afterwards.
- A person licensed in both states is stored once, from whichever state ran first. A lead with no NPN or no name is skipped and counted in `skipped`.
- Nothing is invented. Every stored value is the registry's own.

### Iowa contact details

Iowa publishes a business email, phone and address. They are stored in `registry_contact` and shown to administrators on `GET /agent-finder/agents`. They are not sent to HighLevel, and every agent is still tagged `no_consent_yet`. Public business contact details are not consent to be contacted: CAN-SPAM and the Do Not Call rules apply to how they are used. The filter `freshmints_registry_producers_ia_include_contact` turns them off.

### Admin REST routes

All routes are under `/wp-json/xophz-freshmints/v1/` and require `manage_options` (anonymous gets 401, other users 403).

| Route | What it does |
| :--- | :--- |
| `GET /agent-finder/runs?page&per_page` | Runs, newest first, with state, counts, partial flag and error code. Also carries the `delivery` summary |
| `GET /agent-finder/agents?page&per_page&since&annuity_capable&delivery_status` | Stored agents, newest first. `since` is an ISO date compared with first-seen time. `per_page` is at most 100. Bad values answer 400. Carries `registryContact` and the `delivery` summary |
| `POST /agent-finder/run-now` | Runs every state now, synchronously. Answers `{ runs: [...] }`, one per state. A 7-day run takes 3 to 6 seconds, a Texas 30-day catch-up 12 to 32 seconds, and the first Iowa run adds a 52 MB download |
| `POST /crm/retry-deliveries` | Retries HighLevel deliveries now. See below |
| `POST /registry/fetch-live` | The manual "Discover Newly Licensed Professionals" lookup in the app. Serves Texas and Iowa, uses the same first-licence rule, clamps `limit` to 100, and puts the Iowa credit in `groundingNotes` |

The Svelte app does not yet show the Agent Finder runs, agents or delivery status. They are REST only.

### Delivery into HighLevel

Everything goes to one webhook URL held in the Connectors API as `crm_webhook_url` (constant and env var `COMPASS_CRM_WEBHOOK_URL`). The URL never reaches the browser, a response or a URL parameter. HighLevel is called from the server only.

**Events.** Both use the relay's envelope: `event`, `timestamp`, `count`, `data`, `source`. Contact fields and `tags` sit inside `data`, in snake_case.

| Event | When |
| :--- | :--- |
| `agent_finder_new_agent` | Once per new agent |
| `lead_magnet_opt_in` | Once per captured lead (see section 3) |

The browser route `POST /crm/webhook` rejects both names (400), so only server code can say an agent was found or a lead consented.

**Agent fields** (`data`): `agent_id`, `name`, `npn`, `license_type`, `qualification`, `annuity_capable`, `first_issue_date`, `city`, `state`, `zip`, `source_label`, `consent_given` (always false), `contact_channels` (always empty), `tags`.

**Agent tags:** `agent_finder`, then `annuity_capable` or `not_annuity_capable`, then `no_consent_yet`. No email or phone key is sent.

`no_consent_yet` means this person never agreed to a call or text. A HighLevel workflow must not auto-call or auto-text anyone carrying it.

**How passes run**

| Item | Behaviour |
| :--- | :--- |
| Trigger | The action `freshmints_agent_finder_new_agents( int[] $ids, string $state )` after a sync that stored agents, and the weekly sync hook, so a week with no new agents still retries leftovers |
| Batch | One background pass reads `pending` and `failed` rows with fewer than 5 attempts, in id order. It sends at most 50, or 20 seconds' worth, with 0.1 s between sends, then queues the next pass until nothing is left |
| Retries | A failed row is retried on the next run, not five times in a row. It stops at 5 attempts |
| Circuit breaker | Three failures in a row end the pass (`circuit_open`). The untried rows stay `pending` with 0 attempts and nothing is queued until the next run or the retry route |
| Two passes at once | A lock option stops it. A dead lock is taken over after 10 minutes |
| Runner | Action Scheduler async actions, or WP-Cron if it is not loaded. The queue needs normal site traffic or a real cron hitting `wp-cron.php` |

**Retry route.** `POST /crm/retry-deliveries` with an optional boolean `reset_attempts`. It runs one agent pass and one lead pass now (about 30 seconds worst case) and schedules the rest. `reset_attempts` gives failed agents and leads their attempts back, which is the only way past the 5-attempt cap.

**Not configured.** If `crm_webhook_url` is empty:

- Nothing is sent and no HTTP call is made.
- Agents and leads stay `pending`.
- Both Agent Finder list responses carry `delivery: { configured: false, message: "HighLevel webhook not configured", maxAttempts, agents: {pending, failed, delivered, exhausted}, leads: {...}, lastBatch }`.
- The retry route answers 400 `freshmints_crm_webhook_not_configured`.
- Setting the URL later does not flush the backlog. That is deliberate: the HighLevel workflow should be gated first. The next weekly sync or one call to the retry route sends it.

If the webhook answers but keeps failing, `delivery.message` says HighLevel is not accepting deliveries.

## 2. Lead Engine (Social Radar)

### Platforms

| Platform | Where it runs | Pilot report "posts found" |
| :--- | :--- | :--- |
| Reddit | Server (official Data API) | Counted |
| YouTube | Server | Counted |
| Stack Exchange | Server | Counted |
| Hacker News, Bluesky, X | In the browser | "n/a" (the server never sees them) |

The annuity rule pack targets Reddit, YouTube and Stack Exchange. The Reddit connection is read only: search and a post-status check. The app never posts to any platform. Dispatching a reply sends it to the dispatch webhook (a Slack, Discord or Zapier URL held in the `social_dispatch_webhook_url` connector, env var `COMPASS_SOCIAL_DISPATCH_WEBHOOK_URL`) or, with no webhook set, copies it for a person to paste. Either way a human sends it.

### Reddit access

Reddit goes through the official Data API with app-only OAuth (`client_credentials`). There is no public-JSON fallback.

| Connector id | Constant and env var | Setting |
| :--- | :--- | :--- |
| `reddit_client_id` | `REDDIT_CLIENT_ID` | `compass_reddit_client_id` |
| `reddit_client_secret` | `REDDIT_CLIENT_SECRET` | `compass_reddit_client_secret` |
| `reddit_username` | `REDDIT_USERNAME` | `compass_reddit_username` |

Each is registered only if no other plugin (such as YouMeOS Topic Radar) has registered it first, in which case Fresh Mints reads whatever names that registration declares. `reddit_username` is Fresh Mints' own: Reddit requires the User-Agent to name the account, and the app will not invent one. The client id, secret and username are the owner's, from https://www.reddit.com/prefs/apps. Keys are read only through `Freshmints_Connectors::get_key`.

| Item | Behaviour |
| :--- | :--- |
| Not configured | Any of the three missing or malformed: the provider answers `failed` / "Reddit is not configured." with zero HTTP calls |
| Token | `POST https://www.reddit.com/api/v1/access_token`, cached server-side until about two minutes before it expires. A new client id never reuses the old token. A 401 on a search renews once, never loops |
| Requests | `https://oauth.reddit.com`, `Authorization: bearer ...`, User-Agent `wordpress:TopicRadar:v<plugin version> (by /u/<username>)` |
| Rate limits | When Reddit reports fewer than 2 requests left, the provider pauses until its reset time. A 429 pauses for `Retry-After`, else the reset header, else 60 seconds. Pauses are capped at 600 seconds. A paused call answers `failed` with the seconds to wait and makes no request |

Reddit's Data API terms ask commercial users to apply for access. The free tier covers non-commercial use, and this app searches for business leads. As of the build this came from secondary summaries, because Reddit's help pages could not be fetched. Confirm it in Reddit's current terms when applying. No live call to Reddit has been made yet: the response field names used by the live check are as documented but untested against live Reddit.

### Reddit data rules

Written to meet the Reddit Data API terms: store minimal fields, keep them for a short time, drop what Reddit has deleted or removed, build no user profiles, no AI training. The Fresh Mints README's "Reddit data handling" section is the plugin-side statement.

| Rule | What the code does |
| :--- | :--- |
| Minimal fields | A lead keeps the post id, title, permalink, subreddit, created time and score, plus our own output (rule, keyword, intent score, pain-point label, draft reply, status, evaluated time). The post body is read once to score the post and is never stored. The same applies to every platform. Leads live in the browser (localStorage `fresh_mints_social_leads`) |
| Author | The handle is kept only while the lead is open for a reply (status `radar`). Converting or dismissing removes it, and removes it from the draft reply too |
| Retention | The setting "Social Radar Retention (days)" under Settings > Fresh Mints. Default 30, allowed 1 to 90. The app deletes every lead older than it, counted from when the lead was taken in, on load and after each scan. If the server cannot be read it uses the last value it read, else 30 |
| Live check | `POST /social/live-check` takes up to 100 Reddit post ids and asks Reddit once (`/api/info`). A post is gone when it has a removal category, its author or body is `[deleted]` or `[removed]`, or Reddit does not return it. The app runs it on load, after each scan, and right before a reply is dispatched. A gone post drops the lead |
| Fail closed | If Reddit is not configured, is rate limited or cannot be reached, the route returns no verdicts. The app keeps the leads, says it could not re-check them, and refuses to dispatch a Reddit reply until it can confirm the post is live |
| No profiles | Nothing groups or looks up leads by author. A Reddit lead converted to a CRM lead is named `Reddit thread: <title>`, not for the person |
| No AI training | No Reddit text or handle is sent to an AI model, and nothing trains one. The intent score is a fixed pattern match. The CRM actions that call Gemini send the CRM lead's name, which for a converted Reddit lead is the thread title |
| Server storage | The server stores no social post. Its only Reddit state is the OAuth token, the rate-limit pause, and the pilot counters below |

### Annuity rule pack and reply template

The pack is opt-in. Nothing is seeded. In Social Radar choose "Add annuity rule pack". The older "Add annuity education preset" button is separate and unchanged.

| Part | Value |
| :--- | :--- |
| Keywords | annuity, annuities, MYGA, fixed indexed annuity, CD vs annuity, retirement income, lump sum pension |
| Negative keywords | Finance-class and formula posts (annuity formula, present value, homework, Excel), loan and amortization posts, UK pension and ISA posts, structured settlements |
| Platforms | Reddit, YouTube, Stack Exchange |
| Subreddits | retirement, personalfinance, financialplanning, annuities |
| Minimum intent score | 50 |

The reply has four short teaching sentences, then one line offering the guide, then the disclosure:

> Hi {author}, this is general education, not advice for your situation. An annuity is a contract with an insurance company: you hand over a lump sum or a series of payments, and the contract spells out when and how income is paid back to you. The common types are immediate, fixed, fixed indexed and variable, and they differ in how growth is credited and how much flexibility you keep. Before comparing any of them, check the surrender period, the fees, and what happens to the remaining balance if you pass away.
>
> A plain-English guide to those questions is here if it helps: {funnel_link}
>
> Disclosure: I'm a licensed insurance agent.

Rules baked into the template and enforced by its tests: no guarantees, no "safe money", no rates or returns, no tax claims, no carrier or product names, no sales words, and the reply always ends with the disclosure line exactly. The guide line sits on its own line and is dropped when no guide page URL is set, so a reply without the link still teaches and still ends with the disclosure. The dispatch message says when the link was left out.

The template, disclosure and negative keyword list have not had a compliance review.

### Attribution parameters

The guide link is built from the "Guide page URL" in Social Radar > Settings:

```
<guide page URL>?utm_source=<platform>&utm_medium=social_reply&utm_campaign=<rule id>&fm_thread=<encoded thread URL>&fm_reply=<social lead id>
```

| Parameter | Value |
| :--- | :--- |
| `utm_source` | The platform (`reddit`, `youtube`, `stack_exchange`) |
| `utm_medium` | Always `social_reply` |
| `utm_campaign` | The rule id, form `rule-<epoch ms>` |
| `fm_thread` | The thread URL, encoded |
| `fm_reply` | The app's own lead id, form `lead-social-<epoch ms>-<n>` |

Parameters already on the guide URL are kept. A repeated `utm_*` is replaced. There is no per-prospect path segment. Attribution is opt-in per rule (`attributeFunnelLink`). The annuity pack turns it on. Older rules and the education preset keep the plain `<base>/<slug>` link.

The capture form reads these five parameters from the page URL and stores them with the lead, so a billable lead can be traced back to the reply that brought it.

### Dispatch and pilot counters

On dispatch the app sends the reply text and its lead id (`leadId`, the same value as `fm_reply`) to `POST /social/dispatch`. For Reddit leads it first re-checks that the post is still live.

The server keeps two kinds of counter for the pilot report, in the table `{prefix}freshmints_pilot_events` (created on first use):

| Event | Recorded when |
| :--- | :--- |
| Search | A server-side search answered `ok`. Stores platform, number of posts returned, time. A blocked or failed run counts nothing |
| Reply | The dispatch webhook accepted the reply (`via=webhook`), or no webhook is set and the app copied it (`via=copy`). Stores platform, the lead id, how it went, time. A webhook that rejects or cannot be reached counts nothing |

No post text, title, author, URL, subreddit, keyword or reply text is stored, so the retention window does not apply to these rows. A reply counts once per lead id however many times it is dispatched.

## 3. Lead Magnet capture

### The form

`[lead_magnet_capture offer="annuity-checklist" button="..."]` renders an unstyled, accessible form. Themes style the `lead-magnet-capture__*` classes. Fields:

| Field | Rule |
| :--- | :--- |
| Name | Required, up to 100 characters |
| Email | Required, valid |
| Phone | Optional. A US number, stored as `+1XXXXXXXXXX` |
| State | Required. A USPS code for the 50 states or DC |
| Question | Optional, up to 1,000 characters |
| Consent checkbox | Separate and unchecked by default |

The form stays hidden until Settings > Lead Magnet has a seller name and a privacy policy URL (the URL falls back to the WordPress privacy page). Until then visitors see "This form is not available right now." and administrators see what to set. Both settings are plain options, not Connectors values, because they are not secrets. The form posts to `POST /wp-json/lead-magnet/v1/capture`.

Protections, in the order the route applies them:

1. Form nonce (`lm_nonce`). A bad or expired nonce answers 403 "This form has expired."
2. Seller and privacy URL configured, else 503.
3. 10 posts an hour per IP (`REMOTE_ADDR`), else 429. Filter: `xophz_lead_magnet_rate_limits`. Counters are keyed on a hash of the IP or email.
4. Honeypot field `website`: a filled one gets the same success reply and stores nothing.
5. Field validation, else 400 with errors by field.
6. Consent wording unchanged since the form loaded (`consent_version`), else 409.
7. 3 posts an hour per email, else 429.

### Consent rules and channels

Calling or texting needs prior express written consent. Email does not.

| Phone | Box | Result | `consent_given` | `contact_channels` |
| :--- | :--- | :--- | :--- | :--- |
| Blank | Unchecked | Stored | false | `email` |
| Blank | Checked | Stored | true | `email` |
| Entered | Unchecked | Refused, 400: "To be called or texted, check the consent box. To be contacted by email only, clear the phone number." | n/a | n/a |
| Entered | Checked | Stored | true | `email`, `phone`, `sms` |

The consent statement is built in one place and shown under the checkbox:

> By checking this box, I give my prior express written consent for [Seller] to contact me about annuities and related insurance products at the phone number and email address I entered above, including by calls and text messages made with an automatic telephone dialing system or an artificial or prerecorded voice, and by email. I understand that my consent is not a condition of any purchase. Message and data rates may apply. Message frequency varies. Reply STOP to stop texts, or use the unsubscribe link in any email. See our Privacy Policy.

The wording is a working draft. A lawyer must approve it before the form goes live. Changing it affects only leads captured afterwards, because each lead stores the exact text it was shown and a fingerprint of that text and the privacy URL.

### What is stored

Each lead is a private `compass_lead` post under the COMPASS menu. Only administrators (`manage_options`) can read it. It is not in the REST API, and leads are not deleted when the plugin is uninstalled.

| Group | Fields |
| :--- | :--- |
| Lead | name, email, phone, state, question, offer |
| Consent | `consent_given`, `consent_text`, `consent_version`, `seller`, `privacy_url`, `contact_channels` |
| Context | `captured_at` (UTC), `ip`, `user_agent`, `page_url` (kept only if it is on this site) |
| Attribution | `utm_source`, `utm_medium`, `utm_campaign`, `fm_thread`, `fm_reply` |

The Leads screen has an "Export consent records (CSV)" button for administrators. Cells that a spreadsheet could run as a formula get a leading quote.

### The action and the route to HighLevel

After a lead is stored the plugin fires `xophz_lead_magnet_lead_captured( $lead )` once. The Fresh Mints plugin listens:

1. It marks the lead `pending` on its own post (meta `_freshmints_crm_delivery`, `_freshmints_crm_attempts`, `_freshmints_crm_delivered_at`).
2. It queues a background send, so the visitor's request never waits on HighLevel.
3. It posts the event `lead_magnet_opt_in` to `crm_webhook_url`.

Fields in `data`: `lead_id`, `name`, `email`, `phone`, `state`, `question`, `offer`, `consent_given`, `contact_channels`, `consent_text`, `consent_version`, `captured_at`, the five attribution values, `tags`. IP address and user agent are not sent.

| Tag | When |
| :--- | :--- |
| `lead_magnet` | Always |
| `offer_<slug>` | Always. Prefixed on purpose: the offer text comes from the visitor, and a bare slug could read `consent_sms` and switch on texting they never agreed to |
| `consent_email` | There is an email |
| `consent_phone` | `contact_channels` holds `phone` |
| `consent_sms` | `contact_channels` holds `sms` |

The phone number is sent only when the channels include `phone` or `sms`. Unknown channel names in a record are dropped.

Failed sends are retried after 5 minutes, 30 minutes, 2 hours and 6 hours, then stop at 5 attempts. A delivered lead is never sent twice. The not-configured behaviour is the same as for agents (section 1). Leads captured before delivery shipped carry no delivery state and are never sent; they need a one-off CSV import.

### The educator landing page

In the block editor choose Patterns > Lead Magnet > "Annuity educator landing page" (`xophz-lead-magnet/annuity-educator`). It uses core blocks only, so any theme renders it.

| Section | Contents |
| :--- | :--- |
| Hero | A heading and a one-sentence promise |
| Videos | Three YouTube embed slots with a caption under each |
| Questions people ask | Three expandable question and answer blocks |
| Capture | A heading, a lead-in and the `[lead_magnet_capture offer="annuity-checklist"]` shortcode |
| Footer | A compliance paragraph |

Every line except the "Questions people ask" heading is a bracketed instruction. The pattern holds no names, credentials, testimonials, numbers, rates or guarantees. Replace every bracket before publishing: a bracket left in place is shown as written. On the public page an unfilled video slot is left out, the whole video section is left out if no slot has a URL, and the compliance-review note is always left out. The editor shows everything. The compliance reviewer should approve the answers and write the licensed-agent disclosure for the footer.

## 4. Pilot report

Open "Pilot Report" in the app sidebar (route `#/pilot_report`). Admin only. Pick a month, or press Refresh. The CSV button downloads the billable leads.

Server routes: `GET /xophz-freshmints/v1/pilot-report?month=YYYY-MM` and `GET /xophz-freshmints/v1/pilot-report/billable?month=YYYY-MM`. A month runs from midnight on the 1st to midnight on the 1st of the next month in the site's timezone. A bad month answers 400. The app's month picker offers the last 12 months by the browser's clock.

### What each number means

| Number | Meaning |
| :--- | :--- |
| Posts found | Posts each server-side search returned, added up per search. A post that two searches both return counts twice, because no post ids are kept. Hacker News, Bluesky and X are not counted |
| Replies sent | Distinct reply lead ids dispatched in the month. If no dispatch webhook is set, a dispatch still counts and the card shows how many went through the webhook |
| Opt-ins | Lead Magnet leads captured in the month. A lead belongs to a platform when `utm_medium` is `social_reply` and `utm_source` is a known platform. Every other lead is "Other sources" |
| Opt-ins with call or text consent | Of those, leads whose stored channels include `phone` or `sms` |
| Billable leads | Of those with call or text consent, leads that also have a valid US phone, a valid email and a name, once per email address in the month. A repeat is counted in `duplicates_excluded` and not billed |
| Agents delivered | Agent Finder rows with `delivery_status` delivered, grouped by delivery time into weeks that start Monday on the site's clock. Weeks with none show 0 |

A valid US phone is `+1` followed by an area code and exchange that both start with 2 to 9.

Someone who signs up again next month is billable again, because the report sees one month at a time. The Billable leads card shows the count times $75 a lead as an invoice figure. The report counts. It does not invoice.

### "n/a" means unknown

A count is `null`, shown as "n/a", never 0, when the report cannot know it:

- The pilot counters table is not ready yet.
- The Lead Magnet plugin is not active.
- The Agent Finder table or its delivery columns are missing (the agents block answers `available: false` with a reason).
- The platform's searches do not run on the server.

A real 0 means "counted, and none".

### The CSV

Columns: `name`, `email`, `phone`, `state`, `created`, `source_platform`, `thread_url`. One row per billable lead, with formula guards on every cell. A `javascript:` thread URL is dropped.

Before sending an invoice, delete test sign-ups. The report counts every lead the form stored, so the owner's own browser tests will appear as billable. Rows with source "other" are sign-ups with no reply attribution.

## 5. Contact data honesty

Earlier builds showed confidence scores, "verified" labels and Do Not Call clearances that no check had produced. The app no longer claims what it did not check.

| Was | Now |
| :--- | :--- |
| A fixed 98%, 95%, 92%, 90%, 88%, 85% or 30% "confidence" on phones and websites | No score unless a real verification produced one. A phone shows its source instead: `Google Places`, `NPPES NPI Registry`, `Yelp`, `Website (<host>)`, `CSV import` |
| "Mobile (Carrier Verified)" and "Verified Practice Line" | `Unknown` (a Google listing phone shows `Google Business Line`) |
| "Clean - Not on DNC List", and "Public Business Directory" in the DNC column | `Unknown`. The app never sets a cleared Do Not Call status because it runs no Do Not Call lookup |
| "Valid & Deliverable (98% Score)", "Website Scraped & Verified", "Grounding Verified" | "Unverified", "Found on website, not verified", "Not checked". A guessed address reads "Guessed from domain, not verified" |
| "Phone verified", "Contact Verified" and "Verified Phone" in labels and tooltips | "Phone on file", "Skip-Traced Contacts" and "Phone" |

A test fails the suite if any of the old claims reappears in source.

What is still real: the MX badge comes from a live DNS lookup. It shows the domain has mail servers, not that any mailbox exists.

The dial queue in Rep Hub ("Ready to Dial") filters on having a phone and an outreach status. It does not check Do Not Call, because nothing yet produces a cleared status. If calls are allowed, scrub numbers against the National Do Not Call Registry before dialing. See the TCPA section of [research/agent-contact-enrichment.md](research/agent-contact-enrichment.md).

### Legacy normalization

Leads saved by older builds still hold the old claims. They are cleaned in three places. Each pass returns the same object when nothing needs changing, so running twice changes nothing, and the input is never modified in place.

| Where | When |
| :--- | :--- |
| Load | The app normalizes saved leads and writes back only the ones that changed |
| CSV export | The export maps over normalized leads, so a stored clearance or carrier check exports as `Unknown` |
| Outbound CRM payloads | Syncing to Questbook and the webhook relay send normalized copies |

It rewrites every "Was" value in the table above to its "Now" value (a blank email validation stays blank and displays as "Not checked"). It removes a `confidenceScore` equal to exactly 98, 95, 92, 90, 88, 85 or 30. Any other number is kept.

Limits: the data model keeps no "this score came from a check" field, so a real check that happened to produce one of those seven numbers would be stripped on load. When a real check exists it should record its own evidence field and the list should honour it. Leads in a browser that never opens the app again keep their old values until it does. CSV import now defaults phone type and DNC status to `Unknown` unless the file has a non-blank value.

## 6. Setup checklist for the owner

In order. Each step says what breaks if it is skipped.

1. **Reddit app and the three connectors.**
   - Create an app at https://www.reddit.com/prefs/apps while signed in as the account that will own it. Use the type "script" or "web". The client id is the short string under the app name.
   - Apply to Reddit for Data API access for commercial use.
   - Set `reddit_client_id`, `reddit_client_secret` and `reddit_username` in Settings > Connectors, or as constants or environment variables (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`).
   - Until then the Reddit feed answers "Reddit is not configured", the live check cannot confirm stored Reddit leads, and Reddit replies are refused. YouTube and Stack Exchange still run.
   - Optional: delete the unused `xophz_compass_freshmints_social_reddit_enabled` row from `wp_options`.
2. **HighLevel workflow, then the connector.** Do these in this order.
   - Create an inbound-webhook workflow in HighLevel.
   - Gate it first: a contact tagged `no_consent_yet` must not be called or texted automatically. Email, or a call a person dials by hand, only. Call and text steps may run only for contacts tagged `consent_phone` or `consent_sms`.
   - Map the snake_case fields in `data` and the tags in `data.tags`. A workflow that needs tags at the top level of the JSON needs one line moved in the plugin's `envelope()`.
   - Then paste the workflow URL into the `crm_webhook_url` connector. Setting it sends nothing by itself.
   - Send the backlog on purpose: wait for Monday's sync or call `POST /xophz-freshmints/v1/crm/retry-deliveries`. Each call sends up to 50 agents plus pending leads and queues the rest.
   - Optional: the `social_dispatch_webhook_url` connector, so "Replies sent" means the webhook accepted it. Without it, replies are copied for pasting and still counted.
3. **Lead Magnet seller name and privacy URL.** Settings > Lead Magnet. Enter the seller's legal name and a privacy policy URL, or set a WordPress privacy page. The privacy policy should say that lead data goes to HighLevel. Publish a landing page with the educator pattern or the shortcode.
4. **Lawyer review.** Send these together:
   - The consent statement (section 3). Questions for the lawyer: does it meet TCPA prior express written consent as a clear and conspicuous disclosure, is one named seller enough under the one-to-one consent rule and state law, is email-only capture with CAN-SPAM follow-up acceptable, does the SMS wording need HELP for carrier campaign registration, how is revocation honoured (the plugin has no revoke workflow; presumably HighLevel), state mini-TCPA laws, and how long to keep records.
   - The reply template, disclosure and negative keyword list (section 2).
   - The educator page answers and footer disclosure.
   - The TCPA and Texas section of the enrichment research, including whether the first contact sells anything and whether Texas SB 140 registration applies.
5. **Page cache.** Exclude the landing page from page caching (Hummingbird). The form carries a nonce, and a cached anonymous nonce expires after 12 to 24 hours, after which submissions get 403. If the site is behind a proxy or CDN, every visitor may share one `REMOTE_ADDR` and the 10-an-hour IP limit would throttle everyone. Raise it with `xophz_lead_magnet_rate_limits` or resolve the client IP.
6. **Guide page URL in Social Radar.** Open Social Radar > Settings, paste the landing page address into "Guide page URL", then press "Add annuity rule pack". Without the URL, replies go out without the guide line and the dispatch message says so.
7. **Enrichment provider decision.** Agents come with a name, NPN, city and ZIP, and for Iowa a business email and phone. Nothing finds phones or emails for Texas agents yet. The research compares People Data Labs, EnformionGO, BatchData, PropHog, GTM.ai and Apollo and recommends People Data Labs, with a pilot first and PropHog as the fallback. Decide the provider and the first-touch channel under the rule "consent is captured before any contact". Read [research/agent-contact-enrichment.md](research/agent-contact-enrichment.md). For other states see [research/state-licensee-open-data.md](research/state-licensee-open-data.md).

Other things to do once:

- Run the app build so the Pilot Report screen and the label changes reach the plugin's `public/dist`.
- Browser-test the capture form (submit, field errors, keyboard, email-only path), the educator pattern in the editor, and the Pilot Report screen, including a non-admin login.
- To see this week's agents right away, call `POST /agent-finder/run-now` once. To hold the schedule, deactivate the plugin or run `as_unschedule_all_actions( 'freshmints_agent_finder_weekly_sync' )`.

## 7. Limits worth knowing

- The Reddit provider and the HighLevel webhook have only been exercised against intercepted HTTP. The first real calls happen after the connectors are set.
- Texas and Iowa only. Other states sell lists, publish no issue date, or have no list.
- `annuity_capable` is a flag from licence data, not a suitability judgment.
- The capture form needs JavaScript, and the plugin has no workflow for revoking consent.

Related: the server-side Social Radar plan is `docs/architecture/plan-social-radar-server-side.md` in the parent repo.
