# Living standards outlooks: what peers publish, and what this dashboard should add

Prepared 20 October 2026 for the baseline view of PolicyEngine's Autumn Budget 2026 (28 October 2026) dashboard.
Scope: read-only review. Nothing in the dashboard or pipeline was changed.

## 1. What the demo shows today

From `public/data/outlook.json` meta and `pipeline/run_projections.py` (policyengine 6.8.0, policyengine-uk 2.130.1, `microcosm_uk_2024_25`, tag `microcosm-uk-2024-25-national-20261019T083323Z-6cba5d71`):

- Mean and median household income (`hbai_household_net_income`, household-weighted, not equivalised) and mean and median equivalised income (`equiv_hbai_household_net_income`, person-weighted). All BHC. Nominal and real terms, with the OBR CPI index rebased to 2025-26. HBAI outturn runs 2021-22 to 2024-25 and the projection 2024-25 to 2030-31.
- Poverty: absolute and relative, BHC and AHC, for all people, children, working-age adults and pensioners. HBAI outturn plus projection.
- OBR March 2026 determinants: CPI, CPIH, CPI AHC, RPI, earnings, non-labour income, house prices, rent, social rent and mortgage interest.

Gaps against peers, in summary: no AHC income series, no distributional growth (deciles or percentiles), no inequality index, no family-type, tenure, region or disability breakdowns, no depth-of-poverty measure, no growth decomposition, no national-accounts living standards line, and no uncertainty device beyond the pre/post-Budget toggle.

## 2. Peer publications, field by field

Every entry uses the same six fields: headline metrics; breakdowns; horizon; real-terms basis; charts; forecast vs outturn and uncertainty.

### 2.1 Resolution Foundation (RF)

**Living Standards Outlook 2026** (Clegg, Murphy and Smith, February 2026): https://www.resolutionfoundation.org/publications/living-standards-outlook-2026/ (PDF: https://www.resolutionfoundation.org/app/uploads/2026/02/LSO-2026.pdf)

- **Headline metrics:** real median equivalised household disposable income AHC for non-pensioners. The focal group is "Unsung Britain": people in working-age families below the whole-population median, weighted by persons as in HBAI, on AHC equivalised income (Box 1). Typical non-pensioner income grows +1.2% in 2026-27, against +4.7% for below-middle-income families. Relative child poverty AHC falls from 33% (2025-26) to 30% (2026-27). The OBR's RHDI per person grows about 0.3% a year over 2025-26 to 2029-30.
- **Breakdowns:** below-middle vs above-middle income non-pensioners vs pensioner families (Fig 1, 5, 10); non-pensioner income vigintiles, excluding the bottom 5% for data reliability (Fig 6); income components (earnings, benefits, taxes) for each income group (Fig 7); family type within below-middle families (Fig 13); tenure (own outright, mortgagor, social renter, private renter) and disabled adult in family (Fig 14); children's relative poverty with and without the Government's measures (Fig 15); Household Cost Indices for decile 1 vs decile 10 (Fig 18).
- **Horizon:** HBAI outturn to 2023-24, then nowcast and projection to 2029-30. Historical context from 1994-95 and 2004-05.
- **Real basis:** RF's own AHC deflator, based on CPI, in 2025-26 prices. Projections use the IPPR Tax-Benefit Model on FRS/HBAI, uprated with OBR November 2025 assumptions.
- **Charts:** cumulative-change lines against a base year by income group; annual growth bars by group; a growth incidence curve by vigintile; stacked contribution bars; small multiples by tenure and disability; a poverty line chart with a counterfactual line; and Fig 3, which overlays every OBR RHDI forecast since 2010 (a "hedgehog" chart).
- **Forecast vs outturn and uncertainty:** chart notes state "All values beyond 2023-24 are projections". Box 2 and Fig 4 compare RF's HBAI-based projection with the OBR's RHDI. Uncertainty comes through scenarios: central, weaker and stronger earnings paths (LSO 2025, Fig 3), a Bank of England real-wage upside, a Middle East energy downside, and with/without-policy counterfactuals. There are no statistical bands.

**Spring Forecast 2026 overnight response** (4 March 2026): https://www.resolutionfoundation.org/press-releases/war-in-middle-east-threatens-bumper-year-of-living-standards-growth-for-lower-income-families/

- Typical working-age family income rises 0.9% (about £300) in 2026-27, then falls 0.5% (about £150) to 2028-29. Lower-income households gain 3.9% (about £800) in 2026-27. Child poverty falls 3 points in 2026-27, then rises steadily, for a net fall of 0.5 points over the Parliament.
- Upside and downside scenarios: an energy shock adds about 1 point to inflation and about £500 to bills; a Bank of England real-wage path is the upside case.

**Autumn Budget 2025 response, "Stairway to headroom"** (November 2025): https://www.resolutionfoundation.org/app/uploads/2025/11/Stairway-to-headroom.pdf

- Distribution of policy changes by income vigintile in 2029-30, in £ and as a share of income, per household AHC (Fig 18, 20). Share of households gaining or losing by decile (Fig 19). Gains by age group, per person AHC (Fig 21). In-kind benefits (Fig 22). Energy-bill savings shown as median and p25–p75 range (Fig 17). Annualised RHDI per person by Parliament (Fig 23).
- This is the Budget-day template the post-Budget view will be compared against.

**Living Standards Outlook 2025** (Corlett, June 2025): https://www.resolutionfoundation.org/app/uploads/2025/06/LivingStandardsOutlook2025.pdf

- Adds three content items: food insecurity (Fig 2); medians by age group showing children vs pensioners since 2019-20 (Fig 12, 14); and real median family savings (Fig 13). It also adds a growth-by-decade comparison (Fig 11).

**Living Standards Audit:** no 2025 or 2026 edition was found. The latest edition my search surfaced is 2019 (https://www.resolutionfoundation.org/app/uploads/2019/07/Living-Standards-Audit-2019.pdf). The LSO now carries RF's HBAI nowcasts.

### 2.2 Institute for Fiscal Studies (IFS)

Access caveat: ifs.org.uk HTML pages return HTTP 403 to automated fetches. PDFs under `/sites/default/files/` do download. No 2025 edition of the annual report could be found or retrieved. This section uses the 2024 edition (R329), IFS search snippets on the March 2026 HBAI release, and the IFS Budget 2025 chart description. Treat the IFS 2025–26 coverage as incomplete.

**Living standards, poverty and inequality in the UK: 2024** (R329, July 2024): https://ifs.org.uk/sites/default/files/2024-07/Living-standards-poverty-and-inequality-in-the-UK-2024-IFS-Report-R329.pdf

- **Headline metrics:** median BHC/AHC income; absolute and relative AHC poverty; material deprivation; inequality (the IFS runs the long-run series behind HBAI's 1961+ charts: https://ifs.org.uk/living-standards-poverty-and-inequality-uk).
- **Breakdowns:** income growth by percentile (Fig 2.4, 2.5, 3.7, 4.4); contributions to income growth by source (Fig 2.6, 4.3, 4.5); pensioners vs working-age adults; age group and birth cohort; sex; material deprivation by decile (Fig 3.5); mortgagors and remortgaging (Fig 3.8–3.11); tenure (pensioner relative poverty: private renters 38%, social renters 34%, owners 12%).
- **Horizon:** outturn only, with long history (from 1961).
- **Real basis:** HBAI CPI-variant deflators.
- **Charts:** long time-series lines; growth incidence curves by percentile; stacked contribution bars; and Fig 3.10, which sets the official series (solid) against an adjusted series (dashed).
- **Uncertainty:** discussion of data quality. The March 2025 piece "New data suggest dramatic decline in living standards, but it may just be the quality of the data" (https://ifs.org.uk/articles/new-data-suggest-dramatic-decline-living-standards-it-may-just-be-quality-data-has) questioned the 2023-24 fall. "Are fewer people living in poverty than previously thought?" (https://ifs.org.uk/articles/are-fewer-people-living-poverty-previously-thought) covers the March 2026 administrative-data method change.

**IFS Budget 2025 analysis (November 2025):** search snippets describe a chart of the distributional impact of reforms by household income decile for 2026-27 and 2030-31. Households across the distribution gain next year, but by 2030-31 the tax rises have kicked in. Two years side by side is a useful template.

**IFS on the two-child limit (October 2025):** the recent rise in measured child poverty is "entirely driven" by families with three or more children (reported in https://fullfact.org/politics/two-child-benefit-cap-explainer/ and https://www.ukri.org/who-we-are/how-we-are-doing/research-outcomes-and-impact/esrc/child-poverty-research-informs-major-policy-change/). Abolition would bring about 70,000 more households under the benefit cap.

**IFS Green Budget 2025** (October 2025): launched 17 October 2025. I could not retrieve a living-standards chapter.

### 2.3 Joseph Rowntree Foundation (JRF)

**UK Poverty 2026** (27 January 2026): https://www.jrf.org.uk/news/progress-expected-to-stall-as-deep-poverty-and-child-poverty-reach-record-levels (full report at https://www.jrf.org.uk/understanding-poverty/uk-poverty-2026-the-essential-guide-to-understanding-poverty-in-the-uk)

- **Headline metrics:** relative poverty AHC, 14.2m people (just over 1 in 5) in 2023-24. "Very deep poverty", meaning below 40% of median AHC: 6.8m people, almost half of everyone in poverty and the highest on record since 1994-95. Depth: the average person in poverty is 29% below the line (23% in the mid-1990s); those in very deep poverty are 59% below. Child poverty is 4.5m and rising for a third year. Food insecurity covers 7.5m people, 3.5m of them in poverty. About two-thirds of working-age adults in poverty live in a household with someone in work.
- **Breakdowns:** families with 3+ children (about twice the rate of smaller families); disability, including mental vs physical health conditions; ethnicity (Bangladeshi 53%, Pakistani 49%); work status; tenure; region (higher in London and parts of the Midlands and North).
- **Horizon:** outturn to 2023-24, plus projections to 2029 from OBR central forecasts. The headline rate goes from 21.3% (2026) to 21.1% (2029). About 400,000 fewer children are in poverty from April 2026, with 4.2m still in poverty in April 2029.
- **Real basis:** HBAI AHC.
- **Uncertainty:** a single central projection on OBR assumptions, described as uncertain in text only.

**Budget 2025 response** (26 November 2025): https://www.jrf.org.uk/news/jrf-responds-to-autumn-budget-2025. A qualitative statement with no figures.

### 2.4 Office for Budget Responsibility (OBR)

**Economic and fiscal outlook, March 2026:** https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/. Income detail: https://obr.uk/forecasts-in-depth/the-economy-forecast/income/

- **Headline metric:** real household disposable income (RHDI) per person, from the National Accounts, deflated by the consumption deflator. Growth is under ½% a year on average from 2025-26 to 2030-31, after about 2% a year in 2023-24 and 2024-25. The record fall was more than 3% in 2022-23.
- **Breakdowns:** none distributional. Chart 2.12 is a stacked-bar decomposition of RHDI per person growth into labour income, non-labour income, net taxes and benefits, and prices.
- **Horizon:** to 2030-31.
- **Charts:** stacked contribution bars with a net-growth marker; long history from 1956-57. Past boxes (e.g. https://obr.uk/box/developments-in-the-outlook-for-household-living-standards/, March 2022) compare against the previous forecast and decompose the revision.
- **Uncertainty:** point forecasts. GDP fan charts exist elsewhere in the EFO, but there is none for RHDI. Revision-vs-previous-forecast is the main device.
- The next EFO is due 28 October 2026, alongside the Budget.

### 2.5 DWP: Households Below Average Income (outturn) and child poverty projections

**HBAI FYE 1995 to FYE 2025** (26 March 2026): https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025/households-below-average-income-an-analysis-of-the-uk-income-distribution-fye-1995-to-fye-2025

- **Headline metrics (2024-25):**
  - Median income: £719 a week BHC and £623 AHC, both +5% real and statistically significant.
  - Inequality: Gini 33% BHC and 37% AHC; 90:10 ratio 3.7 BHC and 4.5 AHC; all unchanged.
  - Relative poverty: 16% BHC and 20% AHC for all people; children 21% BHC and 27% AHC.
  - Material deprivation: 24% of children.
  - Food insecurity: 9%. Food bank use: 3.8%.
- **Breakdowns:** region (3-year averages), ethnicity, family type, economic and work status, tenure, disability (39% of people live in a family with a disabled member), age, number of children, and percentiles up to p97.
- **Real basis:** CPI variants. The AHC series uses CPI excluding rents, maintenance and water charges.
- **Charts:** time-series lines from FYE 2003, with the IFS long run from 1961. A percentile-change chart with shaded 95% CIs.
- **Uncertainty:** 95% CIs on levels, e.g. relative BHC 16% (14–18). Changes are flagged [s] or [ns]. Dotted lines mark series breaks: administrative benefit data from FYE 2022, revised back to FYE 2019 in summer 2026.

**Low income poverty projections for children, FYE 2025 to FYE 2030** (26 November 2025): https://www.gov.uk/government/publications/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025

- Covers four measures for children only. Relative AHC is 4.7m (33%) in FYE26 and 4.3m (30%) in FYE27 to FYE30. The projections use the Policy Simulation Model and OBR March 2025 assumptions, including the two-child limit removal but no other Budget 2025 measures.
- They are labelled "not a forecast". There are no ranges, and outturn and projection are distinguished only by column label. The base is the pre-revision HBAI series (the FYE 2024 outturn of 31% has since been revised), so the levels are not directly comparable with the March 2026 series.
- Related: Poverty impacts of social security changes at Budget 2025: https://www.gov.uk/government/publications/poverty-impacts-of-social-security-changes-at-budget-2025

### 2.6 NIESR

**Economic Outlook, Summer 2026:** https://niesr.ac.uk/reports/economic-outlook-summer-2026 (PDF https://niesr.ac.uk/wp-content/uploads/2026/07/Economic-Outlook-Summer-2026.pdf)

- **Headline metric:** real personal disposable income (RPDI), calendar years: +1.0% in 2026 and +0.1% in 2027.
- **Charts:** Fig 25 is a stacked contribution chart (inflation, effective tax on incomes, nominal earnings, employment, transfers, other), with the 2008-19 average and a 2028-30 average either side of the annual bars. A "Forecast" marker separates outturn from forecast. The text also covers consumer confidence and credit defaults.

**Economic Outlook, Spring 2026, Box B:** https://niesr.ac.uk/reports/economic-outlook-spring-2026

- Distributional effects of the oil shock. A functional VAR on HBAI AHC equivalised income (1994-95 to 2023-24) is linked to oil prices, GDP and unemployment, with LCFS Engel curves for spending.
- Outputs: change in households by £500 monthly-income band (Fig B1, bar chart); energy and total spending growth by decile, with deciles 2–4 hit hardest (Fig B2); absolute poverty up by about 195,000 households. Policy costings for an income floor and a UC uplift.

**Earlier tracker-style work:** NIESR tracked decile living standards against pre-pandemic levels and destitution counts (e.g. Autumn 2023: https://niesr.ac.uk/publications/low-middle-income-households-facing-seven-years-falling-living-standards?type=uk-economic-outlook) and published the UK Living Standards Review 2025 (https://niesr.ac.uk/wp-content/uploads/2025/03/JC871-NIESR-UK-Living-Standards-Review-2025-final-version.pdf). I did not find a 2026 decile-level income forecast.

### 2.7 Scotland: Fraser of Allander Institute (FAI), Scottish Government, IFS

- Statutory child poverty targets for 2030-31: relative below 10%, absolute below 5%, combined low income and material deprivation below 5%, persistent below 5%. Interim 2023-24 targets were 18%, 14%, 8% and 8%.
- FAI's "Meeting Scotland's child poverty targets" (March 2025, https://fraserofallander.org/meeting-scotlands-child-poverty-targets-2/; full report https://strathprints.strath.ac.uk/92675/2/Randolph-etal-FAI-2025-Meeting-Scotlands-Child-Poverty-Targets.pdf) uses the IPPR tax-benefit model. It projects relative child poverty to 2030-31 and finds a gap to target of about 11 points, about 10 after two-child-limit mitigation. It costs packages at £4.6–4.9bn.
- The Scottish Government projects 18% relative child poverty in 2030-31, as reported by the IFS (https://ifs.org.uk/news/scotlands-child-poverty-rate-lower-rest-uk-ambitious-2030-targets-set-be-missed).
- Relevance here: a Scotland panel showing projected child poverty against these four target lines is computable with `region == SCOTLAND`. Sample size is the constraint.

### 2.8 Child Poverty Action Group (CPAG)

- CPAG's Budget 2025 submission (https://cpag.org.uk/sites/default/files/2025-10/Budget_25_submission_final.pdf) put abolition of the two-child limit at 350,000 children out of poverty immediately and 150,000 prevented from entering over the Parliament. It cited 300,000 children in households affected by the benefit cap.
- CPAG's metrics are children by number of siblings, two-child-limit-affected and benefit-cap-affected families, and the Cost of a Child (CPAG/Loughborough, MIS-based). This is advocacy material, used here only to identify which breakdowns are in public use.

### 2.9 Health Foundation

- The Evidence Hub (https://www.health.org.uk/evidence-hub/money-and-resources/poverty/inequalities-in-poverty; https://www.health.org.uk/resources-and-toolkits/data-tools/evidence-hub/trends-in-poverty) gives poverty by family type, ethnicity and tenure. Single parents are more than three times as likely as couples without children to be in poverty.
- It also covers persistent poverty, material deprivation, and income-gradient health: 43% of people in the bottom income group report fair or bad health, against 15% in the top group. Outturn only, with no projections. Its relevant contribution is disability and health as a breakdown.

### 2.10 Others noted in passing

- ISER/CeMPA working paper 3/26 (https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/cempa/cempa3-26.pdf): UKMOD on Budget 2025, with mean disposable income by decile and the Gini.
- HM Treasury, "Impact on households" (https://assets.publishing.service.gov.uk/media/69269c6222424e25e6bc31bb/Impact_on_households.pdf): decile impacts in 2028-29.
- JRF/Loughborough Minimum Income Standard 2026 (September 2026).

### 2.11 Cross-cutting comparison

| Feature | RF | IFS | JRF | OBR | DWP HBAI | NIESR | This demo |
|---|---|---|---|---|---|---|---|
| AHC income as headline | Yes | Yes (both) | Yes | n/a | Both | AHC (Box B) | BHC only |
| Growth by decile/percentile | Vigintiles | Percentiles | — | — | Percentiles + CI | Deciles (spending) | No |
| Lower-half vs upper-half split | Yes | — | — | — | — | Bottom 40% (older) | No |
| Gini / 90:10 | — | Yes | — | — | Yes | — | No |
| Deep poverty / depth | — | — | <40% median, gap | — | — | — | No |
| Family type / 3+ children | Yes | Yes | Yes | — | Yes | — | No |
| Tenure / disability / region | Yes | Yes | Yes | — | Yes | — | No |
| Growth decomposition | Yes | Yes | — | Yes | — | Yes | No |
| RHDI per person (nat. accounts) | Compared | — | — | Headline | — | RPDI | No |
| Policy counterfactual line | Yes | Yes | Text | — | — | Shock vs no-shock | No (pre/post only) |
| Statistical uncertainty | No | Text | No | No (RHDI) | 95% CI, [s]/[ns] | No | No |
| Scenarios | Earnings, energy | — | — | Revisions | — | Oil scenario | No |

How peers handle forecasts and outturn: the norm is a solid line for outturn, then dashed or shaded for projections, plus a note saying when projections start. DWP and RF add notes ("not a forecast"; "all values beyond X are projections"). Only HBAI shows statistical uncertainty. Projections use scenarios or counterfactuals instead of bands. The demo's pre/post-Budget toggle is a forecast-revision device, which matches the OBR's revision charts, but it is not an uncertainty device.

## 3. Recommendations

The ranking rule: a metric is ranked high when it is (i) published by at least two of the bodies above, (ii) computable on the existing baseline with policyengine-uk 2.130.1, and (iii) useful on Budget day, when the post-Budget run replaces the pre-Budget one.

Variable names below were checked against the installed package at `.venv/lib/python3.*/site-packages/policyengine_uk`. Input-variable presence (`tenure_type`, `region`, `is_disabled_for_benefits`, `hours_worked`, `employment_income`, `rent`, PIP/DLA categories) was checked in a local copy of `microcosm_uk_2024_25.h5` (`~/drill2-data`), not the exact tag the demo uses. Re-confirm on tag `...20261019T083323Z-6cba5d71` before shipping.

### Top 6

**1. Real income growth across the distribution, BHC and AHC: deciles plus a lower-half vs upper-half split** [class (a)]

- **What:** annual and cumulative (2024-25 to 2030-31) real growth in equivalised income by decile (or vigintile, dropping the bottom 5% as RF does), BHC and AHC. Add a headline split of below-median vs above-median non-pensioners vs pensioners, using RF's Box 1 definition. Add the median AHC income series the dashboard currently lacks.
- **Why:** RF's main outlook object (LSO 2026 Fig 1, 5, 6, 10; LSO 2025 Fig 9, 10). IFS's growth incidence curves (R329 Fig 2.4, 3.7, 4.4). HBAI's percentile chart. The Budget's distributional story is told in these terms. Links: https://www.resolutionfoundation.org/app/uploads/2026/02/LSO-2026.pdf ; https://ifs.org.uk/sites/default/files/2024-07/Living-standards-poverty-and-inequality-in-the-UK-2024-IFS-Report-R329.pdf ; https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025/households-below-average-income-an-analysis-of-the-uk-income-distribution-fye-1995-to-fye-2025
- **How:**
  - Use `equiv_hbai_household_net_income` and `equiv_hbai_household_net_income_ahc`, person-weighted (`household_weight × household_count_people`).
  - Re-rank each year: `household_income_decile` is BHC-ranked and person-weighted. For AHC, rank on the AHC variable.
  - This is anonymous-quantile growth (quantile in year t vs the same quantile in t−1), not panel growth. Say so on the page.
  - Deflate in the pipeline from the parameters `gov.economic_assumptions.indices.obr.consumer_price_index` (BHC) and `consumer_price_index_ahc` (AHC). Do not use `real_hbai_household_net_income`. Its `inflation_adjustment` deflates to `datetime.now()`'s year, so the price base silently moves when the calendar rolls over.
  - Non-pensioner families are benefit units with no member whose `hbai_person_type` is `PENSIONER`. `hbai_person_type` is person-level, so aggregate it to the benefit unit.
- **Chart:** a growth incidence line (x = decile, y = % real growth), one line per period: 2026-27 and the rest of the Parliament. Next to it, a three-line cumulative-change chart for below-middle, above-middle and pensioners, indexed to 2024-25.

**2. Child poverty by family size, with the two-child-limit repeal counterfactual** [class (a)]

- **What:** relative and absolute AHC child poverty split by children in the benefit unit (1, 2, 3+) and by lone parent vs couple. Add a "without the April 2026 repeal" line.
- **Why:** the 2026-27 child poverty fall is the single largest projected change in this baseline. RF (LSO 2026 Fig 15: 33% to 30%), DWP (4.7m to 4.3m), JRF (about 400,000 fewer; 3+ families at about twice the rate) and the IFS (the rise was "entirely driven" by 3+ families) all lead with it. CPAG tracks the same split. Links: https://www.resolutionfoundation.org/app/uploads/2026/02/LSO-2026.pdf ; https://www.gov.uk/government/publications/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025 ; https://www.jrf.org.uk/news/progress-expected-to-stall-as-deep-poverty-and-child-poverty-reach-record-levels
- **How:**
  - The installed baseline already sets `gov.dwp.universal_credit.elements.child.limit` to `.inf` from 2026-04-06 (it was 2 from 2017-04-06). The baseline therefore embeds the repeal.
  - The counterfactual is a reform setting it back to 2 from 2026-04-06.
  - Count children with `is_hbai_dependent_child` summed to the benefit unit or household. Do not use `benunit_count_children`, `num_children` or `family_type`: all three are flagged deprecated in 2.130.1 (age-18 cut-off).
  - Lone parent: `is_lone_parent`, or `benunit_count_adults == 1` with dependent children.
  - Optional: `uc_is_child_limit_affected` (person) for the directly affected population, and `benefit_cap_reduction > 0` for the benefit-cap interaction the IFS flagged.
- **Diagnostic value:** the current projection shows relative AHC child poverty at 26.6% (2025-26) and 25.0% (2026-27), a fall of 1.6 points. RF and DWP project about 3 points. That gap should be explained (levels sit on the revised HBAI series; the counterfactual isolates the policy effect) before the Budget view goes public.
- **Chart:** a line chart with the baseline solid and the counterfactual dashed, with outturn and projection shading. Small-multiple bars by family size for 2025-26 vs 2026-27 vs 2030-31.

**3. Inequality: Gini and 90:10, BHC and AHC** [class (a); outturn needs HBAI tables (b)]

- **What:** Gini coefficient and the p90/p10 ratio (optionally p50/p10 and the top 1% share), BHC and AHC, with HBAI outturn and the projection on the same axis.
- **Why:** HBAI headline inequality measures (Gini 33%/37%, 90:10 3.7/4.5 in 2024-25). The IFS long-run series. ISER/CeMPA's Budget 2025 paper reports a falling Gini. It is the standard check that a package moved the distribution. Links: https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025/households-below-average-income-an-analysis-of-the-uk-income-distribution-fye-1995-to-fye-2025 ; https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/cempa/cempa3-26.pdf
- **How:** `policyengine.outputs.inequality._gini(values, weights)` already exists in the installed `policyengine` 6.8.0. Apply it to the equivalised BHC/AHC variable with person weights. Percentiles come from a weighted quantile on the same arrays. HBAI outturn is in the HBAI summary tables (it needs extracting, which is a minor addition to `pipeline/extract_hbai.py`).
- **Chart:** two small line charts (Gini; 90:10), BHC and AHC lines, solid outturn and dashed projection.

**4. Very deep poverty and poverty depth (JRF definitions)** [class (a)]

- **What:** the share and number of people below 40% of median AHC, plus the mean poverty gap (how far below the line, as a % of the line). The headline relative AHC poverty is split into bands: below 40%, 40–50%, 50–60% of median.
- **Why:** JRF UK Poverty 2026's lead finding (6.8m in very deep poverty, a record; average gap 29%, against 23% in the mid-1990s). The banded view shows whether Budget changes lift people over the line or reduce depth. Link: https://www.jrf.org.uk/news/progress-expected-to-stall-as-deep-poverty-and-child-poverty-reach-record-levels
- **How:**
  - Compute the person-weighted median of `equiv_hbai_household_net_income_ahc` each year, then the thresholds at 0.4, 0.5 and 0.6 × median.
  - Depth: `poverty_gap_ahc` (household, £ below the line), or compute directly as (line − income) / line over people in poverty.
  - **Do not** label `in_deep_poverty_ahc` / `in_deep_poverty_bhc` as JRF's measure. Those variables are "below half the absolute poverty line" (`absolute_poverty_threshold_bhc/ahc / 2`), a different line from 40% of the contemporary median.
- **Chart:** stacked bars or stacked area by year with the three bands (one home for the headline rate). A single line for the mean gap.

**5. Poverty and median income by tenure, family type, disability and region** [class (a); outturn needs HBAI tables (b)]

- **What:** relative AHC poverty and median AHC income by:
  - tenure: owner outright and mortgagor vs social rent vs private rent
  - family type: single, couple without children, lone parent, couple with children, pensioner
  - disability: anyone in the family disabled vs none
  - region: the 12 ITL1 regions/nations
- **Why:** HBAI publishes all four. RF LSO 2026 Fig 13–14 (lower-income private renters have the lowest and falling incomes; disabled vs non-disabled). JRF (disability, region, tenure). The Health Foundation (family type, tenure). The IFS (tenure for pensioners). The rent and mortgage-interest OBR series already on the dashboard feed straight into the tenure split. Links: https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025/households-below-average-income-an-analysis-of-the-uk-income-distribution-fye-1995-to-fye-2025 ; https://www.resolutionfoundation.org/app/uploads/2026/02/LSO-2026.pdf ; https://www.health.org.uk/evidence-hub/money-and-resources/poverty/inequalities-in-poverty
- **How:**
  - Tenure: `ons_tenure_type` (wraps the input `tenure_type`). The owner-outright vs mortgaged split needs `tenure_type` itself.
  - Family type: `hbai_person_type`, `is_lone_parent`, `benunit_count_adults`, `is_hbai_dependent_child`.
  - Disability: `is_disabled_for_benefits` (input from DLA/PIP receipt, so narrower than HBAI's Equality Act definition: label it "disability benefit recipient in family"). `num_disabled_adults` and `num_disabled_children` are at benunit level.
  - Region: `region`.
  - Caveat: HBAI uses 3-year averages for region because of sample size. Microcosm is calibrated, but regional and small-cell estimates should carry a "model estimate" note, and region could be rate-only, without counts.
- **Chart:** a dot plot (one row per group, dots for 2024-25 and 2030-31, with arrows) or a compact heatmap of rate by group × year. Use one breakdown selector, not four separate tabs.

**6. Macro cross-check: OBR RHDI per person next to the microsimulation, with a growth decomposition** [(a) is class (b); (b) and (c) are class (a)]

- **What:**
  - (a) Add the OBR's RHDI per person growth (outturn and forecast) to the forecast panel, with the post-Budget update on 28 October.
  - (b) Show PolicyEngine's mean real equivalised income growth next to it, labelled as a survey-based measure, not RHDI.
  - (c) Decompose PolicyEngine's real income growth into earnings, benefits, direct taxes, housing costs (AHC) and prices, for the lower half vs the upper half.
- **Why:** the OBR's living standards headline (EFO Chart 2.12, stacked decomposition). RF compares the two every edition (LSO 2026 Fig 2–4 and Box 2). NIESR Fig 25 decomposes RPDI the same way. RF LSO 2026 Fig 7 is the distributional version. Links: https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/ ; https://obr.uk/forecasts-in-depth/the-economy-forecast/income/ ; https://niesr.ac.uk/wp-content/uploads/2026/07/Economic-Outlook-Summer-2026.pdf
- **How:**
  - (a) needs extra data: the OBR EFO economy supplementary table. It is a few numbers and is cheap.
  - (b)–(c) are computable: `employment_income` + `self_employment_income`, `household_benefits` (or `hbai_benefits`), `household_tax` (or `income_tax`, `national_insurance`, `council_tax`), `housing_costs` and `household_gross_income`, aggregated by group and deflated as in recommendation 1.
  - Do not name the PolicyEngine series "RHDI". National-accounts RHDI includes non-profit institutions and imputed items and will diverge (RF Box 2).
- **Chart:** stacked contribution bars per year with a net-growth dot (OBR/NIESR style). A two-line comparison of OBR RHDI per person vs PolicyEngine mean.

### Also worth doing (lower rank)

- **Earnings and hours:** median `employment_income` among workers and mean `weekly_hours` / `hours_worked`, by decile. RF LSO 2025 Fig 4–5 and IFS Fig 4.18 cover this. Computable, but in this static baseline hours are held to the dataset and uprated rather than projected, so it adds little beyond the OBR earnings line already shown. Use it only to show gross-to-net pass-through (RF Fig 5: gross vs net pay growth by pay level).
- **Median income by age group (children vs working-age vs pensioners), AHC:** RF LSO 2025 Fig 12/14 and IFS Fig 4.1. Trivially computable once recommendation 1 exists. A good candidate for the group selector.
- **Pre-Budget vs post-Budget revision chart:** the OBR and RF both show "this forecast vs last". The existing toggle could become an overlaid revision chart on Budget day.
- **Uncertainty:**
  - Put HBAI 95% CIs on the outturn points (DWP publishes them) and dashed series-break markers at FYE 2022 (and FYE 2019 once the summer revision lands).
  - For projections, follow RF: one or two scenarios rather than statistical bands. The obvious pair is an OBR-earnings path vs a Bank of England earnings path, run by changing `gov.economic_assumptions` earnings growth.
- **Scotland panel:** projected child poverty against the four statutory 2030-31 targets (FAI, Scottish Government, IFS), using `region == SCOTLAND`. Relative and absolute are computable. Combined low income and material deprivation, and persistent poverty, are not.

### Fixes to the existing pipeline noticed during the review (not recommendations from peers)

- **Age groups:** `run_projections.py` defines children as age < 18, working age as 16 ≤ age < 65 and pensioners as age ≥ 65. 16–17 year olds are counted twice, and the pensioner cut-off is 65, not State Pension age (66 from 2020). HBAI's groups are dependent children, working-age adults below SPA, and pensioners at or above SPA. The package provides exactly this as `hbai_person_type` (uses `is_hbai_dependent_child` / `is_hbai_working_age_adult`). Switching to it would make the projection groups match the HBAI outturn shown beside them.
- **Absolute vs relative level gap:** in 2024-25 the projection gives absolute AHC 15.2% vs relative AHC 18.1% for all people, and absolute BHC 12.2% vs relative BHC 14.5%. The meta note says the absolute line is "60% of FYE 2025 median held in real terms", so if that means PolicyEngine's own 2024-25 median, the two rates should coincide in 2024-25. A likely explanation is that the `absolute_poverty_threshold_*` parameter is anchored to HBAI's published median rather than PolicyEngine's. Not investigated further; worth checking before Budget day.
- **Level gap to HBAI:** the projected 2024-25 relative AHC rate is 18.1% (all) and 25.7% (children), against HBAI outturn of 20% and 27%. Peers (RF, DWP) apply projected changes to the HBAI level rather than showing model levels. Consider saying which approach the dashboard uses, or showing the change from 2024-25 alongside levels.

### (b) Needs extra data

- OBR RHDI per person and the EFO decomposition (recommendation 6a). Easy.
- HBAI Gini, 90:10, family-type, tenure, region and disability outturn tables for the outturn halves of recommendations 3 and 5. Easy (same HBAI release).
- Household Cost Indices by decile (RF Fig 18, IFS Fig 3.6): ONS HCI. Needed for decile-specific deflators instead of a single CPI.
- Energy spending by decile (NIESR Box B): LCFS-based Engel curves. PolicyEngine has a consumption imputation, but energy-share validation is unknown.

### (c) Out of scope for this dashboard

- Material deprivation, combined low income and material deprivation, food insecurity and food bank use (HBAI, JRF, IFS, the Health Foundation). These are FRS survey questions with no model formula, so they cannot be projected by static microsimulation.
- Persistent poverty (Understanding Society panel; a Scottish target).
- Ethnicity breakdowns (JRF, HBAI). No ethnicity variable was found in the dataset.
- Health outcomes by income (the Health Foundation).
- Destitution (JRF/NIESR). It needs a different survey.
- Savings and wealth by income group (RF LSO 2025 Fig 13). Possible with `household_wealth_decile` and the imputed wealth variables, but calibration for low-income savings is unvalidated. Leave it out.

## 4. Sources

- Resolution Foundation, Living Standards Outlook 2026 (Feb 2026): https://www.resolutionfoundation.org/publications/living-standards-outlook-2026/ ; PDF https://www.resolutionfoundation.org/app/uploads/2026/02/LSO-2026.pdf
- Resolution Foundation, Living Standards Outlook 2025 (June 2025): https://www.resolutionfoundation.org/app/uploads/2025/06/LivingStandardsOutlook2025.pdf
- Resolution Foundation, Stairway to headroom, Autumn Budget 2025 response (Nov 2025): https://www.resolutionfoundation.org/app/uploads/2025/11/Stairway-to-headroom.pdf
- Resolution Foundation, Spring Forecast 2026 press release (4 Mar 2026): https://www.resolutionfoundation.org/press-releases/war-in-middle-east-threatens-bumper-year-of-living-standards-growth-for-lower-income-families/
- Resolution Foundation, Living Standards Audit 2019 (latest found): https://www.resolutionfoundation.org/app/uploads/2019/07/Living-Standards-Audit-2019.pdf
- IFS, Living standards, poverty and inequality in the UK: 2024 (R329): https://ifs.org.uk/sites/default/files/2024-07/Living-standards-poverty-and-inequality-in-the-UK-2024-IFS-Report-R329.pdf
- IFS, Living standards, poverty and inequality hub and data: https://ifs.org.uk/living-standards-poverty-and-inequality-uk
- IFS, Are fewer people living in poverty than previously thought?: https://ifs.org.uk/articles/are-fewer-people-living-poverty-previously-thought
- IFS, New data suggest dramatic decline in living standards…: https://ifs.org.uk/articles/new-data-suggest-dramatic-decline-living-standards-it-may-just-be-quality-data-has
- IFS, Scotland's child poverty rate…: https://ifs.org.uk/news/scotlands-child-poverty-rate-lower-rest-uk-ambitious-2030-targets-set-be-missed
- JRF, UK Poverty 2026 (27 Jan 2026): https://www.jrf.org.uk/news/progress-expected-to-stall-as-deep-poverty-and-child-poverty-reach-record-levels
- JRF, response to Autumn Budget 2025: https://www.jrf.org.uk/news/jrf-responds-to-autumn-budget-2025
- OBR, Economic and fiscal outlook, March 2026: https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/
- OBR, Income (forecasts in depth): https://obr.uk/forecasts-in-depth/the-economy-forecast/income/
- DWP, HBAI FYE 1995 to FYE 2025 (26 Mar 2026): https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025/households-below-average-income-an-analysis-of-the-uk-income-distribution-fye-1995-to-fye-2025
- DWP, Low income poverty projections for children FYE 2025 to FYE 2030 (Nov 2025): https://www.gov.uk/government/publications/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025/low-income-poverty-projections-for-children-fye-2025-to-fye-2030-november-2025
- DWP, Poverty impacts of social security changes at Budget 2025: https://www.gov.uk/government/publications/poverty-impacts-of-social-security-changes-at-budget-2025
- NIESR, Economic Outlook Summer 2026: https://niesr.ac.uk/wp-content/uploads/2026/07/Economic-Outlook-Summer-2026.pdf
- NIESR, Economic Outlook Spring 2026: https://niesr.ac.uk/reports/economic-outlook-spring-2026
- NIESR, UK Living Standards Review 2025: https://niesr.ac.uk/wp-content/uploads/2025/03/JC871-NIESR-UK-Living-Standards-Review-2025-final-version.pdf
- Fraser of Allander, Meeting Scotland's child poverty targets (Mar 2025): https://fraserofallander.org/meeting-scotlands-child-poverty-targets-2/
- CPAG, Budget 2025 submission: https://cpag.org.uk/sites/default/files/2025-10/Budget_25_submission_final.pdf
- Health Foundation Evidence Hub, inequalities in poverty: https://www.health.org.uk/evidence-hub/money-and-resources/poverty/inequalities-in-poverty
- ISER CeMPA WP 3/26: https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/cempa/cempa3-26.pdf
- HM Treasury, Impact on households (Budget 2025): https://assets.publishing.service.gov.uk/media/69269c6222424e25e6bc31bb/Impact_on_households.pdf

### Limits of this review

- **IFS:** HTML pages were blocked (403). No 2025 annual report, Green Budget 2025 living-standards chapter or Budget 2025 decile figures could be read directly. IFS coverage relies on the 2024 PDF and search snippets.
- **JRF:** UK Poverty 2026 figures come from JRF's news release, not the full report's charts.
- **Scope of checks:** dataset inputs were checked on a local `microcosm_uk_2024_25.h5` copy, not the exact tag the demo uses. No new numbers were computed. The PolicyEngine figures quoted are from the existing `pipeline/output/projections.json`.
