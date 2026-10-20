"""Baseline (current-law) UK living standards and poverty projections.

Method copied from PolicyEngine/scottish-budget-dashboard
scripts/generate_scotland_baseline.py (the source of the Scottish Budget
2026-27 "Baseline" tab), applied UK-wide instead of filtering to Scotland:

- mean income   = sum(hbai_household_net_income * household_weight)
                  / sum(household_weight)   (total household disposable
                  income / number of households; not equivalised)
- median income = household-weighted median of hbai_household_net_income
- poverty       = person-weighted share of people in households flagged by
                  in_poverty_bhc / in_poverty_ahc (absolute) and
                  in_relative_poverty_bhc / in_relative_poverty_ahc (relative)
- age groups    = children age < 18, working age 16 <= age < 65,
                  pensioners age >= 65 (as in the source script; 16-17 year
                  olds fall in both children and working age)

Runs each year sequentially in one process and writes
pipeline/output/projections.json.

Usage: uv run python pipeline/run_projections.py <path-to-microcosm.h5>
"""

import json
import sys
import time
from pathlib import Path

import numpy as np
import policyengine as pe

YEARS = list(range(2024, 2031))  # fiscal 2024-25 .. 2030-31
OUT = Path(__file__).parent / "output" / "projections.json"

POVERTY_VARS = {
    "absolute_bhc": "in_poverty_bhc",
    "absolute_ahc": "in_poverty_ahc",
    "relative_bhc": "in_relative_poverty_bhc",
    "relative_ahc": "in_relative_poverty_ahc",
}


def weighted_median(values, weights):
    order = np.argsort(values)
    v, w = values[order], weights[order]
    cw = np.cumsum(w)
    idx = np.searchsorted(cw, cw[-1] / 2)
    return float(v[min(idx, len(v) - 1)])


def main(dataset_path: str) -> None:
    sim = pe.uk.managed_microsimulation(
        dataset=dataset_path, allow_unmanaged=True
    )
    results = {}
    for year in YEARS:
        t0 = time.time()
        hh_income = sim.calculate("hbai_household_net_income", year).values
        hh_weight = sim.calculate("household_weight", year).values
        mean_income = float((hh_income * hh_weight).sum() / hh_weight.sum())
        median_income = weighted_median(hh_income, hh_weight)

        age = sim.calculate("age", year).values
        p_weight = sim.calculate("person_weight", year).values
        groups = {
            "all": np.ones_like(age, dtype=bool),
            "children": age < 18,
            "working_age": (age >= 16) & (age < 65),
            "pensioners": age >= 65,
        }
        poverty = {}
        for key, var in POVERTY_VARS.items():
            flag = sim.calculate(var, year, map_to="person").values.astype(bool)
            poverty[key] = {
                g: float(p_weight[m & flag].sum() / p_weight[m].sum())
                for g, m in groups.items()
            }
        results[str(year)] = {
            "mean_income": mean_income,
            "median_income": median_income,
            "households": float(hh_weight.sum()),
            "people": float(p_weight.sum()),
            "poverty": poverty,
        }
        print(
            f"{year}: mean £{mean_income:,.0f} median £{median_income:,.0f} "
            + " ".join(f"{k}={v['all']:.3f}" for k, v in poverty.items())
            + f" ({time.time() - t0:.0f}s)",
            flush=True,
        )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
