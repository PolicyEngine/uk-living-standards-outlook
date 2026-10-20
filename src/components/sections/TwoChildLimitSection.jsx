"use client";

// Child poverty under current law (two-child limit removed from April 2026)
// against the limit kept (child_poverty_by_family.two_child_limit_kept).

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import LineSeriesChart from "../LineSeriesChart";
import { PALETTE, joinSeries, niceAxis } from "../../lib/baseline";
import { formatOneDp, fyDash, fyLabel, formatPct, formatPctAxis, headlineYear } from "../../lib/outlook";
import { PeSource, plainWords } from "../../lib/sources";

export default function TwoChildLimitSection({ data }) {
  const cp = data.child_poverty_by_family;
  const tcl = cp.two_child_limit_kept;
  const [measure, setMeasure] = useState(tcl.measure || "relative_ahc");
  const baseline = measure === tcl.measure ? tcl.baseline : cp.projection[measure]?.all;
  const kept = measure === tcl.measure ? tcl.counterfactual : tcl[`counterfactual_${measure}`];
  const options = Object.keys(cp.measures)
    .filter((id) => id === tcl.measure || tcl[`counterfactual_${id}`])
    .map((id) => ({ id, label: cp.measures[id] }));

  const rows = useMemo(
    () =>
      joinSeries([
        ["baseline", baseline, (d) => (d.rate == null ? null : d.rate * 100)],
        ["kept", kept, (d) => (d.rate == null ? null : d.rate * 100)],
      ]),
    [baseline, kept],
  );
  const axis = niceAxis(Math.max(...rows.flatMap((r) => [r.baseline ?? 0, r.kept ?? 0])));
  const series = [
    { key: "baseline", name: "Current law (limit removed)", colour: PALETTE.teal, dashed: true },
    { key: "kept", name: tcl.label || "Two-child limit kept", colour: PALETTE.amber, dashed: true },
  ];

  const end = headlineYear(data);
  const pick = (rs) => (rs || []).find((r) => r.year === end) || (rs || []).slice(-1)[0];
  const b = pick(baseline);
  const k = pick(kept);
  // First-year fall in relative AHC child poverty under current law.
  const rel = tcl.baseline || [];
  const fallYear = rel[1]?.year;
  const fall = rel.length > 1 && rel[0].rate != null && rel[1].rate != null ? (rel[0].rate - rel[1].rate) * 100 : null;
  const kind = cp.measures[measure].replace(/\s*\(AHC\)/, "").toLowerCase();

  return (
    <ChartCard
      title="Two-child limit"
      description={[
        "Current law removes the two-child limit in Universal Credit and Child Tax Credit from April 2026; the comparison keeps it.",
        ...(cp.notes || []).filter((n) => !/^Relative AHC child poverty falls|discontinuity|UC health element/i.test(n)),
      ]
        .map(plainWords)
        .join(" ")
        .replace(/(\d{4})-(\d{2})(?!\d)/g, "$1–$2")}
      summary={
        b &&
        k && (
          <p className="chart-summary">
            Keeping the limit would leave {kind} child poverty (AHC){" "}
            <strong>{formatOneDp((k.rate - b.rate) * 100)}pp higher</strong> in {fyDash(b.year)}:{" "}
            {formatPct(k.rate * 100)} against {formatPct(b.rate * 100)} under current law.
          </p>
        )
      }
      footer={
        fall != null && (
          <p className="chart-note">
            Our {fyDash(fallYear)} fall ({formatOneDp(fall)}pp) is smaller than DWP and RF&apos;s (about 3pp) because
            other changes offset part of the gain; see ⓘ.
          </p>
        )
      }
      source={<PeSource />}
      exportOptions={{
        filename: `two-child-limit-${measure}`,
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "line" })),
      }}
      controls={
        <Dropdown fieldLabel="Measure" label="Poverty measure" value={measure} onChange={setMeasure} options={options} />
      }
    >
      <LineSeriesChart
        data={rows}
        series={series}
        xFormat={fyLabel}
        yFormat={formatPctAxis}
        tooltipFormat={formatPct}
        yLabel="Children in poverty (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
TwoChildLimitSection.requires = "child_poverty_by_family";
