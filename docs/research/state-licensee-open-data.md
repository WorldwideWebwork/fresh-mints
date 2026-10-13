# Which states publish insurance producer data we can use for newly licensed agents

**Answer:** Two states publish free, machine-readable producer data with a usable date: Texas (built, #6022) and Iowa (built, #6027). Florida also publishes a free bulk file with an issue date, but its site terms limit use to personal, educational or training purposes, so it needs a legal read before we build on it. Every other state we checked either publishes no list or sells one. The sold lists are the way to scale: the NAIC State Based Systems (SBS) Report Generator sells a CSV with a `FIRST_ACTIVE_DATE` column for $0.02 a row. West Virginia, North Carolina and Nebraska offer it, and about thirty states run on the new SBS.

Task #6027 (epic #6021). Sources marked **opened** were fetched or read on 2026-10-12 (the Florida file header was captured on 2026-10-09 by an earlier session). Sources marked **reported** appeared only in a search result and were not opened. No file other than the Iowa export was downloaded, nothing was purchased, and no form was submitted. This is not legal advice.

## Comparison

| State | Source | Access | Issue-date field | Updated | Terms found | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Iowa** | Iowa Data Hub dataset 669, "Insurance Producers Licensed in Iowa", `https://data.iowa.gov/catalog/dataset/669` [S1]. Opened. | Free whole-file export only: `https://idh-be.iowa.gov/api/v1/datasets/669/rows.csv` (a zip, 52 MB, 232,650 rows) and `rows.json` (154 MB) [S2]. No query API: other paths return 400 or 404 and filter parameters are ignored. | `first_active_date`, one per person. It is not reset by renewals (dates reach back to 1959) and it does not move when a line is added: people with older dates hold more lines (mean 1.8 lines for those first active in the last 30 days, 3.9 for those before 2010). Also `expiry_date`. | Daily [S1] | CC BY 4.0 [S1][S3]. No restriction on solicitation found. | **Built** (#6027). |
| **Texas** | data.texas.gov `kxv3-diwf` (people) and `3yqc-fcdt` (agencies) [S4]. Opened. | Free SODA API with filters and paging. | `license_issue_date`, one per licence. A person's first date needs a per-NPN `min()` lookup. | Daily (rows updated 2026-10-12) [S4] | No licence set on the dataset; attribution is Texas Department of Insurance [S4]. | **Built** (#6022). |
| **Florida** | DFS Licensee Search bulk downloads, `https://licenseesearch.fldfs.com/BulkDownload` [S5]. Opened. | Free CSV files; "All Valid Licenses - Individual" is 324 MB. | `License Issue Date`, one per licence (header captured 2026-10-09, with `Residency Type`, `License TYCL Desc`, email, phone, addresses) [S6]. | Not stated on the page | The site's terms of use allow downloading for "personal, educational, or training" purposes only [S7]. Email addresses are public records [S7]. | **Not built.** Needs a legal read first. |
| **California** | CDI producer mailing lists, `https://insurance.ca.gov/0200-industry/0130-mailing-lists` [S8]. Opened. | Paid by mailed order form and cheque. `$0.01` a record, $75 minimum, e-mailed in two to three weeks as a flat file [S9]. | The "Recently Licensed Individuals" list (order code `REC-LIC`) is run "from" a starting date you give [S8][S9]. | Queried files, updated daily [S9] | No private email, phone or residence address. Business email, city, state and ZIP only [S9]. No use restriction on the pages. | Useful but manual. Cannot be automated. |
| **SBS Report Generator states** | NAIC State Based Systems. West Virginia [S10], North Carolina [S11][S12] and Nebraska [S13] opened. About thirty states are reported to be on the new SBS; which of them sell lists is not confirmed. | Paid, one human checkout per list: $0.02 a row, $10 minimum, credit card, CSV, kept 30 days [S12]. Each state opts in and the buyer agrees to Terms and Conditions first [S12]. | `FIRST_ACTIVE_DATE`: "Date that this license first became active in the selected state", plus `EFFECTIVE_DATE` (most recently active), `IS_RESIDENT`, `DOMICILESTATE`, business email and phone [S10][S12]. This is the same field Iowa publishes. | At purchase | Terms and Conditions not read (not on the pages). | **Best way to scale.** Which states have it switched on, and whether the search criteria can filter by date, must be checked at the SBS site. |
| **Nevada** | Division of Insurance "Reports & Lists", `https://di.nv.gov/nv/r/doi/reports-and-lookups/home` [S14]. Opened. | Free xlsx downloads: "Resident Producer List", "Non Resident Producers", and a report by qualification with "Export to xlsx". | Unknown. The page says only business email, address and phone are included [S14]. The xlsx was not downloaded to check. | Not stated | None stated | **Unverified.** Worth one approved download to read the columns. |
| **Illinois** | Socrata `illinois-edp.data.socrata.com` dataset `serf-cewv`, "DOI Insurance Producers" [S15]. Opened. | Free SODA API, 627,713 rows. | None. Columns are name, mailing address and line of authority. | Last updated June 2024 | None stated | Not usable. |
| **Utah** | Insurance Department "List of Licensees" [S16]. Opened. | Custom list for licensees only, with a fee and a release agreement. | Not stated | On request | The Department says it cannot release data on individual agents [S16]. | Not usable. |
| **Georgia** | OCI agent licensing page [S17]. Opened. | Individual lookup only. | None | n/a | n/a | Not usable. |
| **Oregon** | DFR reports and data page [S18]. Opened. | Reports only, no licensee files. | None | n/a | n/a | Not usable. |
| **Colorado, Delaware** | Statewide professional licence datasets on their Socrata portals (`7s5z-vewr` has `licensefirstissuedate`; `pjnv-eaih` has `issue_date`). | Free SODA API. | They have dates, but a query for insurance in either dataset returns no rows. Insurance producers are not in them [S19]. | n/a | n/a | Not usable. |
| **Kansas, New Hampshire** | The pages say producer lists come from the SBS Report Generator. **Reported**: the Kansas page now returns 404 and the New Hampshire page was only seen in a search result. | See SBS row. | See SBS row. | | | See SBS row. |
| **NIPR Producer Database** | `https://nipr.com/products-and-services/producer-database` [S20]. Opened. | Subscribers run batch reports for producers they already know. Price on request. | n/a | Every weeknight, per search result | The page does not mention bulk lists of new licensees. | Not a prospecting feed. |

A scan of the Socrata catalogue (every domain, queries for insurance producer, agent, licensee and NPN) found producer datasets only on data.texas.gov and the Illinois one above. The state portals for Colorado, Connecticut, Delaware, Illinois, Maryland, Michigan, Missouri, New Jersey, New York, Oregon, Pennsylvania, Vermont and Washington had no insurance licensee dataset. Web searches for Alaska, Arkansas, Idaho, Louisiana, Missouri, North Carolina (beyond the SBS service), North Dakota, Ohio, South Dakota and Washington found only individual lookups, so I list them as having no public bulk file. That is a search result, not proof.

## How "newly licensed" works in each source

- **Texas:** rows are per licence, so a person who held a licence for years and just added a life line has a recent row. We take the earliest date over all of the person's rows (`min(license_issue_date)` grouped by `npn`) and keep people whose first date is in the window.
- **Iowa:** rows are per person and `first_active_date` is already that earliest date, so the test is one date comparison. It is the first date in Iowa, not the first licence anywhere. We use only Iowa residents with an Iowa address, because a non-resident's date is just when they added Iowa. A resident who moved to Iowa and converted a licence still looks new. On 2026-10-12, 9 of the 139 residents first active in the last 365 days who also appear in the Texas dataset (6.5%) held a Texas licence older than their Iowa date.
- **SBS Report Generator:** `FIRST_ACTIVE_DATE` is per licence and per state, the same idea as Iowa's. `EFFECTIVE_DATE` is not usable for this, because it moves when a licence becomes active again.
- **Florida:** `License Issue Date` is per licence, like Texas, so the same per-person minimum would be needed.

## Iowa volume on 2026-10-12

Resident producers with an Iowa address and the life line, by first active date: 18 in the last 7 days, 117 in the last 30 and 1,629 in the last 365. Texas gave 435 and 2,631 for the 7 and 30 day windows. Iowa is small, but it is the only second state that costs nothing.

## Iowa terms, in detail

- The dataset's licence is CC BY 4.0 [S1][S3]. That allows commercial reuse if we credit the source, link the licence and say we changed the data. The Iowa adapter puts that text in every lead (`registry.attribution`) and in `Freshmints_Registry_Producers::describe()`.
- The page `iowa.gov/policies` says "No marketing databases are created nor are any commercial uses made of any such data" [S21]. In context that sentence describes how the State treats information it collects from visitors to its own websites. It does not govern reuse of an open dataset. If the owner wants it in writing, ask data@iowa.gov.
- The dataset carries business email and phone for each producer. Having them is not consent. CAN-SPAM and the Do Not Call rules still apply to how they are used.
- The Iowa "Life" line of authority covers life insurance and annuities (Iowa Code 522B.6(2)(a)) [S22]. The "Variable" line needs an active life line (IAC 191-10.4(8)) [S23]. So `loa_has_life = Yes` is the annuity-capable test.

## Sources

- [S1] Iowa Data Hub, dataset 669, `https://data.iowa.gov/catalog/dataset/669`. Opened 2026-10-12. Licence CC BY, update frequency Daily, 232,650 rows.
- [S2] `https://idh-be.iowa.gov/api/v1/datasets/669/columns.json` (28 columns) and `rows.csv`. Opened 2026-10-12. `rows.json?limit=2` returned the whole 154 MB export.
- [S3] `https://catalog.data.gov/dataset/insurance-producers-licensed-in-iowa`. Opened 2026-10-12. Creative Commons Attribution 4.0.
- [S4] `https://data.texas.gov/api/views/kxv3-diwf.json`. Opened 2026-10-12. Attribution Texas Department of Insurance, no licence field.
- [S5] `https://licenseesearch.fldfs.com/BulkDownload`. Opened 2026-10-12.
- [S6] First rows of the individual file, captured 2026-10-09 (`fl_ind_head.csv` in the session scratchpad).
- [S7] `https://www.myfloridacfo.com/sitepages/required/copyright.aspx`. Opened 2026-10-12.
- [S8] `https://insurance.ca.gov/0200-industry/0130-mailing-lists` and its Recently Licensed Individuals page. Opened 2026-10-12.
- [S9] CDI "Producer Licensing Bureau Qualification Data Extract Information" and the LIC DE 4 order form. Read 2026-10-09 and 2026-10-12.
- [S10] West Virginia Insurance Commissioner, "SBS Report Generator Service", `https://wvinsurance.gov/Portals/0/SBS%20Report%20Generator%20Service.pdf`. Opened 2026-10-12.
- [S11] North Carolina Department of Insurance, SBS Report Generator Service page. Opened 2026-10-12.
- [S12] North Carolina "SBS Report Generator Service FAQs", `https://www.ncdoi.gov/documents/agent-services/sbs-customized-mailing-list-report-generator-service/open`. Opened 2026-10-12.
- [S13] Nebraska Department of Insurance, `https://doi.nebraska.gov/consumer/company-and-producer-search`. Opened 2026-10-12.
- [S14] Nevada Division of Insurance, `https://di.nv.gov/nv/r/doi/reports-and-lookups/home` and `https://doi.nv.gov/News_Notices/Producer_and_Company_Lists/`. Opened 2026-10-12.
- [S15] `https://illinois-edp.data.socrata.com/api/views/serf-cewv.json`. Opened 2026-10-12.
- [S16] `https://insurance.utah.gov/licensees/producers/licensee-list`. Opened 2026-10-12.
- [S17] `https://oci.georgia.gov/agents-agency-licensing`. Opened 2026-10-12.
- [S18] `https://dfr.oregon.gov/business/reg/reports-data`. Opened 2026-10-12.
- [S19] SODA queries against `data.colorado.gov/resource/7s5z-vewr` and `349y-twqi`, and `data.delaware.gov/resource/pjnv-eaih`, run 2026-10-12.
- [S20] `https://nipr.com/products-and-services/producer-database`. Opened 2026-10-12.
- [S21] `https://iowa.gov/policies`. Opened 2026-10-12.
- [S22] Iowa Code 522B.6, `https://www.legis.iowa.gov/docs/code/522B.6.pdf`. Opened 2026-10-12.
- [S23] Iowa Administrative Code chapter 191-10, `https://www.legis.iowa.gov/docs/iac/chapter/09-30-2026.191.10.pdf`. Opened 2026-10-12.
