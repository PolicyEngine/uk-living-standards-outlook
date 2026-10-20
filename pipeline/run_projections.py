"""Baseline (current-law) UK living standards, poverty and distribution projections.

All income concepts follow DWP's Households Below Average Income (HBAI):
equivalised household net income before (BHC) and after (AHC) housing
costs, with the person as the unit of analysis (each household weighted by
household_weight x number of members).

- equivalised income  = person-weighted mean and median of
                        equiv_hbai_household_net_income (BHC) and
                        equiv_hbai_household_net_income_ahc (AHC)
- poverty             = person-weighted share of people in households flagged
                        by in_poverty_bhc / in_poverty_ahc (absolute) and
                        in_relative_poverty_bhc / in_relative_poverty_ahc
- population groups   = hbai_person_type (HBAI dependent children,
                        working-age adults below State Pension age,
                        pensioners at or above it; each person in one group)
- income deciles      = person-weighted deciles of the equivalised income,
                        re-ranked within each year and on each basis (BHC on
                        BHC income, AHC on AHC income); decile medians
- non-pensioner split = people in benefit units with no pensioner, split at
                        the median AHC income of that population
- child poverty by family = children (hbai_person_type CHILD) by number of
                        HBAI dependent children in the benefit unit and by
                        number of adults (non-dependent-child members)
- inequality          = person-weighted Gini, p90/p10, and ratio of top to
                        bottom quintile medians (as in HBAI Table 1.2b)
- very deep poverty   = share of people below 40% and 50% of the model's own
                        person-weighted median AHC income
- poverty by group    = tenure, family type, disability-benefit receipt in
                        the benefit unit, and region, with unweighted
                        household counts
- two-child limit kept = a second simulation with the UC and CTC child limit
                        set back to 2 (the baseline removes it from April 2026)

Years run sequentially in one process (one simulation at a time). Writes
pipeline/output/projections.json.

Usage: uv run python pipeline/run_projections.py <path-to-microcosm.h5>
"""

import gc
import json
import sys
import time
import warnings
from pathlib import Path

import numpy as np
import policyengine as pe

warnings.filterwarnings("ignore", message="Accessing .values on a MicroSeries")

YEARS = list(range(2024, 2031))  # fiscal 2024-25 .. 2030-31 (2024-25 for validation)
GROUP_YEARS = (2025, 2030)  # poverty_by_group snapshot years
OUT = Path(__file__).parent / "output" / "projections.json"

POVERTY_VARS = {
    "absolute_bhc": "in_poverty_bhc",
    "absolute_ahc": "in_poverty_ahc",
    "relative_bhc": "in_relative_poverty_bhc",
    "relative_ahc": "in_relative_poverty_ahc",
}

# Two-child limit restored from April 2026 (both UC and CTC, which is already
# zero in the data). pe-uk reads the parameter at the start of the year, so the
# reform covers the whole calendar year.
TWO_CHILD_LIMIT_KEPT = {
    "gov.dwp.universal_credit.elements.child.limit.child_count": {"2026-01-01.2100-12-31": 2},
    "gov.dwp.tax_credits.child_tax_credit.limit.child_count": {"2026-01-01.2100-12-31": 2},
}

TENURE = {
    "OWNED_OUTRIGHT": "owned_outright",
    "OWNED_WITH_MORTGAGE": "mortgage",
    "RENT_FROM_COUNCIL": "social_rent",
    "RENT_FROM_HA": "social_rent",
    "RENT_PRIVATELY": "private_rent",
}


def wquantile(values, weights, q):
    order = np.argsort(values, kind="stable")
    v, w = values[order], weights[order]
    cw = np.cumsum(w)
    idx = np.searchsorted(cw, q * cw[-1])
    return float(v[min(idx, len(v) - 1)])


def wmedian(values, weights):
    return wquantile(values, weights, 0.5)


def gini(values, weights):
    """Weighted Gini from the Lorenz curve (trapezoid rule); incomes as is."""
    order = np.argsort(values, kind="stable")
    v, w = values[order].astype(float), weights[order].astype(float)
    wf = w / w.sum()
    cum = np.cumsum(v * w)
    lorenz = cum / cum[-1]
    lorenz_prev = np.concatenate([[0.0], lorenz[:-1]])
    return float(1 - np.sum(wf * (lorenz + lorenz_prev)))


def decile_medians(values, weights):
    """Person-weighted decile groups (ranked within the year), median of each."""
    order = np.argsort(values, kind="stable")
    v, w = values[order], weights[order]
    cw = np.cumsum(w) / w.sum()
    group = np.minimum((cw * 10 - 1e-12).astype(int), 9)
    return [wmedian(v[group == d], w[group == d]) for d in range(10)]


def rate(flag, weight, mask):
    return float(weight[mask & flag].sum() / weight[mask].sum())


def person_arrays(sim, year):
    """Person-level arrays needed by every section."""
    c = lambda var, **kw: sim.calculate(var, year, **kw).values  # noqa: E731
    a = {
        "weight": c("person_weight"),
        "eq_bhc": c("equiv_hbai_household_net_income", map_to="person"),
        "eq_ahc": c("equiv_hbai_household_net_income_ahc", map_to="person"),
        "type": c("hbai_person_type").astype(str),
        "dep_child": c("is_hbai_dependent_child").astype(bool),
        "disabled": c("is_disabled_for_benefits").astype(bool),
        "hh_id": c("person_household_id").astype(np.int64),
        "bu_id": c("person_benunit_id").astype(np.int64),
        "tenure": c("tenure_type", map_to="person").astype(str),
        "region": c("region", map_to="person").astype(str),
    }
    for key, var in POVERTY_VARS.items():
        a[key] = c(var, map_to="person").astype(bool)
    # Benefit-unit aggregates, broadcast back to members.
    _, bu_idx = np.unique(a["bu_id"], return_inverse=True)
    n_bu = bu_idx.max() + 1
    size = np.bincount(bu_idx, minlength=n_bu)
    kids = np.bincount(bu_idx, weights=a["dep_child"], minlength=n_bu)
    pens = np.bincount(bu_idx, weights=a["type"] == "PENSIONER", minlength=n_bu)
    dis = np.bincount(bu_idx, weights=a["disabled"], minlength=n_bu)
    a["bu_children"] = kids[bu_idx].astype(int)
    a["bu_adults"] = (size - kids)[bu_idx].astype(int)
    a["bu_has_pensioner"] = pens[bu_idx] > 0
    a["bu_has_disabled"] = dis[bu_idx] > 0
    return a


def family_type(a):
    ft = np.full(len(a["weight"]), "", dtype=object)
    kids, adults = a["bu_children"] > 0, a["bu_adults"]
    ft[~a["bu_has_pensioner"] & kids & (adults == 1)] = "lone_parent"
    ft[~a["bu_has_pensioner"] & kids & (adults >= 2)] = "couple_with_children"
    ft[~a["bu_has_pensioner"] & ~kids & (adults == 1)] = "single_no_children"
    ft[~a["bu_has_pensioner"] & ~kids & (adults >= 2)] = "couple_no_children"
    ft[a["bu_has_pensioner"]] = "pensioner"
    return ft


def child_poverty(a):
    child = a["type"] == "CHILD"
    n = a["bu_children"]
    groups = {
        "all": child,
        "one_child": child & (n == 1),
        "two_children": child & (n == 2),
        "three_plus_children": child & (n >= 3),
        "lone_parent": child & (a["bu_adults"] == 1),
        "couple": child & (a["bu_adults"] >= 2),
    }
    w = a["weight"]
    return {
        m: {g: rate(a[m], w, mask) for g, mask in groups.items()}
        for m in ("relative_ahc", "absolute_ahc")
    } | {
        "children_millions": {g: float(w[mask].sum() / 1e6) for g, mask in groups.items()},
        "unweighted_children": {g: int(mask.sum()) for g, mask in groups.items()},
    }


def poverty_by_group(a):
    w = a["weight"]
    breakdowns = {
        "tenure": np.vectorize(TENURE.get)(a["tenure"]),
        "family_type": family_type(a),
        "disability": np.where(a["bu_has_disabled"], "disabled_in_family", "no_disabled_in_family"),
        "region": a["region"],
    }
    out = {}
    for name, labels in breakdowns.items():
        cells = {}
        for g in sorted(set(labels)):
            mask = labels == g
            cells[g] = {
                "relative_ahc": rate(a["relative_ahc"], w, mask),
                "median_equivalised_income_bhc": wmedian(a["eq_bhc"][mask], w[mask]),
                "people_millions": float(w[mask].sum() / 1e6),
                "unweighted_households": int(len(np.unique(a["hh_id"][mask]))),
                "unweighted_people": int(mask.sum()),
            }
        out[name] = cells
    return out


def baseline_year(sim, year):
    a = person_arrays(sim, year)
    w = a["weight"]
    res = {"people": float(w.sum())}
    for basis, inc in (("bhc", a["eq_bhc"]), ("ahc", a["eq_ahc"])):
        res[f"mean_equivalised_income_{basis}"] = float((inc * w).sum() / w.sum())
        res[f"median_equivalised_income_{basis}"] = wmedian(inc, w)
        res[f"decile_medians_{basis}"] = decile_medians(inc, w)
        order = np.argsort(inc, kind="stable")
        cw = np.cumsum(w[order]) / w.sum()
        quint = np.minimum((cw * 5 - 1e-12).astype(int), 4)
        q1 = wmedian(inc[order][quint == 0], w[order][quint == 0])
        q5 = wmedian(inc[order][quint == 4], w[order][quint == 4])
        res[f"inequality_{basis}"] = {
            "gini": gini(inc, w),
            "p90_p10": wquantile(inc, w, 0.9) / wquantile(inc, w, 0.1),
            "top_bottom_quintile_median_ratio": q5 / q1,
        }
    # Groups on the HBAI definition.
    groups = {
        "all": np.ones(len(w), dtype=bool),
        "children": a["type"] == "CHILD",
        "working_age": a["type"] == "WORKING_AGE_ADULT",
        "pensioners": a["type"] == "PENSIONER",
    }
    res["poverty"] = {m: {g: rate(a[m], w, mask) for g, mask in groups.items()} for m in POVERTY_VARS}
    # Non-pensioner split at the non-pensioner median (AHC).
    nonpen = ~a["bu_has_pensioner"]
    mid = wmedian(a["eq_ahc"][nonpen], w[nonpen])
    below, above = nonpen & (a["eq_ahc"] < mid), nonpen & (a["eq_ahc"] >= mid)
    res["non_pensioner_split_ahc"] = {
        "non_pensioner_median": mid,
        "below_middle_mean": float((a["eq_ahc"][below] * w[below]).sum() / w[below].sum()),
        "above_middle_mean": float((a["eq_ahc"][above] * w[above]).sum() / w[above].sum()),
    }
    # Very deep poverty: thresholds from the model's own AHC median.
    med = res["median_equivalised_income_ahc"]
    res["deep_poverty_ahc"] = {
        "median": med,
        **{
            f"below_{k}pc": {
                "rate": rate(a["eq_ahc"] < med * k / 100, w, groups["all"]),
                "people_millions": float(w[a["eq_ahc"] < med * k / 100].sum() / 1e6),
            }
            for k in (40, 50, 60)
        },
        "check_in_relative_poverty_ahc": res["poverty"]["relative_ahc"]["all"],
    }
    res["child_poverty_by_family"] = child_poverty(a)
    if year in GROUP_YEARS:
        res["poverty_by_group"] = poverty_by_group(a)
    # Diagnostics for the two-child-limit note.
    affected = sim.calculate("uc_is_child_limit_affected", year).values.astype(bool)
    uc = sim.calculate("universal_credit", year, map_to="person").values
    bu_uc = uc > 0  # benefit-unit UC mapped to persons
    _, bu_idx = np.unique(a["bu_id"], return_inverse=True)
    bu_aff = np.bincount(bu_idx, weights=affected)[bu_idx] > 0
    child = groups["children"]
    res["diagnostics"] = {
        "children_not_receiving_uc_child_element_m": float(w[affected].sum() / 1e6),
        "children_in_limit_affected_benefit_units_m": float(w[child & bu_aff].sum() / 1e6),
        "children_in_uc_benefit_units_m": float(w[child & bu_uc].sum() / 1e6),
        "children_in_uc_benefit_units_3plus_m": float(w[child & bu_uc & (a["bu_children"] >= 3)].sum() / 1e6),
        "relative_ahc_rate_children_in_limit_affected_bu": rate(a["relative_ahc"], w, child & bu_aff)
        if (child & bu_aff).any()
        else None,
        "universal_credit_bn": float(sim.calculate("universal_credit", year).sum() / 1e9),
    }
    hh_w = sim.calculate("household_weight", year).values
    hh_aff = sim.calculate("uc_is_child_limit_affected", year, map_to="household").values > 0
    res["diagnostics"]["limit_affected_households_k"] = float(hh_w[hh_aff].sum() / 1e3)
    return res


def counterfactual_year(sim, year):
    a = person_arrays(sim, year)
    cp = child_poverty(a)
    return {
        "relative_ahc_children": cp["relative_ahc"]["all"],
        "absolute_ahc_children": cp["absolute_ahc"]["all"],
        "relative_ahc_by_family": cp["relative_ahc"],
        "median_equivalised_income_ahc": wmedian(a["eq_ahc"], a["weight"]),
        "uc_child_limit_param": float(
            sim.tax_benefit_system.parameters(str(year)).gov.dwp.universal_credit.elements.child.limit.child_count
        ),
        "children_not_receiving_uc_child_element_m": float(
            (sim.calculate("uc_is_child_limit_affected", year).values.astype(bool) * a["weight"]).sum() / 1e6
        ),
    }


def main(dataset_path: str) -> None:
    results = {}
    sim = pe.uk.managed_microsimulation(dataset=dataset_path, allow_unmanaged=True)
    for year in YEARS:
        t0 = time.time()
        r = baseline_year(sim, year)
        results[str(year)] = r
        print(
            f"{year}: median eq BHC £{r['median_equivalised_income_bhc']:,.0f} "
            f"AHC £{r['median_equivalised_income_ahc']:,.0f} "
            f"child rel AHC {r['poverty']['relative_ahc']['children']:.3f} "
            f"gini BHC {r['inequality_bhc']['gini']:.3f} ({time.time() - t0:.0f}s)",
            flush=True,
        )
    del sim
    gc.collect()

    sim = pe.uk.managed_microsimulation(
        dataset=dataset_path, allow_unmanaged=True, reform=TWO_CHILD_LIMIT_KEPT
    )
    for year in YEARS:
        if year < 2025:
            continue
        cf = counterfactual_year(sim, year)
        results[str(year)]["two_child_limit_kept"] = cf
        print(
            f"{year} limit kept: child rel AHC {cf['relative_ahc_children']:.3f} "
            f"(param {cf['uc_child_limit_param']})",
            flush=True,
        )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
