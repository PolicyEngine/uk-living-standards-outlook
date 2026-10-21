"use client";

// Lower- vs higher-income half of non-pensioners: mean equivalised AHC income
// in real terms (income_by_decile.non_pensioner_split).

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import { DASH, PALETTE, joinSeries, niceAxis, rangeAxis } from "../../lib/baseline";
import { dashOf } from "../LineSeriesChart";
import {
  changeVerb,
  fyDash,
  fyLabel,
  formatOneDp,
  formatPounds,
  formatPoundsKAxis,
  headlineSpan,
} from "../../lib/outlook";
import { PeSource } from "../../lib/sources";

const pctTick = (v) => `${formatOneDp(v).replace(/\.0$/, "")}%`;
const signed = (v) => `${v > 0 ? "+" : ""}${formatOneDp(v)}%`;

export default function NonPensionerSplitSection({ data }) {
  const split = data.income_by_decile.non_pensioner_split;
  const [view, setView] = useState("change");
  const lower = split.series.below_middle;
  const upper = split.series.above_middle;

  const rows = useMemo(() => {
    const pick = view === "change" ? (d) => d.cumulative_growth * 100 : (d) => d.real_mean;
    return joinSeries([
      ["lower", lower, pick],
      ["upper", upper, pick],
    ]);
  }, [lower, upper, view]);
  const values = rows.flatMap((r) => [r.lower, r.upper]);
  const axis = view === "change" ? rangeAxis(values, { includeZero: true, pad: 0.15 }) : niceAxis(Math.max(...values));

  const sl = headlineSpan(lower, data);
  const su = headlineSpan(upper, data);
  const pct = (s) => ((s[1].real_mean - s[0].real_mean) / s[0].real_mean) * 100;
  const say = (v) => changeVerb(v, "%") || "stays flat";
  const base = data.meta.real_price_base;

  const series = [
    { key: "lower", name: "Lower-income half", label: "Lower-income half", colour: PALETTE.amber, dash: DASH.dot },
    { key: "upper", name: "Higher-income half", label: "Higher-income half", colour: PALETTE.teal, dash: DASH.long },
  ];

  return (
    <ChartCard
      title="Non-pensioner income halves"
      description={`${split.statistic.replace(/(\d{4})-(\d{2})/g, "$1–$2")}. People in families with no pensioner, split at their own median.`}
      notes={[
        ...(data.income_by_decile.notes || []).filter((n) => /halves/i.test(n)),
        view === "level" && data.meta.units?.mean_equivalised_income_ahc && `Incomes are in ${data.meta.units.mean_equivalised_income_ahc}.`,
      ]}
      summary={
        sl &&
        su && (
          <p className="chart-summary">
            From {fyDash(sl[0].year)} to {fyDash(sl[1].year)}, real mean income (AHC) of the lower-income half of
            non-pensioners <strong>{say(pct(sl))}</strong>; that of the higher-income half{" "}
            <strong>{say(pct(su))}</strong>.
          </p>
        )
      }
      source={<PeSource />}
      exportOptions={{
        filename: `non-pensioner-halves-${view}`,
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "line", dash: dashOf(s) })),
      }}
      controls={
        <SegmentedToggle
          fieldLabel="Show"
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { id: "change", label: `Change since ${fyDash(lower[0]?.year)}` },
            { id: "level", label: `Level (${fyDash(base)} prices)` },
          ]}
        />
      }
    >
      <LineSeriesChart
        data={rows}
        series={series}
        xFormat={fyLabel}
        yFormat={view === "change" ? pctTick : formatPoundsKAxis}
        tooltipFormat={view === "change" ? signed : formatPounds}
        yLabel={view === "change" ? "Real change in mean (%)" : `£ a year, ${fyDash(base)} prices`}
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
NonPensionerSplitSection.requires = "income_by_decile";
