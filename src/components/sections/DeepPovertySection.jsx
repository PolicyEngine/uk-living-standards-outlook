"use client";

// Depth of poverty: people below 40%, 40-50% and 50-60% of median income
// (AHC), stacked by year. The 40% and 50% lines come from deep_poverty; the
// 60% line is the relative AHC poverty rate for all people.

import { useMemo } from "react";
import ChartCard from "../ChartCard";
import BarSeriesChart from "../BarSeriesChart";
import { PALETTE, niceAxis } from "../../lib/baseline";
import { changeVerb, fyDash, fyLabel, fyStart, formatPct, formatPctAxis, headlineYear } from "../../lib/outlook";
import { PeSource } from "../../lib/sources";

export default function DeepPovertySection({ data }) {
  const deep = data.deep_poverty.projection;
  const rel = data.poverty?.projection?.relative_ahc?.all || [];

  const rows = useMemo(() => {
    const b50 = Object.fromEntries((deep.below_50pc_median_ahc || []).map((d) => [d.year, d.rate]));
    const b60 = Object.fromEntries(rel.map((d) => [d.year, d.rate]));
    return (deep.below_40pc_median_ahc || [])
      .filter((d) => b50[d.year] != null && b60[d.year] != null)
      .map((d) => ({
        year: fyStart(d.year),
        fy: d.year,
        below40: d.rate * 100,
        band4050: (b50[d.year] - d.rate) * 100,
        band5060: (b60[d.year] - b50[d.year]) * 100,
        total: b60[d.year] * 100,
      }));
  }, [deep, rel]);
  if (!rows.length) return null;

  const axis = niceAxis(Math.max(...rows.map((r) => r.total)));
  const series = [
    { key: "below40", name: "Below 40%", colour: PALETTE.dark },
    { key: "band4050", name: "40–50%", colour: PALETTE.teal },
    { key: "band5060", name: "50–60%", colour: PALETTE.light },
  ];
  const first = rows[0];
  const end = rows.find((r) => r.fy === headlineYear(data)) || rows[rows.length - 1];
  const verb = changeVerb(end.below40 - first.below40, "pp");

  return (
    <ChartCard
      title="Depth of poverty"
      description="People in households below 40%, 50% and 60% of the model's own median income after housing costs each year. Below 40% is JRF's very deep poverty; the three bands add up to the relative poverty rate."
      summary={
        <p className="chart-summary">
          In {fyDash(end.fy)}, {formatPct(end.below40)} of people are in very deep poverty (below 40% of median
          income, AHC), of {formatPct(end.total)} below 60%; very deep poverty{" "}
          <strong>{verb || "stays flat"}</strong> from {fyDash(first.fy)}.
        </p>
      }
      notes={(data.deep_poverty.notes || []).filter((n) => /JRF's figure/.test(n))}
      source={<PeSource />}
      exportOptions={{
        filename: "depth-of-poverty",
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "rect" })),
      }}
    >
      <BarSeriesChart
        data={rows}
        series={series}
        stacked
        xFormat={fyLabel}
        yFormat={formatPctAxis}
        tooltipFormat={formatPct}
        yLabel="People (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
DeepPovertySection.requires = "deep_poverty";
