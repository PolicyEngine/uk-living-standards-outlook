"use client";

// Child poverty under current law (two-child limit removed from April 2026)
// against the limit kept (child_poverty_by_family.two_child_limit_kept).
// Relative AHC only: the model's absolute AHC effects are not comparable with
// DWP's absolute estimates, which use an older line.

import { useMemo } from "react";
import ChartCard from "../ChartCard";
import LineSeriesChart, { dashOf } from "../LineSeriesChart";
import { DASH, PALETTE, joinSeries, niceAxis } from "../../lib/baseline";
import { fyDash, fyLabel, formatPct, formatPctAxis } from "../../lib/outlook";
import { plainWords } from "../../lib/sources";

export default function TwoChildLimitSection({ data }) {
  const cp = data.child_poverty_by_family;
  const tcl = cp.two_child_limit_kept;
  const rate = (d) => (d.rate == null ? null : d.rate * 100);

  const rows = useMemo(
    () =>
      joinSeries([
        ["baseline", tcl.baseline, rate],
        ["kept", tcl.counterfactual, rate],
      ]),
    [tcl],
  );
  const axis = niceAxis(Math.max(...rows.flatMap((r) => [r.baseline ?? 0, r.kept ?? 0])));
  const series = [
    { key: "baseline", name: "Current law (limit removed)", label: "Current law (limit removed)", colour: PALETTE.teal, dash: DASH.long },
    { key: "kept", name: tcl.label || "Two-child limit kept", label: tcl.label || "Two-child limit kept", colour: PALETTE.amber, dash: DASH.dot },
  ];

  // notes[0] is the lead sentence (the 2026-27 fall against DWP); the rest
  // explain it. All are computed in build_outlook.py.
  const [lead, ...notes] = (cp.notes || []).filter((n) => !/UC health element protection/i.test(n));
  const text = (s) => fyDash(plainWords(s));

  return (
    <ChartCard
      title="Two-child limit"
      description="Current law removes the two-child limit in Universal Credit from April 2026; the comparison keeps it. Relative poverty after housing costs: below 60% of the current median income."
      summary={lead && <p className="chart-summary">{text(lead)}</p>}
      notes={notes}
      source={
        <>
          <span className="chart-source-label">Source</span>
          {(cp.sources || []).join("; ")}
          {cp.sources?.length ? " · " : ""}PolicyEngine projections
        </>
      }
      exportOptions={{
        filename: "two-child-limit-relative_ahc",
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "line", dash: dashOf(s) })),
      }}
    >
      <LineSeriesChart
        data={rows}
        series={series}
        xFormat={fyLabel}
        yFormat={formatPctAxis}
        tooltipFormat={formatPct}
        yLabel="Children in relative poverty, AHC (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
TwoChildLimitSection.requires = "child_poverty_by_family";
