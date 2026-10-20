"""Assemble public/data/outlook.json (see DATA_CONTRACT.md).

Inputs:
- pipeline/output/projections.json  (pipeline/run_projections.py)
- pipeline/data/hbai_outturn.json   (pipeline/extract_hbai.py)
- pipeline/data/obr_rhdi.json       (pipeline/extract_obr.py)
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
RHDI = Path(__file__).parent / "data" / "obr_rhdi.json"
OUT = ROOT / "public" / "data" / "outlook.json"

PRICE_BASE_YEAR = 2025  # fiscal 2025-26
PROJECTION_START = 2025  # 2024-25 is run only for meta.validation_2024_25
MIN_HOUSEHOLDS = 100  # suppress poverty_by_group cells below this unweighted count
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


# OBR EFO March 2026 detailed forecast tables, economy (published 3 March 2026;
# still the latest OBR forecast until the 28 October 2026 EFO). Every OBR series
# below is the calendar-year row of the table: growth in the annual average,
# not fiscal year and not Q4 on Q4. Checked against the xlsx on 20 Oct 2026.
EFO = "OBR EFO March 2026, economy detailed forecast tables"
SOURCES = {
    "consumer_price_index": f"{EFO}, Table 1.7, CPI (calendar year), rounded to 1 d.p. as in Table A.1",
    "cpih": f"{EFO}, Table 1.7, CPIH (calendar year)",
    "consumer_price_index_ahc": (
        "PolicyEngine derivation from OBR March 2026 CPI and rents (not an OBR series; "
        "ONS ad hoc 2863 definition, excluding rents, maintenance and water); 2027 onwards held at 1.9%"
    ),
    "rpi": f"{EFO}, Table 1.7, RPI (calendar year), rounded to 1 d.p. as in Table A.1",
    "average_earnings": (
        f"{EFO}, Table 1.6, average weekly earnings growth (wages and salaries per employee, "
        "calendar year), rounded to 1 d.p. as in Table A.1"
    ),
    "non_labour_income": f"{EFO}, Table 1.12, growth in non-labour income (calendar year)",
    "house_prices": f"{EFO}, Table 1.16, house price index growth (calendar year), rounded to 1 d.p.",
    "rent": f"{EFO}, Table 1.7, actual rents for housing (ONS D7GQ, calendar year)",
    "social_rent": "England social rent policy cap (CPI + 1%, MHCLG policy statement on rents for social housing); not an OBR forecast",
    "mortgage_interest": (
        f"{EFO}, Table 1.7, mortgage interest payments (calendar year), 2026-2029; "
        "OBR stops forecasting this series after 2030 Q1, so the 2030 value (5.5%) is "
        "carried over from policyengine-uk's November 2025 update, not an OBR March 2026 figure"
    ),
}


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
    rhdi = json.loads(RHDI.read_text())
    params = system.parameters.gov.economic_assumptions

    # Real terms: chained OBR CPI index (BHC) and CPI after housing costs (AHC)
    # from the pinned package; the value for calendar key Y is applied to
    # fiscal year Y-(Y+1), as policyengine-uk does when uprating.
    # real = nominal * P(2025) / P(Y).
    indices = {
        "bhc": params.indices.obr.consumer_price_index,
        "ahc": params.indices.obr.consumer_price_index_ahc,
    }

    def real(value: float, year: int, basis: str = "bhc") -> float:
        idx = indices[basis]
        return value * idx(f"{PRICE_BASE_YEAR}-01-01") / idx(f"{year}-01-01")

    years = [y for y in sorted(int(y) for y in proj) if y >= PROJECTION_START]
    end = years[-1]
    P = lambda y: proj[str(y)]  # noqa: E731

    income_metrics = {
        "mean_equivalised_income": ("mean_equivalised_income_bhc", "bhc"),
        "median_equivalised_income": ("median_equivalised_income_bhc", "bhc"),
        "mean_equivalised_income_ahc": ("mean_equivalised_income_ahc", "ahc"),
        "median_equivalised_income_ahc": ("median_equivalised_income_ahc", "ahc"),
    }
    living = {
        m: [
            {"year": fy(y), "nominal": round(P(y)[src]), "real": round(real(P(y)[src], y, basis))}
            for y in years
        ]
        for m, (src, basis) in income_metrics.items()
    }

    # HBAI equivalised income outturn (Table 1.2b) is GBP per week in average
    # 2024/25 prices. Annualise (x 52), recover approximate cash values with
    # the index for that basis, then express in 2025-26 prices.
    income_outturn = {}
    for m, (_, basis) in income_metrics.items():
        idx = indices[basis]
        series = []
        for r in hbai["income"][m]:
            y = int(r["year"][:4])
            nominal = r["weekly_2024_25_prices"] * 52 * idx(f"{y}-01-01") / idx("2024-01-01")
            series.append({"year": r["year"], "nominal": round(nominal), "real": round(real(nominal, y, basis))})
        income_outturn[m] = series

    measures = ["absolute_bhc", "absolute_ahc", "relative_bhc", "relative_ahc"]
    groups = ["all", "children", "working_age", "pensioners"]
    poverty_proj = {
        m: {g: [{"year": fy(y), "rate": round(P(y)["poverty"][m][g], 5)} for y in years] for g in groups}
        for m in measures
    }

    # 1. Real income growth by decile, and the non-pensioner split.
    def decile_block(basis):
        base = [real(v, PRICE_BASE_YEAR, basis) for v in P(PRICE_BASE_YEAR)[f"decile_medians_{basis}"]]
        by_year = []
        for y in years:
            r = [real(v, y, basis) for v in P(y)[f"decile_medians_{basis}"]]
            by_year.append({
                "year": fy(y),
                "real_median": [round(v) for v in r],
                "cumulative_growth": [round(v / b - 1, 5) for v, b in zip(r, base)],
            })
        return {"cumulative_growth_to_end": by_year[-1]["cumulative_growth"], "by_year": by_year}

    def split_series(key):
        base = real(P(PRICE_BASE_YEAR)["non_pensioner_split_ahc"][key], PRICE_BASE_YEAR, "ahc")
        out = []
        for y in years:
            v = real(P(y)["non_pensioner_split_ahc"][key], y, "ahc")
            out.append({"year": fy(y), "real_mean": round(v), "cumulative_growth": round(v / base - 1, 5)})
        return out

    income_by_decile = {
        "base_year": fy(PRICE_BASE_YEAR),
        "end_year": fy(end),
        "statistic": "Median equivalised income within each person-weighted income decile, real 2025-26 prices",
        "deciles": list(range(1, 11)),
        "bases": {"bhc": "Before housing costs (deflated by OBR CPI)", "ahc": "After housing costs (deflated by CPI excluding housing costs)"},
        "bhc": decile_block("bhc"),
        "ahc": decile_block("ahc"),
        "non_pensioner_split": {
            "basis": "ahc",
            "statistic": "Mean equivalised AHC income of each half, real 2025-26 prices",
            "groups": {
                "below_middle": "Non-pensioners below the non-pensioner median",
                "above_middle": "Non-pensioners at or above the non-pensioner median",
            },
            "series": {"below_middle": split_series("below_middle_mean"), "above_middle": split_series("above_middle_mean")},
        },
        "comparator": "Resolution Foundation, Living Standards Outlook 2026 (February 2026)",
        "notes": [
            "Deciles are re-ranked each year, so growth compares the same position in the distribution, not the same people.",
            "The split uses the median of non-pensioners only; RF splits at the whole-population median, so its groups differ slightly.",
        ],
    }

    # 2. Child poverty by family, with the two-child limit counterfactual.
    fam_groups = {
        "all": "All children",
        "one_child": "One child in family",
        "two_children": "Two children in family",
        "three_plus_children": "Three or more children in family",
        "lone_parent": "Lone-parent family",
        "couple": "Couple family",
    }
    cp = lambda y: P(y)["child_poverty_by_family"]  # noqa: E731
    child_poverty_by_family = {
        "measures": {"relative_ahc": "Relative (AHC)", "absolute_ahc": "Absolute (AHC)"},
        "groups": fam_groups,
        "projection": {
            m: {g: [{"year": fy(y), "rate": round(cp(y)[m][g], 5)} for y in years] for g in fam_groups}
            for m in ("relative_ahc", "absolute_ahc")
        },
        "children_millions": {
            g: [{"year": fy(y), "value": round(cp(y)["children_millions"][g], 3)} for y in years] for g in fam_groups
        },
        "unweighted_children": cp(years[0])["unweighted_children"],
        "two_child_limit_kept": {
            "label": "Two-child limit kept",
            "measure": "relative_ahc",
            "group": "all",
            "reform": {
                "gov.dwp.universal_credit.elements.child.limit.child_count": "2 from 2026-27",
                "gov.dwp.tax_credits.child_tax_credit.limit.child_count": "2 from 2026-27",
            },
            "baseline": poverty_proj["relative_ahc"]["children"],
            "counterfactual": [
                {"year": fy(y), "rate": round(P(y)["two_child_limit_kept"]["relative_ahc_children"], 5)} for y in years
            ],
            "counterfactual_absolute_ahc": [
                {"year": fy(y), "rate": round(P(y)["two_child_limit_kept"]["absolute_ahc_children"], 5)} for y in years
            ],
        },
        "notes": two_child_notes(proj),
    }

    # 3. Inequality.
    ineq_measures = {"gini": "Gini coefficient", "p90_p10": "90:10 ratio"}
    inequality = {
        "measures": ineq_measures,
        "bases": {"bhc": "Before housing costs", "ahc": "After housing costs"},
        "outturn": {m: {b: hbai["inequality"][b][m] for b in ("bhc", "ahc")} for m in ineq_measures},
        "projection": {
            m: {b: [{"year": fy(y), "value": round(P(y)[f"inequality_{b}"][m], 5)} for y in years] for b in ("bhc", "ahc")}
            for m in ineq_measures
        },
        "notes": [
            "Outturn is HBAI Table 1.2b: Gini, and the ratio of top to bottom quintile medians, which is the 90th over the 10th percentile.",
            "The model's Gini is about 3 points below HBAI's in 2024-25, so read the projection as a change, not a level.",
        ],
    }

    # 4. Very deep poverty (JRF-style), from the model's own AHC median.
    deep = lambda y: P(y)["deep_poverty_ahc"]  # noqa: E731
    deep_poverty = {
        "measures": {
            "below_40pc_median_ahc": "Very deep poverty: below 40% of median income (AHC, JRF-style)",
            "below_50pc_median_ahc": "Below 50% of median income (AHC)",
        },
        "projection": {
            f"below_{k}pc_median_ahc": [
                {
                    "year": fy(y),
                    "rate": round(deep(y)[f"below_{k}pc"]["rate"], 5),
                    "people_millions": round(deep(y)[f"below_{k}pc"]["people_millions"], 3),
                    "threshold_annual": round(deep(y)["median"] * k / 100),
                }
                for y in years
            ]
            for k in (40, 50)
        },
        "notes": [
            "Lines are 40% and 50% of the model's own median equivalised AHC income each year, as JRF defines very deep poverty.",
            "Not the model's in_deep_poverty_ahc flag, which is half the absolute poverty line.",
        ],
    }

    # 5. Poverty and median income by group, with small-cell suppression.
    labels = {
        "tenure": ("Tenure", {
            "owned_outright": "Owned outright", "mortgage": "Owned with a mortgage",
            "social_rent": "Social renter", "private_rent": "Private renter"}),
        "family_type": ("Family type", {
            "lone_parent": "Lone parent", "couple_with_children": "Couple with children",
            "single_no_children": "Single, no children", "couple_no_children": "Couple, no children",
            "pensioner": "Pensioner family"}),
        "disability": ("Disability", {
            "disabled_in_family": "Disability benefit recipient in family",
            "no_disabled_in_family": "No disability benefit recipient in family"}),
        "region": ("Region", {
            "NORTH_EAST": "North East", "NORTH_WEST": "North West", "YORKSHIRE": "Yorkshire and the Humber",
            "EAST_MIDLANDS": "East Midlands", "WEST_MIDLANDS": "West Midlands", "EAST_OF_ENGLAND": "East of England",
            "LONDON": "London", "SOUTH_EAST": "South East", "SOUTH_WEST": "South West", "WALES": "Wales",
            "SCOTLAND": "Scotland", "NORTHERN_IRELAND": "Northern Ireland"}),
    }
    group_years = [y for y in years if "poverty_by_group" in P(y)]
    suppressed = []
    breakdowns = {}
    for name, (label, glabels) in labels.items():
        cells = {}
        for g in glabels:
            cells[g] = {}
            for y in group_years:
                c = P(y)["poverty_by_group"][name][g]
                small = c["unweighted_households"] < MIN_HOUSEHOLDS
                if small:
                    suppressed.append(f"{name}/{g}/{fy(y)}")
                cells[g][fy(y)] = {
                    "relative_ahc": None if small else round(c["relative_ahc"], 5),
                    "median_equivalised_income_bhc": None if small else {
                        "nominal": round(c["median_equivalised_income_bhc"]),
                        "real": round(real(c["median_equivalised_income_bhc"], y, "bhc")),
                    },
                    "people_millions": None if small else round(c["people_millions"], 3),
                    "unweighted_households": c["unweighted_households"],
                    "suppressed": small,
                }
        breakdowns[name] = {"label": label, "groups": glabels, "cells": cells}
    poverty_by_group = {
        "years": [fy(y) for y in group_years],
        "measures": {
            "relative_ahc": "Relative poverty (AHC)",
            "median_equivalised_income_bhc": "Median equivalised income (BHC), £ per person per year",
        },
        "min_unweighted_households": MIN_HOUSEHOLDS,
        "breakdowns": breakdowns,
        "notes": [
            f"Cells with fewer than {MIN_HOUSEHOLDS} unweighted households are suppressed (null); "
            + (f"suppressed: {', '.join(suppressed)}." if suppressed else "none are at this sample size."),
            "Disability means someone in the benefit unit receives DLA, PIP or similar, narrower than HBAI's self-reported definition.",
            "Disability benefits count as income, which is why the disability-benefit group can show lower poverty than in HBAI.",
            "Family type is at benefit-unit level; a pensioner family is any benefit unit with someone at or above State Pension age.",
            "Regional figures are single-year model estimates; HBAI uses three-year averages for regions.",
        ],
    }

    # 6. OBR RHDI per person.
    obr_rhdi = {
        "label": "OBR real household disposable income per person",
        "unit": "£ per person per year, 2023 prices (national accounts)",
        "basis": "Fiscal year",
        "source": f"{rhdi['source']['release']}, {rhdi['source']['table']}",
        "definition": rhdi["source"]["definition"],
        "url": rhdi["source"]["url"],
        "file_sha256": rhdi["source"]["file_sha256"],
        "series": [
            {"year": r["year"], "value": r["gbp_2023_prices"], "index_2008q1_100": r["index_2008q1_100"],
             "growth": r["growth"], "type": r["type"], "source_row": r["cell_row"]}
            for r in rhdi["series"]
        ],
        "notes": [
            "OBR's national-accounts measure, including non-profit institutions and imputed income; not comparable in level to the survey-based HBAI series.",
            "2025-26 onwards are OBR March 2026 forecast years.",
        ],
    }

    # 2024-25 validation: model vs HBAI outturn (kept out of the projection series).
    v = P(2024)
    hb = lambda series, yr="2024-25": next(r for r in series if r["year"] == yr)  # noqa: E731
    validation = {
        "year": "2024-25",
        "median_equivalised_income_weekly": {
            "bhc": {"model": round(v["median_equivalised_income_bhc"] / 52), "hbai": round(hb(hbai["income"]["median_equivalised_income"])["weekly_2024_25_prices"])},
            "ahc": {"model": round(v["median_equivalised_income_ahc"] / 52), "hbai": round(hb(hbai["income"]["median_equivalised_income_ahc"])["weekly_2024_25_prices"])},
        },
        "relative_ahc": {
            g: {"model": round(v["poverty"]["relative_ahc"][g], 4), "hbai": hb(hbai["poverty"]["relative_ahc"][g])["rate"]}
            for g in groups
        },
        "gini": {b: {"model": round(v[f"inequality_{b}"]["gini"], 4), "hbai": hb(hbai["inequality"][b]["gini"])["value"]} for b in ("bhc", "ahc")},
        "p90_p10": {b: {"model": round(v[f"inequality_{b}"]["p90_p10"], 3), "hbai": hb(hbai["inequality"][b]["p90_p10"])["value"]} for b in ("bhc", "ahc")},
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
            out_series.append({
                "key": key,
                "label": label,
                "parameter": f"gov.economic_assumptions.yoy_growth.obr.{leaf}",
                "source": SOURCES[leaf],
                "pre": pre,
                "post": [dict(p) for p in pre],
            })
        sections.append({"title": title, "series": out_series})

    pe_version = version("policyengine")
    pe_uk = version("policyengine-uk")
    outlook = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "policyengine": pe_version,
            "policyengine_uk": pe_uk,
            "dataset": {
                "name": Path(dataset_path).stem,
                "tag": tag,
                "sha256": sha256(Path(dataset_path)),
                "hf_repo": "policyengine/populace-uk-private",
            },
            "real_price_base": fy(PRICE_BASE_YEAR),
            "units": {
                "mean_equivalised_income": "£ per person per year, equivalised",
                "median_equivalised_income": "£ per person per year, equivalised",
                "mean_equivalised_income_ahc": "£ per person per year, equivalised",
                "median_equivalised_income_ahc": "£ per person per year, equivalised",
            },
            "deflator": (
                "OBR CPI index (gov.economic_assumptions.indices.obr.consumer_price_index) for BHC incomes "
                "and CPI after housing costs (gov.economic_assumptions.indices.obr.consumer_price_index_ahc) "
                f"for AHC incomes, both from policyengine-uk {pe_uk}; calendar-year value Y applied to fiscal "
                "year Y-(Y+1), rebased to 2025-26 = 1"
            ),
            "outturn_source": (
                f"{hbai['source']['release']}, tables {hbai['source']['tables']}: "
                f"{hbai['source']['url']}"
            ),
            "outturn_file_sha256": hbai["source"]["file_sha256"],
            "method": {
                "mean_equivalised_income": "Person-weighted mean of equiv_hbai_household_net_income (BHC, modified OECD scale, household_weight x household_count_people), as in HBAI",
                "median_equivalised_income": "Person-weighted median of equiv_hbai_household_net_income (BHC), as in HBAI",
                "mean_equivalised_income_ahc": "Person-weighted mean of equiv_hbai_household_net_income_ahc, as in HBAI",
                "median_equivalised_income_ahc": "Person-weighted median of equiv_hbai_household_net_income_ahc, as in HBAI",
                "income_outturn": "HBAI Table 1.2b (£ per week in 2024/25 prices) x 52; nominal values recovered with the OBR CPI index (BHC) or CPI-AHC index (AHC)",
                "poverty": "Person-weighted share of people in households with in_poverty_bhc / in_poverty_ahc (absolute, 60% of FYE 2025 median held in real terms) and in_relative_poverty_bhc / in_relative_poverty_ahc (60% of contemporary median)",
                "groups": "hbai_person_type: HBAI dependent children (is_hbai_dependent_child), working-age adults below State Pension age, and pensioners at or above it; each person in exactly one group",
                "income_by_decile": "Person-weighted deciles of equiv_hbai_household_net_income (BHC) and _ahc (AHC), re-ranked each year; decile medians deflated by CPI (BHC) or CPI-AHC (AHC)",
                "non_pensioner_split": "People in benefit units with no hbai_person_type PENSIONER member, split at their own median AHC income; mean AHC income of each half",
                "child_poverty_by_family": "Children (hbai_person_type CHILD) by the count of is_hbai_dependent_child in their benefit unit and by adults in it (members who are not dependent children: 1 = lone parent, 2+ = couple)",
                "two_child_limit_kept": "Second simulation with gov.dwp.universal_credit.elements.child.limit.child_count and gov.dwp.tax_credits.child_tax_credit.limit.child_count set to 2 from 2026",
                "inequality": "Person-weighted Gini (incomes as computed, negatives kept) and p90/p10 of equivalised BHC and AHC income",
                "deep_poverty": "Share of people with equivalised AHC income below 40% and 50% of the person-weighted median AHC income in the same year",
                "poverty_by_group": "tenure_type (council and housing association combined as social rent), benefit-unit family type, is_disabled_for_benefits for anyone in the benefit unit, and region; unweighted counts are distinct households in the cell",
                "obr_rhdi": f"{rhdi['source']['table']} ({rhdi['source']['definition']})",
                "source_repos": [
                    "PolicyEngine/scottish-budget-dashboard scripts/generate_scotland_baseline.py",
                    "PolicyEngine/uk-spring-statement-2026 src/spring_statement_data/reforms.py",
                ],
            },
            "comparators": {
                "income_by_decile": "Resolution Foundation, Living Standards Outlook 2026 (February 2026): https://www.resolutionfoundation.org/publications/living-standards-outlook-2026/",
                "child_poverty": "DWP low-income poverty projections for children, November 2025, and RF LSO 2026",
                "deep_poverty": "JRF, UK Poverty 2026 (January 2026)",
            },
            "validation_2024_25": validation,
            "notes": NOTES,
        },
        "living_standards": {
            "metrics": {
                "mean_equivalised_income": "Mean equivalised income (BHC)",
                "median_equivalised_income": "Median equivalised income (BHC)",
                "mean_equivalised_income_ahc": "Mean equivalised income (AHC)",
                "median_equivalised_income_ahc": "Median equivalised income (AHC)",
            },
            "outturn": income_outturn,
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
            "basis": "Calendar year, growth in annual average",
            "post_label": "Budget forecast",
            "post_published": False,
            "headline": ["cpi", "rpi", "earnings"],
            "sections": sections,
        },
        "income_by_decile": income_by_decile,
        "child_poverty_by_family": child_poverty_by_family,
        "inequality": inequality,
        "deep_poverty": deep_poverty,
        "poverty_by_group": poverty_by_group,
        "obr_rhdi": obr_rhdi,
    }
    for note in NOTES:
        assert len(note) <= 160, note
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(outlook, indent=2) + "\n")
    print(f"Wrote {OUT}")


NOTES = [
    "Model figures are unvalidated demo output from the Microcosm dataset.",
    "Projections are a current-law baseline: no Autumn Budget 2026 measures are modelled.",
    "Income outturn is HBAI, published in real terms; nominal values are recovered with OBR CPI (BHC) and CPI after housing costs (AHC).",
    "Poverty and inequality outturn is the HBAI admin-linked series, which starts in 2021-22.",
    "The model's 2024-25 median income is about 6% above HBAI's, so projected absolute poverty sits below outturn.",
    "OBR forecast series are calendar years; incomes and poverty are fiscal years.",
    "CPI after housing costs and social rent are PolicyEngine derivations, not OBR forecasts.",
    "The Autumn Budget 2026 OBR forecast is due on 28 October 2026; until then the post-Budget series repeat the pre-Budget ones.",
]


def two_child_notes(proj: dict) -> list[str]:
    """Explain the 2026-27 fall in child poverty against RF/DWP (about 3 points)."""
    b = lambda y: proj[str(y)]["poverty"]["relative_ahc"]["children"]  # noqa: E731
    cf = lambda y: proj[str(y)]["two_child_limit_kept"]["relative_ahc_children"]  # noqa: E731
    d = proj["2025"]["diagnostics"]
    fall = (b(2025) - b(2026)) * 100
    effect26 = (cf(2026) - b(2026)) * 100
    drift = (cf(2026) - cf(2025)) * 100
    effect29 = (cf(2029) - b(2029)) * 100
    kids = proj["2029"]["child_poverty_by_family"]["children_millions"]["all"]
    return [
        f"Relative AHC child poverty falls {fall:.1f} points in 2026-27, against about 3 points in RF LSO 2026 (33% to 30%) and DWP's projections.",
        f"Removing the two-child limit cuts it by {effect26:.1f} points in 2026-27; other changes push it up {drift:.1f} points, so the net fall is smaller.",
        f"Coverage is not the gap: in 2025-26 the model has {d['limit_affected_households_k']:.0f}k affected households and {d['children_in_limit_affected_benefit_units_m']:.2f}m children in them, close to DWP's 470k and 1.7m.",
        f"The policy effect grows to {effect29:.1f} points ({effect29 / 100 * kids * 1000:.0f}k children) by 2029-30, near DWP's 450k, as more children born after April 2017 would have been affected.",
        f"Most affected children stay below the line after the gain ({d['relative_ahc_rate_children_in_limit_affected_bu'] * 100:.0f}% were in relative AHC poverty in 2025-26), and model levels sit below HBAI's.",
    ]


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
