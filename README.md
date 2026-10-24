# UK living standards outlook (demo)

A demo dashboard of the PolicyEngine baseline for the Autumn Budget 2026: projected household incomes, inequality and poverty under current law from 2026–27 (the base year, in 2026–27 prices) to 2029–30, next to the official DWP Households Below Average Income series, plus the OBR economic forecast that drives the projection.

**Demo only.** National figures are unvalidated under this engine (policyengine 6.10.2 / policyengine-uk 2.132.6 on Microcosm UK data). See "About this data" on the page for known caveats. Series stop at 2029–30 because of the 2030–31 Universal Credit health element step (fixed in policyengine-uk 2.134.4, which the current engine pin predates).

## What's on the page

- **Baseline outlook**: household income (equivalised, BHC/AHC), income growth by decile, lower- vs higher-income halves of non-pensioners, inequality (Gini, 90:10), poverty rates, depth of poverty, poverty by group and child poverty by family.
- **Forecast changes**: the OBR March 2026 forecast series used by the model (CPI, CPIH, RPI, earnings, non-labour income, house prices, rents, mortgage interest) and OBR real household disposable income per person. The Autumn Budget 2026 forecast is added once published.

## Run it

```sh
bun install
bun run build      # static export to out/
bun run start      # serves out/ on http://localhost:3456
```

## Rebuild the data

The pipeline needs access to the Microcosm UK national dataset (private Hugging Face repo; set `HUGGING_FACE_TOKEN`).

```sh
uv sync
uv run python pipeline/run_projections.py <path to microcosm_uk_2024_25.h5>
uv run python pipeline/extract_hbai.py
uv run --no-project --with openpyxl --with pandas python pipeline/extract_obr.py
uv run python pipeline/build_outlook.py <path to microcosm_uk_2024_25.h5> <dataset tag>
```

The output shape is documented in [DATA_CONTRACT.md](DATA_CONTRACT.md). `research/living-standards-peer-review.md` compares what other organisations publish on living standards and why these sections were chosen.
