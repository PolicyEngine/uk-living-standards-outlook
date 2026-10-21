"use client";

// Growth incidence: cumulative real change in each income decile's median,
// 2025-26 to the headline end year (income_by_decile.<basis>.by_year).

import { useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import BarSeriesChart from "../BarSeriesChart";
import { PALETTE, rangeAxis } from "../../lib/baseline";
import { changeVerb, fyDash, formatOneDp, headlineYear } from "../../lib/outlook";
import { PeSource } from "../../lib/sources";

const pctTick = (v) => `${formatOneDp(v).replace(/\.0$/, "")}%`;
const signed = (v) => `${v > 0 ? "+" : ""}${formatOneDp(v)}%`;

export default function DecileGrowthSection({ data }) {
  const dec = data.income_by_decile;
  const [basis, setBasis] = useState("bhc");
  const byYear = dec[basis]?.by_year || [];
  const first = byYear[0];
  const end = byYear.find((r) => r.year === headlineYear(data)) || byYear[byYear.length - 1];
  if (!first || !end) return null;

  const rows = dec.deciles.map((d, i) => ({ decile: d, growth: (end.cumulative_growth[i] ?? 0) * 100 }));
  const axis = rangeAxis(rows.map((r) => r.growth), { includeZero: true, pad: 0.15 });
  const bottom = rows[0].growth;
  const top = rows[rows.length - 1].growth;
  const basisShort = basis.toUpperCase();
  const say = (v) => changeVerb(v, "%") || "stays flat";

  return (
    <ChartCard
      title="Income growth by decile"
      description={`${dec.statistic.replace(/(\d{4})-(\d{2})/g, "$1–$2")}. Deciles are re-ranked each year, so this compares positions in the distribution, not the same people.`}
      notes={(dec.notes || []).filter((n) => /lowest tenth/i.test(n))}
      summary={
        <p className="chart-summary">
          From {fyDash(first.year)} to {fyDash(end.year)}, real median income ({basisShort}) in the lowest-income
          tenth <strong>{say(bottom)}</strong>; in the highest-income tenth it <strong>{say(top)}</strong>.
        </p>
      }
      source={<PeSource />}
      exportOptions={{
        filename: `income-growth-by-decile-${basis}`,
        legendItems: [
          { color: PALETTE.teal, label: "Rise", type: "rect" },
          { color: PALETTE.amber, label: "Fall", type: "rect" },
        ],
      }}
      controls={
        <Dropdown
          fieldLabel="Housing costs"
          label="Housing costs"
          value={basis}
          onChange={setBasis}
          options={Object.keys(dec.bases).map((id) => ({ id, label: id === "bhc" ? "Before (BHC)" : "After (AHC)" }))}
        />
      }
    >
      <BarSeriesChart
        data={rows}
        xKey="decile"
        xLabel="Income decile (1 = lowest)"
        series={[{ key: "growth", name: `Real change, ${fyDash(first.year)} to ${fyDash(end.year)}`, colour: PALETTE.teal }]}
        signColours={{ positive: PALETTE.teal, negative: PALETTE.amber }}
        legendPayload={[
          { value: "Rise", type: "square", color: PALETTE.teal },
          { value: "Fall", type: "square", color: PALETTE.amber },
        ]}
        yFormat={pctTick}
        tooltipFormat={signed}
        yLabel="Real change (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
DecileGrowthSection.requires = "income_by_decile";
