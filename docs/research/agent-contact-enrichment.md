# Contact enrichment for newly licensed Texas agents

**Answer:** Use the People Data Labs Bulk Person Enrichment API to look up phone and email by name, city and ZIP. Check each phone's line type and the Do Not Call list before anyone calls, and text an agent only after that agent opts in.

Task #6025 (epic #6021). This was research only: no signups, trials, credentials, purchases or contact forms. Every source below was opened on 2026-10-12. This is not legal advice. The TCPA section needs a lawyer's review before any outreach.

## What we can match on

The Texas Department of Insurance dataset on data.texas.gov (`kxv3-diwf`) has these columns: `npn`, `license_number`, `name`, `license_type`, `qualification`, `license_issue_date`, `expiration_date`, `city`, `state`, `pstl_cd` and `province` [S1]. It has no street address, phone number or email. In a sample of the 200 newest rows, every `name` was written first name first, with no comma, in two to four words. At about 600 new agents a week, that is about 2,500 lookups a month.

Two things follow from this:

- Skip-trace tools that search by a property's street address can't use these records as they are.
- The lookup has to find a person from name, city and ZIP alone. Common names will produce some wrong-person matches, so we need a match score and a human check before first contact.

## Comparison

These six providers cover the three kinds asked for: B2B and person data (People Data Labs, Apollo), identity and skip trace (EnformionGO, BatchData), and agent lists keyed by NPN (PropHog, GTM.ai).

### Price, match rate and API

| Provider | Kind | Matches on | Cost at about 2,500 a month | Published match rate | API |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **People Data Labs** | Person and B2B data API | Name plus `locality`, `region` or `postal_code` [S2] | The Pro plan starts at $98 a month for 350 matches, about $0.28 each, with 20% off on an annual plan [S3]. Higher tiers aren't published [S4], so 2,500 matches would cost at most about $700 a month at the list rate. | None for this kind of input | REST. `POST /v5/person/bulk` takes up to 100 people per call and bills only HTTP 200 results [S6]. The key goes in the `X-Api-Key` header [S7]. Paid plans allow 1,000 requests a minute [S2]. |
| **EnformionGO** (was Endato) | People search and identity API | Any two of name, phone, email or address. The docs' example puts "City, ST" in address line 2 [S10] | Billed per match only, with no monthly fee [S11][S12]. The rates appear only inside a logged-in account [S11]. | None | REST, one person per call. Uses the headers `galaxy-ap-name`, `galaxy-ap-password` and `galaxy-search-type: DevAPIContactEnrich` [S10]. |
| **BatchData** | Bulk skip trace (real estate) | A property street address is required. Name and mailing address are optional [S14][S15] | The smallest plan is $2,000 a month for 100,000 records, about $0.80 each at our volume. No pay-as-you-go option is listed [S16]. | "up to 76% right-party contact rate" for property owners (the vendor's own claim) [S15] | REST. `POST /api/v3/property/skip-trace` with a `requests` array [S14]. |
| **PropHog** insurance agent database | Agent recruiting list keyed by NPN | NPN and license data, filtered in its web app [S18] | $99 a month for one state, or $399 a month for 5 states and 10,000 credits. The cost per record isn't stated [S18]. | None | None documented. It is a web app with CSV export and built-in calling and texting [S18]. |
| **GTM.ai** "All Licensed Insurance Producers" | Static list keyed by NPN, enriched with ZoomInfo data | NPN. The Texas slice lists 407K+ producer records [S21] | Not published [S20] | None. The list is updated "Annual" [S20] | Not stated [S20] |
| **Apollo.io** | B2B sales database | Name plus company, domain, email or LinkedIn URL. It takes no city or ZIP input [S22][S23] | Plans cost $49 to $119 per user a month, billed annually. A mobile number costs 8 credits, about $1.60 at the $0.20 overage rate (a third-party summary) [S24]. | None | REST. `POST /api/v1/people/bulk_match` takes 10 people per call with an `x-api-key` header. Phone numbers arrive later at a webhook [S22]. |

### Data-use terms, Do Not Call and phone type

| Provider | FCRA, GLBA, DPPA and marketing use | Do Not Call flag; mobile or landline | Fit for us |
| :--- | :--- | :--- | :--- |
| **People Data Labs** | Not a consumer reporting agency. Its data may not be used for any FCRA purpose, including evaluating someone for employment. The customer must follow privacy and data protection laws [S8]. Nothing I read rules out outreach. | No Do Not Call flag. It has a separate `mobile_phone` field, which is PDL's label and not a carrier check [S9]. | **Good.** It takes our exact inputs, bills per match and uses one API key. |
| **EnformionGO** | Not a consumer reporting agency. Its data may not be used for credit, insurance or employment decisions [S12][S13]. Its agreement for regulated data allows GLBA and DPPA data only for listed purposes such as fraud prevention, legal proceedings and insurance claims, and marketing isn't one of them [S17]. Its public pages don't say which of those limits apply to the self-serve Contact Enrichment product. | Not stated publicly | Possible, but the price and phone fields stay hidden until signup. |
| **BatchData** | Marketing is allowed only "in strict compliance" with the TCPA, the Telemarketing Sales Rule and CAN-SPAM. DPPA uses are limited to those in 18 U.S.C. 2721(b). The customer is responsible for every consent and Do Not Call subscription. Terms last updated 2026-06-01 [S19]. | Yes. Each phone has `type` (Mobile or Landline), `dnc`, `tcpa` (known litigator) and `reachable` [S14]. | **Poor.** It needs a street address we don't have, and the smallest plan is far more than we need. |
| **PropHog** | Built from public licensing data. The buyer is responsible for TCPA, Do Not Call and CAN-SPAM compliance [S18]. Its terms page returned 404. | Labels each phone as cell or landline. A Do Not Call flag isn't mentioned [S18]. | Good match on the data, but it has no API and doesn't say where its phone numbers come from. |
| **GTM.ai** | Points to ZoomInfo's terms of use (not reviewed) [S20] | Includes a mobile field. A Do Not Call flag isn't mentioned [S20]. | **Poor.** A yearly refresh misses brand-new licensees. |
| **Apollo.io** | Not reviewed | Not stated | **Poor.** It can't match on city or ZIP. |

### Also checked

- **NIPR Producer Database (PDB).** It is the source of the NPN, but NIPR says the PDB is subject to the FCRA and open only to entities with a "permissible purpose", mainly those in the business of insurance [S25]. NIPR's terms, as passed through by AgentSync, limit each report to one use and forbid passing the data on [S26]. The NIPR pages I opened don't list phone or email among the report fields. Not usable for prospecting.
- **Trestle.** This is an add-on, not a source of contacts. Phone Validation costs $0.015 a query and a known-litigator check adds $0.005 [S27]. It returns carrier, line type, prepaid status and phone activity [S28]. At 2,500 numbers a month that is about $50.
- **AdvizorPro** says it covers 2,000,000+ licensed producers, is "Updated Weekly" and offers a "Data Feed & API", but its page gives no NPN field and no pricing [S29].
- **InsuranceAgentLists.com** sells a Texas Life & Health list for $249 as a CSV. The list is refreshed once a year, with new producers added during the year [S30]. It has no API.
- **National Do Not Call Registry access.** In fiscal year 2027 (from 2026-10-01), the first five area codes are free, each additional area code costs $85 a year, and the cap is $23,425 [S31].

## Recommendation: People Data Labs

Reasons, in order:

1. **It takes the data we have.** The minimum input is a name plus `locality`, `region` or `postal_code` [S2], which is exactly what the TDI dataset gives us.
2. **We pay only for usable results.** Billing is per match [S2][S6]. The `required` parameter means a profile with no phone and no email "will not count as a match". `min_likelihood` drops weak matches, and PDL suggests 6 or higher when accuracy matters [S5].
3. **The pricing is public and the entry point is small.** It starts at $98 a month [S3].
4. **It fits a Connector.** It uses one API key in one header [S7], and the bulk endpoint takes up to 100 people per call [S6]. One weekly cron run covers a week of new licensees.
5. **The terms are clear on the FCRA.** PDL is not a consumer reporting agency and forbids FCRA uses [S8]. Legal compliance for outreach is our job, as it is with every vendor here.

What it doesn't do:

- It publishes no match rate for newly licensed agents. Many are career changers, and some will barely show up in professional data.
- It doesn't flag Do Not Call numbers or check line type. `mobile_phone` is PDL's label, not a carrier lookup.
- It doesn't match on NPN. NPN goes into request `metadata` only so results can be joined back to the lead.

**Runner-up:** PropHog, if the pilot match rate is poor. It is built around NPN, is "Updated daily", labels cell and landline numbers, and filters for recently licensed agents [S18]. But it has no documented API, doesn't say where its phone numbers come from, and its terms page was missing. It would be a manual CSV import, not a connector.

### Pilot before committing (owner)

1. Buy PDL Pro at the smallest tier ($98 for 350 matches).
2. Run one real week of TDI records (about 600) with `min_likelihood` 6 and `required` set to the contact fields.
3. Check 25 matches by hand against each agent's own public footprint.
4. Decide based on three numbers: the match rate (200s ÷ records sent), the wrong-person rate in the hand check, and the cost per usable contact.
5. Don't contact anyone from the pilot until the rules in the next section are settled.

## Risks

- **Wrong person.** Name plus ZIP is a weak key for common names. Keep `min_likelihood` at 6 or higher, store the likelihood with the lead, and have a person confirm the match before first contact.
- **Coverage gaps.** Brand-new agents with little work history may not match at all. Measure this in the pilot.
- **Stale or recycled numbers.** PDL's docs don't say it checks whether a number still works. Run a line-type check (Trestle, about $0.02 a number with the litigator check) before any call.
- **FCRA.** Don't use PDL data to decide whether to contract with or appoint an agent. Its terms forbid evaluating people for employment [S8].
- **Our own consent rule.** The swarm rules say "Consent is captured before any contact" (`.chemx/reports/mvp-agent-rules.md`). A phone number bought from a data vendor carries no consent. The integration should store contacts for a person to act on, and must never start calls or texts by itself. The owner decides what first touch is allowed. A likely choice is an email, or a call a person dials by hand, that invites the agent to opt in.
- **Cost.** Prices above 350 matches a month need a quote. Cap the monthly lookups with a setting.
- **Terms change.** Re-read PDL's current terms and its acceptable data use policy before signing. That policy page didn't render for me.
- **Privacy.** Request and keep only the fields we use. Don't request street address or age. Delete records on request.

## Calling or texting these agents: the TCPA and Texas rules

The outreach is recruiting, sent by a business to individuals' cell phones. Points for the lawyer and the owner:

1. **Prerecorded, AI-voice and autodialed calls and texts to cell phones need consent.** FCC rules bar telemarketing calls to wireless numbers made with an autodialer or an artificial or prerecorded voice without "prior express written consent" [S32]. AI-generated voices count as artificial [S33]. The Supreme Court in *Facebook v. Duguid* limited "autodialer" to equipment that stores or produces numbers "using a random or sequential number generator" [S34]. So a CRM texting a stored list usually isn't an autodialer under federal law, but voicemail drops and AI voice still need consent.
2. **The National Do Not Call list.** The rule covers "telephone solicitation", meaning calls or messages "encouraging the purchase or rental of, or investment in, property, goods, or services". It applies to calls and texts to wireless numbers [S32]. Courts have held that pure recruiting isn't solicitation. In 2024 a federal court in California dismissed Do Not Call claims over texts recruiting someone as an independent contractor [S35]. Other courts have found that job offers aren't advertisements as long as the recipient isn't charged a fee [S36]. That protection ends if the pitch sells anything, such as paid leads, training fees or an "investment". Scrub against the list anyway.
3. **Courts disagree on whether texts are calls.** In July 2026 the Seventh Circuit held that texts are not "telephone calls" under 47 U.S.C. 227(c)(5). The Ninth Circuit treats texts as calls [S37]. The source mentions no Fifth Circuit ruling, and Texas is in the Fifth Circuit.
4. **Texas law.**
   - SB 140, in effect since 2025-09-01, brought texts under Texas telephone solicitation law. It requires registration with the Secretary of State ($10,000 security deposit plus $200 per location) unless an exemption applies, and it widened consumers' right to sue under the DTPA: up to $1,500 per violation, tripled if willful [S38].
   - Texas defines telephone solicitation as a call to get someone "to purchase, rent, claim, or receive an item" [S39].
   - The insurance-license exemption applies only "if the solicited transaction is governed by that code" [S40]. A federal court in western Texas applied it to a life insurance sale in 2026 [S41]. Recruiting isn't an insurance sale, so don't rely on it.
   - Texas calling hours for telephone solicitation are after 9 a.m. and before 9 p.m., and after noon on Sundays [S42]. The federal window is 8 a.m. to 9 p.m. [S32].
5. **Carrier and platform rules apply even where the TCPA doesn't.** Twilio's messaging policy requires "prior express consent" before any message and forbids buying or transferring consent [S43]. HighLevel's A2P registration asks for an opt-in form URL and a description of the opt-in flow [S44]. Cold texts to bought numbers put the sending number and brand at risk of being blocked.
6. **Email.** CAN-SPAM "makes no exception for business-to-business email". It doesn't require consent, but it does require honest headers and subject lines, a postal address, and opt-outs honored within 10 business days. Each violating email can cost up to $53,088 [S45].

Proposed rules for this feature:

- First contact is an email or a call a person dials by hand. No texts, voicemail drops, AI voice or automatic dialing until the agent opts in, for example on the capture page.
- Before any call: check the line type, scrub against the National Do Not Call list (register for access first) and our internal do-not-call list, and keep to Texas calling hours.
- The first message is about recruiting only, with nothing for sale.

## Connector shape (for the build task)

**Where it goes.** Register the connector on `wp_connectors_init` in `wp-content/plugins/xophz-compass-fresh-mints/xophz-compass-fresh-mints.php`, next to `youtube_api_key`. Read the key only through `Freshmints_Connectors::get_key( 'peopledatalabs_api_key' )`. Calls run on the server. The REST route that starts a run requires `manage_options`, and the key never reaches the browser.

**Connector.**

```php
if ( ! wp_is_connector_registered( 'peopledatalabs_api_key' ) ) {
	$registry->register(
		'peopledatalabs_api_key',
		array(
			'name'           => 'People Data Labs API Key',
			'description'    => 'API key for People Data Labs person enrichment (Agent Finder phone and email lookup).',
			'type'           => 'api_key',
			'authentication' => array(
				'method'        => 'api_key',
				'setting_name'  => 'compass_peopledatalabs_api_key',
				'constant_name' => 'COMPASS_PEOPLEDATALABS_API_KEY',
				'env_var_name'  => 'COMPASS_PEOPLEDATALABS_API_KEY',
			),
		)
	);
}
```

Add `credentials_url` once someone confirms the URL of PDL's API key page. I didn't verify it.

An optional second connector, for phone checks: `trestle_api_key`, with setting `compass_trestle_api_key` and constant and environment variable `COMPASS_TRESTLE_API_KEY`. The base URL is `https://api.trestleiq.com` [S28]. Confirm the header name and endpoint path in Trestle's API reference at build time.

**Plain settings.** These are not secrets. They are ordinary options using the plugin's existing `xophz_compass_freshmints_` prefix.

| Option | Default | Purpose |
| :--- | :--- | :--- |
| `xophz_compass_freshmints_enrich_enabled` | `'0'` | Off until the owner picks a provider (#6037) |
| `xophz_compass_freshmints_enrich_min_likelihood` | `6` | Sent as `min_likelihood` (2 to 10) [S5] |
| `xophz_compass_freshmints_enrich_required` | `mobile_phone OR personal_emails OR phone_numbers` | Sent as `required`. A profile without these fields isn't billed [S5]. |
| `xophz_compass_freshmints_enrich_monthly_cap` | `2500` | Stop sending once this many lookups have run this month |
| `xophz_compass_freshmints_enrich_phone_check` | `'0'` | Run the Trestle line-type check on returned phones |

**Request.** Sent from the server with `wp_remote_post`. Top-level filters apply to every entry in `requests`, and filters inside one entry's `params` override them [S6].

```http
POST https://api.peopledatalabs.com/v5/person/bulk
X-Api-Key: <Freshmints_Connectors::get_key( 'peopledatalabs_api_key' )>
Content-Type: application/json

{
  "min_likelihood": 6,
  "required": "mobile_phone OR personal_emails OR phone_numbers",
  "titlecase": true,
  "data_include": "full_name,mobile_phone,phone_numbers,personal_emails,recommended_personal_email,work_email,linkedin_url,location_locality,location_region,location_postal_code",
  "requests": [
    {
      "metadata": { "lead_id": "<lead id>", "npn": "<TDI npn>" },
      "params": {
        "name": "<TDI name>",
        "locality": "<TDI city>",
        "region": "texas",
        "postal_code": "<TDI pstl_cd>",
        "country": "united states"
      }
    }
  ]
}
```

Send up to 100 entries per call [S6]. Every field in `params` is a documented input [S2][S5].

**Response.** One entry per request, in order:

```json
[
  { "status": 200, "likelihood": 8, "metadata": { "lead_id": "…", "npn": "…" }, "data": { "mobile_phone": "…", "phone_numbers": [], "personal_emails": [], "recommended_personal_email": "…", "work_email": "…", "linkedin_url": "…" } },
  { "status": 404, "metadata": { "lead_id": "…", "npn": "…" } }
]
```

Only 200 results are billed [S6]. Field meanings are in PDL's field reference [S9].

**Mapping into `SkipTraceResult`** (`apps/fresh-mints/src/lib/types/lead.ts:44`):

| Field | Value |
| :--- | :--- |
| `tracedAt` | Time of the call |
| `verifiedPhone` | `mobile_phone`, else the first of `phone_numbers`, else `""` |
| `phoneSource` | `"People Data Labs"` |
| `phoneType` | The Trestle line type when checked, else `"Unknown"` |
| `dncStatus` | The Do Not Call scrub result, else `"Unknown"` |
| `primaryEmail` | `recommended_personal_email`, else the first of `personal_emails`, else `""` |
| `secondaryEmail` | `work_email` or `""` |
| `emailValidation` | `""` (PDL doesn't validate email addresses) |
| `linkedInUrl` | `linkedin_url` or `""` |
| `currentAddress` | `""` (not requested) |
| `enrichmentNotes` | `"People Data Labs match, likelihood N/10, on name + city + ZIP"` |
| `confidenceScore` | Leave unset. Likelihood is a match score, not a verification, as the type's own comment requires. |

Set `skipTraceStatus` to `'Traced'` when a phone and an email both came back, `'Partial'` when only one did, and leave it at `'Not Traced'` on a 404. Consider adding `'No Match'` to `SkipTraceStatus` (`lead.ts:24`) so a 404 isn't retried and billed for nothing every week. Rename `verifiedPhone` or run the phone check before filling it, because a number nobody has checked isn't verified.

## Sources (all opened 2026-10-12)

- [S1] data.texas.gov dataset metadata, `kxv3-diwf`: https://data.texas.gov/api/views/kxv3-diwf.json
- [S2] PDL, Person Enrichment API reference: https://docs.peopledatalabs.com/docs/reference-person-enrichment-api
- [S3] PDL, person pricing: https://www.peopledatalabs.com/pricing/person
- [S4] Cleanlist, PDL pricing guide (third party, dated 2026-09-01): https://www.cleanlist.ai/blog/2026-09-01-people-data-labs-pricing-guide
- [S5] PDL, Person Enrichment input parameters: https://docs.peopledatalabs.com/docs/input-parameters-person-enrichment-api
- [S6] PDL, Bulk Person Enrichment API: https://docs.peopledatalabs.com/docs/bulk-enrichment-api (and its `.md` copy)
- [S7] PDL, authentication: https://docs.peopledatalabs.com/docs/authentication
- [S8] PDL customer terms as reproduced in Primer's third-party data partner terms: https://www.sayprimer.com/third-party-terms
- [S9] PDL, person fields: https://docs.peopledatalabs.com/docs/fields
- [S10] EnformionGO API reference, Contact Enrichment: https://enformiongo.readme.io/reference/contact-enrichment and https://enformiongo.readme.io/reference/overview
- [S11] EnformionGO, how we charge: https://go.enformion.com/help-center/how-we-charge
- [S12] EnformionGO, what is included in my membership: https://go.enformion.com/help-center/what-is-included-in-my-membership/
- [S13] EnformionGO, developer APIs: https://go.enformion.com/developer-apis
- [S14] BatchData, v3 skip trace API: https://help.batchdata.io/en/articles/12859857-batchdata-v3-skiptrace-api-now-available
- [S15] BatchData, batch skip tracing, how it works: https://batchdata.io/blog/batch-skip-tracing-how-it-works
- [S16] BatchData, pricing: https://batchdata.io/pricing (also https://batchdata.io/plan/growth)
- [S17] Enformion, Master Services Agreement (regulated data, Rev July 2022), Exhibit on permissible uses: https://search.enformion.com/Membership/MasterServiceAgreement_1.pdf
- [S18] PropHog, licensed agent database: https://prophog.com/licensed-agent-database
- [S19] BatchData, terms of service (last updated 2026-06-01): https://batchdata.io/terms-of-service
- [S20] GTM.ai, All Licensed Insurance Producers in the US: https://gtm.ai/marketplace/gtm-audiences/all-licensed-insurance-producers-in-the-us
- [S21] GTM.ai, Insurance Producers in Texas: https://gtm.ai/content/marketplace/insurance-producers-in-texas.md
- [S22] Apollo, Bulk People Enrichment: https://docs.apollo.io/reference/bulk-people-enrichment
- [S23] Apollo, People Enrichment: https://docs.apollo.io/reference/people-enrichment
- [S24] Docket, Apollo pricing summary (third party, April 2026): https://docket.io/resources/research/apollo-pricing
- [S25] NIPR, get a PDB report: https://nipr.com/products-and-services/producer-database/get-report
- [S26] AgentSync, NIPR pass-through terms: https://agentsync.io/nipr-terms
- [S27] Trestle, pricing: https://trestleiq.com/pricing/
- [S28] Trestle, API overview: https://docs.trestleiq.com/guides/overview
- [S29] AdvizorPro, insurance agents email database: https://advizorpro.com/data/insurance-agents-email-database
- [S30] InsuranceAgentLists.com: https://www.insuranceagentlists.com/
- [S31] FTC, FY 2027 Do Not Call Registry fees (2026-08-26): https://www.ftc.gov/news-events/news/press-releases/2026/08/ftc-announces-2027-telemarketer-fees-access-national-do-not-call-registry
- [S32] 47 CFR 64.1200 (Cornell LII): https://www.law.cornell.edu/cfr/text/47/64.1200
- [S33] Cooley, FCC: AI-generated robocalls illegal under the TCPA: https://cooley.com/news/insight/2024/2024-02-15-fcc-ai-generated-robocalls-illegal-under-the-tcpa
- [S34] *Facebook, Inc. v. Duguid* (2021), Cornell LII: https://www.law.cornell.edu/supremecourt/text/19-511
- [S35] Orrick InfoBytes, court finds job recruitment texts are not solicitations (2024-09-13): http://infobytes.orrick.com/2024-09-13/district-court-finds-job-recruitment-texts-are-not-solicitations-under-telephone-consumer-protection-act/
- [S36] CLRKC, are offers of employment advertisements or telemarketing under the TCPA: https://clrkc.com/are-offers-of-employment-advertisements-or-telemarketing-calls-under-the-tcpa/
- [S37] Troutman, Seventh Circuit: texts are not telephone calls under 227(c)(5) (2026-07-15): https://www.troutman.com/insights/seventh-circuit-rules-text-messages-are-not-telephone-calls-under-tcpa-%c2%a7-227c5-a-circuit-split-emerges/
- [S38] Morgan Lewis, Texas telephone solicitation law now covers text messages (2025-09): https://www.morganlewis.com/pubs/2025/09/texas-telephone-solicitation-law-now-covers-text-messages
- [S39] Tex. Bus. & Com. Code 302.001: https://texas.public.law/statutes/tex._bus._and_com._code_section_302.001
- [S40] Tex. Bus. & Com. Code 302.053: https://texas.public.law/statutes/tex._bus._and_com._code_section_302.053
- [S41] TCPAWorld, *Sutton v. Senior Life* (W.D. Tex., 2026-06-01): https://tcpaworld.com/2026/06/05/texas-insurance-exemption-applied-senior-life-insurance-company-loses-war-but-wins-important-battle-for-insurance-companies-sued-under-texas-state-registration-rules/
- [S42] Tex. Bus. & Com. Code 301.051: https://texas.public.law/statutes/tex._bus._and_com._code_section_301.051
- [S43] Twilio, messaging policy: https://www.twilio.com/en-us/legal/messaging-policy
- [S44] HighLevel, A2P campaign registration guide: https://help.gohighlevel.com/support/solutions/articles/155000004539-campaign-registration-step-by-step-guide-and-faqs
- [S45] FTC, CAN-SPAM Act compliance guide for business: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
