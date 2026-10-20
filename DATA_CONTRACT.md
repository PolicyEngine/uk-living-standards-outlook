# Data contract: `public/data/outlook.json`

Written by `pipeline/build_outlook.py` (data agent), read by the frontend.
Years are UK fiscal years as strings, e.g. `"2024-25"`. Rates are fractions (0.132), money in £ per household per year.

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
    "notes": ["free text caveats, e.g. 'unvalidated under this engine'"]
  },
  "living_standards": {
    "metrics": {"mean_income": "Mean income", "median_income": "Median income"},
    "outturn":    {"mean_income": [{"year": "2021-22", "nominal": 0, "real": 0}], "median_income": []},
    "projection": {"mean_income": [{"year": "2024-25", "nominal": 0, "real": 0}], "median_income": []}
  },
  "poverty": {
    "measures": {"absolute_bhc": "Absolute (BHC)", "absolute_ahc": "Absolute (AHC)", "relative_bhc": "Relative (BHC)", "relative_ahc": "Relative (AHC)"},
    "groups": {"all": "All people", "children": "Children", "working_age": "Working-age adults", "pensioners": "Pensioners"},
    "outturn":    {"absolute_bhc": {"all": [{"year": "2021-22", "rate": 0.15}]}},
    "projection": {"absolute_bhc": {"all": [{"year": "2024-25", "rate": 0.132}]}}
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
