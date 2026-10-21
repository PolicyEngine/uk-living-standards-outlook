"use client";

// Living standards card. Logic ported from the scottish-budget-2026-2027
// "Economic outlook" card; chrome and chart follow uk-autumn-budget-dashboard-2026.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import {
  changeVerb,
  directionOf,
  fyDash,
  fyLabel,
  headlineSpan,
  formatPounds,
  formatPoundsKAxis,
  formatPoundsWholeAxis,
} from "../../lib/outlook";
import {
  EMPTY,
  NO_OFFICIAL_SERIES,
  VIEW_OPTIONS,
  chartEndYear,
  legendItemsFor,
  lineSeries,
  mergeSeries,
  niceAxis,
  projectionStartYear,
  shadeFrom,
  trimProjection,
  visibleRows,
} from "../../lib/baseline";
import { HbaiSource, Note } from "../../lib/sources";
import { inStrip } from "../../lib/headline";

/** meta.units[metric] may be a string or an object with a label/unit field. */
function unitFor(meta, metric) {
  const u = meta?.units?.[metric];
  if (!u) return null;
  if (typeof u === "string") return u;
  return u.label || u.unit || u.description || null;
}

/** "Median equivalised income (BHC)" -> "Median income after adjusting for household size (BHC)". */
function plainMetric(label) {
  return label.replace(/equivalised income/i, "income after adjusting for household size");
}

function describeMetric(id, label) {
  const equivalised = /equivalised/i.test(id) || /equivalised/i.test(label);
  const concept = equivalised
    ? "household net income adjusted for household size and composition (equivalised)"
    : "household net income";
  if (/median/i.test(id)) return `${label} is the middle value when people are ranked by ${concept}.`;
  if (/mean/i.test(id)) return `${label} is the average of ${concept} across people.`;
  return "";
}

export default function LivingStandardsSection({ data }) {
  const living = data.living_standards;
  const meta = data.meta;
  const metricIds = Object.keys(living.metrics);
  // Default to a metric with official history so both lines show.
  const defaultMetric = metricIds.includes("median_equivalised_income")
    ? "median_equivalised_income"
    : metricIds.find((id) => (living.outturn?.[id] || []).length > 0) || metricIds[0];
  const [metric, setMetric] = useState(defaultMetric);
  const [adjustment, setAdjustment] = useState("real");
  const [viewMode, setViewMode] = useState("both");

  const startYear = useMemo(() => projectionStartYear(data), [data]);
  const endYear = chartEndYear(data);
  const outturn = living.outturn?.[metric] || EMPTY;
  const projection = useMemo(
    () => trimProjection(living.projection?.[metric], startYear, endYear),
    [living, metric, startYear, endYear],
  );
  // AHC outturn is published in real terms only (nominal is null).
  const noOutturn = !outturn.some((d) => d[adjustment] != null);
  const realOnlyOutturn = noOutturn && outturn.some((d) => d.real != null);
  // With no outturn for this metric, Outturn is disabled and Both shows the projection only.
  const effectiveView = noOutturn && viewMode === "outturn" ? "both" : viewMode;

  const chartData = useMemo(
    () => visibleRows(mergeSeries(outturn, projection, (d) => d[adjustment]), effectiveView),
    [outturn, projection, adjustment, effectiveView],
  );
  const axis = niceAxis(Math.max(...chartData.flatMap((d) => [d.historical ?? 0, d.projection ?? 0])));
  const yMax = axis.domain[1];

  const priceBase = fyDash(meta.real_price_base);
  const label = living.metrics[metric];
  const units = unitFor(meta, metric);
  const realSuffix = adjustment === "real" ? `, ${priceBase} prices` : ", cash terms";
  const yFormat = yMax >= 10000 ? formatPoundsKAxis : formatPoundsWholeAxis;

  // One sentence: what the measure is (a few words) and how it moves to the
  // headline year. Units live in the y-axis label.
  let summary = null;
  const span = headlineSpan(projection, data);
  if (span) {
    const [first, last] = span;
    const a = first[adjustment];
    const b = last[adjustment];
    if (a != null && b != null && a !== 0) {
      const verb = changeVerb(((b - a) / a) * 100, "%");
      // The headline strip gives this selection's figures; say the direction only.
      const short = inStrip("income", { metric, adjustment });
      summary = (
        <p className="chart-summary">
          {plainMetric(label)}
          {adjustment === "real" ? ` in ${priceBase} prices` : " in cash terms"}{" "}
          {short ? (
            <>
              <strong>{directionOf(verb)}</strong> from {fyDash(first.year)} to {fyDash(last.year)}.
            </>
          ) : verb ? (
            <>
              <strong>{verb}</strong>, from {formatPounds(a)} in {fyDash(first.year)} to {formatPounds(b)} by{" "}
              {fyDash(last.year)}.
            </>
          ) : (
            <>
              <strong>stays flat</strong> at {formatPounds(a)} from {fyDash(first.year)} to {fyDash(last.year)}.
            </>
          )}
        </p>
      );
    }
  }

  const description = `${describeMetric(metric, label)}${
    adjustment === "real" ? ` Real values are in ${priceBase} prices.` : ""
  }`;

  return (
    <ChartCard
      title="Household income"
      description={description}
      summary={summary}
      source={<HbaiSource />}
      exportOptions={chartData.length ? { filename: `living-standards-${metric}-${adjustment}`, legendItems: legendItemsFor(effectiveView, !noOutturn) } : null}
      controls={
        <>
          <Dropdown
            fieldLabel="Measure"
            wide
            label="Income metric"
            value={metric}
            onChange={setMetric}
            options={metricIds.map((id) => ({ id, label: living.metrics[id] }))}
          />
          <SegmentedToggle
            fieldLabel="Prices"
            label="Price basis"
            value={adjustment}
            onChange={setAdjustment}
            options={[
              { id: "real", label: "Real" },
              { id: "nominal", label: "Cash terms" },
            ]}
          />
          <SegmentedToggle
            fieldLabel="Period"
            label="Series shown"
            value={effectiveView}
            onChange={setViewMode}
            options={VIEW_OPTIONS.map((o) =>
              o.id === "outturn" && noOutturn
                ? { ...o, disabled: true, title: realOnlyOutturn ? "Official series in real terms only" : NO_OFFICIAL_SERIES }
                : o,
            )}
          />
        </>
      }
      footer={
        noOutturn && (
          <Note>
            {realOnlyOutturn
              ? "Official incomes after housing costs are shown in real terms only."
              : `${NO_OFFICIAL_SERIES}.`}
          </Note>
        )
      }
      notes={[units && `Incomes are in ${units}.`]}
    >
      {chartData.length === 0 ? (
        <div className="chart-empty">No data for this metric.</div>
      ) : (
        <LineSeriesChart
          data={chartData}
          series={lineSeries(effectiveView, !noOutturn)}
          xFormat={fyLabel}
          yFormat={yFormat}
          tooltipFormat={formatPounds}
          yLabel={`${units ? units.split(",")[0] : "Household income"}${realSuffix}`}
          yDomain={axis.domain}
          yTicks={axis.ticks}
          projectionFrom={shadeFrom(chartData, effectiveView, !noOutturn)}
        />
      )}
    </ChartCard>
  );
}
