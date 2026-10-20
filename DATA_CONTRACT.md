# Data contract: `public/data/outlook.json`

Written by `pipeline/build_outlook.py` (data agent), read by the frontend.
Years are UK fiscal years as strings, e.g. `"2024-25"`. Rates are fractions (0.132), money in £ per person per year (equivalised, HBAI basis) unless a field says otherwise. Projection series start in 2025-26; 2024-25 model output appears only in `meta.validation_2024_25`.

```json
{
  "meta": {
    "generated_at": "ISO timestamp",
    "policyengine": "6.8.0",
    "policyengine_uk": "x.y.z (the version policyengine pins)",
    "dataset": {"name": "microcosm_uk_2024_25", "tag": "HF revision tag", "sha256": "..."},
    "real_price_base": "2025-26",
    "deflator": "name of the index used for real terms",
    "outturn_source": "HBAI release name + URL",
    "headline_end_year": "2029-30",
    "headline_end_year_note": "one sentence: why headline comparisons stop at 2029-30",
    "method": {"<series key>": "how it is computed (variables, weights, parameters)"},
    "comparators": {"income_by_decile": "RF LSO 2026 ...", "child_poverty": "...", "deep_poverty": "..."},
    "validation_2024_25": {"median_equivalised_income_weekly": {"bhc": {"model": 762, "hbai": 719}}, "relative_ahc": {}, "gini": {}, "p90_p10": {}},
    "notes": ["at most ~8 notes, one plain sentence each, <= 160 characters"]
  },
  "living_standards": {
    "metrics": {"mean_equivalised_income": "Mean equivalised income (BHC)", "median_equivalised_income": "Median equivalised income (BHC)",
                "mean_equivalised_income_ahc": "Mean equivalised income (AHC)", "median_equivalised_income_ahc": "Median equivalised income (AHC)"},
    "outturn":    {"median_equivalised_income": [{"year": "2021-22", "nominal": 0, "real": 0}]},
    "projection": {"median_equivalised_income": [{"year": "2025-26", "nominal": 0, "real": 0}]}
  },
  "poverty": {
    "measures": {"absolute_bhc": "Absolute (BHC)", "absolute_ahc": "Absolute (AHC)", "relative_bhc": "Relative (BHC)", "relative_ahc": "Relative (AHC)"},
    "groups": {"all": "All people", "children": "Children", "working_age": "Working-age adults", "pensioners": "Pensioners"},
    "outturn":    {"absolute_bhc": {"all": [{"year": "2021-22", "rate": 0.15}]}},
    "projection": {"absolute_bhc": {"all": [{"year": "2025-26", "rate": 0.132}]}}
  },
  "forecast": {
    "pre_label": "OBR March 2026 (pre-Budget)",
    "post_label": "Budget forecast",
    "post_published": false,
    "headline": ["cpi", "rpi", "earnings"],
    "sections": [
      {"title": "Inflation and price indices", "series": [
        {"key": "cpi", "label": "CPI inflation",
         "pre": [{"year": "2026", "value": 0.025}], "post": [{"year": "2026", "value": 0.025}]}
      ]}
    ]
  }
}
```

Until the Budget forecast is published, `post` equals `pre` and `post_published` is `false`; the UI must say so visibly.

`living_standards` changed on 20 October 2026: the unequivalised `mean_income` and `median_income` were removed (peers report equivalised HBAI income) and the AHC pair added. BHC series are deflated with OBR CPI, AHC series with CPI after housing costs (see `meta.deflator`). Population groups in `poverty` now follow HBAI (`hbai_person_type`).

## Added sections (20 October 2026)

All are top-level keys. Years are fiscal, `"2025-26"` to `"2030-31"`. Real values are in 2025-26 prices. Each section carries its own `notes` (section-specific caveats, one sentence each).

### `income_by_decile`
Real growth in equivalised income by person-weighted income decile (re-ranked each year; growth compares positions, not people).
```json
{
  "base_year": "2025-26", "end_year": "2030-31", "statistic": "...", "deciles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "bases": {"bhc": "...", "ahc": "..."},
  "bhc": {"cumulative_growth_to_end": [10 fractions],
          "by_year": [{"year": "2025-26", "real_median": [10 x £], "cumulative_growth": [10 fractions vs 2025-26]}]},
  "ahc": {"...same shape..."},
  "non_pensioner_split": {"basis": "ahc", "statistic": "...", "groups": {"below_middle": "...", "above_middle": "..."},
                          "series": {"below_middle": [{"year": "2025-26", "real_mean": 0, "cumulative_growth": 0.0}], "above_middle": []}},
  "comparator": "Resolution Foundation, Living Standards Outlook 2026", "notes": []
}
```

### `child_poverty_by_family`
Child poverty (relative and absolute AHC) by number of HBAI dependent children in the benefit unit and lone parent vs couple, plus a two-child-limit-kept counterfactual.
```json
{
  "measures": {"relative_ahc": "Relative (AHC)", "absolute_ahc": "Absolute (AHC)"},
  "groups": {"all": "...", "one_child": "...", "two_children": "...", "three_plus_children": "...", "lone_parent": "...", "couple": "..."},
  "projection": {"relative_ahc": {"one_child": [{"year": "2025-26", "rate": 0.18}]}, "absolute_ahc": {}},
  "children_millions": {"all": [{"year": "2025-26", "value": 14.46}]},
  "unweighted_children": {"all": 38901},
  "two_child_limit_kept": {"label": "Two-child limit kept", "measure": "relative_ahc", "group": "all", "reform": {"<parameter>": "2 from 2026-27"},
                           "baseline": [{"year", "rate"}], "counterfactual": [{"year", "rate"}], "counterfactual_absolute_ahc": [{"year", "rate"}]},
  "notes": ["explains the 2026-27 fall against RF/DWP"]
}
```
`baseline` repeats `poverty.projection.relative_ahc.children` for convenience.

### `inequality`
```json
{
  "measures": {"gini": "Gini coefficient", "p90_p10": "90:10 ratio"}, "bases": {"bhc": "...", "ahc": "..."},
  "outturn":    {"gini": {"bhc": [{"year": "2021-22", "value": 0.332}], "ahc": []}, "p90_p10": {"bhc": [], "ahc": []}},
  "projection": {"gini": {"bhc": [{"year": "2025-26", "value": 0.303}], "ahc": []}, "p90_p10": {"bhc": [], "ahc": []}},
  "notes": []
}
```
Gini is a fraction (0.33, not 33). Outturn is HBAI Table 1.2b, 2021-22 to 2024-25.

### `deep_poverty`
JRF-style very deep poverty: people below 40% (and 50%) of the model's own median equivalised AHC income. Not `in_deep_poverty_ahc`.
```json
{
  "measures": {"below_40pc_median_ahc": "Very deep poverty: below 40% of median income (AHC, JRF-style)", "below_50pc_median_ahc": "Below 50% of median income (AHC)"},
  "projection": {"below_40pc_median_ahc": [{"year": "2025-26", "rate": 0.077, "people_millions": 5.3, "threshold_annual": 14294}], "below_50pc_median_ahc": []},
  "notes": []
}
```

### `poverty_by_group`
Relative AHC poverty and median equivalised BHC income by tenure, family type, disability and region, for 2025-26, 2029-30 and 2030-31.
```json
{
  "years": ["2025-26", "2029-30", "2030-31"],
  "measures": {"relative_ahc": "...", "median_equivalised_income_bhc": "..."},
  "min_unweighted_households": 100,
  "breakdowns": {
    "tenure": {"label": "Tenure", "groups": {"owned_outright": "Owned outright"},
               "cells": {"owned_outright": {"2025-26": {"relative_ahc": 0.089, "median_equivalised_income_bhc": {"nominal": 0, "real": 0},
                                                          "people_millions": 0.0, "unweighted_households": 37727, "suppressed": false}}}},
    "family_type": {}, "disability": {}, "region": {}
  },
  "notes": []
}
```
A cell with fewer than `min_unweighted_households` unweighted households has `suppressed: true` and `null` values (counts are kept).

### `obr_rhdi`
OBR real household disposable income per person (national accounts), fiscal years. Not comparable in level with the survey-based series.
```json
{
  "label": "OBR real household disposable income per person", "unit": "£ per person per year, 2023 prices (national accounts)",
  "basis": "Fiscal year", "source": "OBR EFO March 2026 economy tables, Table 1.5 ...", "definition": "NRJR / EBAQ", "url": "...", "file_sha256": "...",
  "series": [{"year": "2021-22", "value": 26124, "index_2008q1_100": 111.8, "growth": null, "type": "outturn", "source_row": 137}],
  "notes": []
}
```
`growth` is year-on-year (fraction); `type` is `"outturn"` up to 2024-25 and `"forecast"` after; `source_row` is the Excel row in Table 1.5.

### `meta.headline_end_year` (20 October 2026)
`"2029-30"`. Headline comparisons (cumulative growth, start-to-end changes, group snapshots) should end here. Yearly series still run to 2030-31, but that year contains a model step: policyengine-uk 2.130.1 ends the UC health element protection in 2030, a bug (pe-uk #2282) fixed in 2.134.4 that the policyengine 6.8.0 pin predates. To get growth to the headline year, use `income_by_decile.<basis>.by_year` for 2029-30; `cumulative_growth_to_end` still runs to `end_year` (2030-31).
