"""Assemble public/data/outlook.json (see DATA_CONTRACT.md).

Inputs:
- pipeline/output/projections.json  (pipeline/run_projections.py)
- pipeline/data/hbai_outturn.json   (pipeline/extract_hbai.py)
- OBR March 2026 series from the policyengine-uk parameters pinned by
  policyengine==6.8.0 (gov.economic_assumptions.yoy_growth.obr.*), using the
  same series and section grouping as PolicyEngine/uk-spring-statement-2026.

Usage: uv run python pipeline/build_outlook.py <dataset.h5> <hf-revision-tag>
"""

import hashlib
import json
import sys
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

from policyengine_uk.system import system

ROOT = Path(__file__).parent.parent
PROJ = Path(__file__).parent / "output" / "projections.json"
HBAI = Path(__file__).parent / "data" / "hbai_outturn.json"
OUT = ROOT / "public" / "data" / "outlook.json"

PRICE_BASE_YEAR = 2025  # fiscal 2025-26
FORECAST_YEARS = range(2026, 2031)

# (key, label, parameter leaf under gov.economic_assumptions.yoy_growth.obr)
SECTIONS = [
    ("Inflation and price indices", [
        ("cpi", "CPI inflation", "consumer_price_index"),
        ("cpih", "CPIH inflation", "cpih"),
        ("cpi_ahc", "CPI (after housing costs)", "consumer_price_index_ahc"),
        ("rpi", "RPI inflation", "rpi"),
    ]),
    ("Income and earnings", [
        ("earnings", "Earnings growth", "average_earnings"),
        ("non_labour_income", "Non-labour income growth", "non_labour_income"),
    ]),
    ("Housing and rent", [
        ("house_prices", "House price growth", "house_prices"),
        ("rent", "Rent growth (private and social, ONS D7GQ)", "rent"),
        ("social_rent", "Social rent growth (England rent policy cap)", "social_rent"),
        ("mortgage_interest", "Mortgage interest growth", "mortgage_interest"),
    ]),
]


def fy(year: int) -> str:
    return f"{year}-{str(year + 1)[-2:]}"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(dataset_path: str, tag: str) -> None:
    proj = json.loads(PROJ.read_text())
    hbai = json.loads(HBAI.read_text())
    params = system.parameters.gov.economic_assumptions

    # Real terms: chained OBR CPI index from the pinned package; the value for
    # calendar key Y is applied to fiscal year Y-(Y+1), as policyengine-uk does
    # when uprating. real = nominal * P(2025) / P(Y).
    cpi_index = params.indices.obr.consumer_price_index
    base = cpi_index(f"{PRICE_BASE_YEAR}-01-01")

    def real(value: float, year: int) -> float:
        return value * base / cpi_index(f"{year}-01-01")

    years = sorted(int(y) for y in proj)
    living = {
        m: [
            {
                "year": fy(y),
                "nominal": round(proj[str(y)][m]),
                "real": round(real(proj[str(y)][m], y)),
            }
            for y in years
        ]
        for m in ("mean_income", "median_income")
    }

    measures = ["absolute_bhc", "absolute_ahc", "relative_bhc", "relative_ahc"]
    groups = ["all", "children", "working_age", "pensioners"]
    poverty_proj = {
        m: {
            g: [{"year": fy(y), "rate": round(proj[str(y)]["poverty"][m][g], 5)} for y in years]
            for g in groups
        }
        for m in measures
    }

    obr = params.yoy_growth.obr
    sections = []
    for title, series in SECTIONS:
        out_series = []
        for key, label, leaf in series:
            node = getattr(obr, leaf)
            pre = [
                {"year": str(y), "value": round(float(node(f"{y}-01-01")), 4)}
                for y in FORECAST_YEARS
            ]
            refs = node.metadata.get("reference", [])
            out_series.append({
                "key": key,
                "label": label,
                "parameter": f"gov.economic_assumptions.yoy_growth.obr.{leaf}",
                "source": refs[0]["title"] if refs else None,
                "pre": pre,
                "post": [dict(p) for p in pre],
            })
        sections.append({"title": title, "series": out_series})

    pe_version = version("policyengine")
    outlook = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "policyengine": pe_version,
            "policyengine_uk": version("policyengine-uk"),
            "dataset": {
                "name": Path(dataset_path).stem,
                "tag": tag,
                "sha256": sha256(Path(dataset_path)),
                "hf_repo": "policyengine/populace-uk-private",
            },
            "real_price_base": fy(PRICE_BASE_YEAR),
            "deflator": (
                "OBR CPI index (gov.economic_assumptions.indices.obr.consumer_price_index, "
                f"OBR EFO March 2026, policyengine-uk {version('policyengine-uk')}), "
                "calendar-year value Y applied to fiscal year Y-(Y+1), rebased to 2025-26 = 1"
            ),
            "outturn_source": (
                f"{hbai['source']['release']}, tables {hbai['source']['tables']}: "
                f"{hbai['source']['url']}"
            ),
            "outturn_file_sha256": hbai["source"]["file_sha256"],
            "method": {
                "mean_income": "Household-weighted mean of hbai_household_net_income (total household net income / number of households; not equivalised)",
                "median_income": "Household-weighted median of hbai_household_net_income (not equivalised)",
                "poverty": "Person-weighted share of people in households with in_poverty_bhc / in_poverty_ahc (absolute, 60% of FYE 2025 median held in real terms) and in_relative_poverty_bhc / in_relative_poverty_ahc (60% of contemporary median)",
                "groups": "children: age < 18; working_age: 16 <= age < 65; pensioners: age >= 65 (copied from PolicyEngine/scottish-budget-dashboard)",
                "source_repos": [
                    "PolicyEngine/scottish-budget-dashboard scripts/generate_scotland_baseline.py",
                    "PolicyEngine/uk-spring-statement-2026 src/spring_statement_data/reforms.py",
                ],
            },
            "notes": [
                "National figures are unvalidated under this engine (Microcosm, demo only).",
                "Projections are a current-law baseline: no Autumn Budget 2026 measures are modelled.",
                "Income outturn is left empty. DWP HBAI publishes income levels only on an equivalised, per-person basis (and mean unequivalised household income only as a growth rate, Table 1.2a); ONS Average household income is also equivalised. Neither matches the projected concept (unequivalised mean/median household net income), so no outturn series is shown rather than mixing concepts.",
                "Poverty outturn is the HBAI admin-linked series from 2021-22; HBAI anchors the absolute line to FYE 2025, so absolute and relative rates coincide in 2024-25.",
                "Age groups differ from HBAI: HBAI children are dependent children (under 16, or 16-19 in non-advanced education), working-age adults are below State Pension age and pensioners are at or above it. The projection uses age bands (under 18, 16-64, 65+), so 16-17 year olds count in both children and working age.",
                "The engine's 2024-25 median equivalised income (BHC) is about £762 a week against HBAI's £719, so with the absolute line fixed at HBAI's level the projected absolute rates sit well below outturn; relative rates are closer.",
                "Rent is ONS series D7GQ (private and social combined); social rent is the England rent policy cap, not an OBR forecast (the pinned package has 4.8% for 2026, against 4.4% in the uk-spring-statement-2026 March 2026 snapshot).",
                "The Autumn Budget 2026 OBR forecast is not yet published: post equals pre.",
            ],
        },
        "living_standards": {
            "metrics": {"mean_income": "Mean income", "median_income": "Median income"},
            "outturn": {"mean_income": [], "median_income": []},
            "projection": living,
        },
        "poverty": {
            "measures": {
                "absolute_bhc": "Absolute (BHC)",
                "absolute_ahc": "Absolute (AHC)",
                "relative_bhc": "Relative (BHC)",
                "relative_ahc": "Relative (AHC)",
            },
            "groups": {
                "all": "All people",
                "children": "Children",
                "working_age": "Working-age adults",
                "pensioners": "Pensioners",
            },
            "outturn": hbai["poverty"],
            "projection": poverty_proj,
        },
        "forecast": {
            "pre_label": "OBR March 2026 (pre-Budget)",
            "post_label": "Budget forecast",
            "post_published": False,
            "headline": ["cpi", "rpi", "earnings"],
            "sections": sections,
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(outlook, indent=2) + "\n")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
