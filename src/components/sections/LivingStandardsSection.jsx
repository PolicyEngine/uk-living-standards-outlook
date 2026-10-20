"use client";

// Living standards card. Logic ported from the scottish-budget-2026-2027
// "Economic outlook" card; chrome and chart follow uk-autumn-budget-dashboard-2026.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import {
  fyLabel,
  formatOneDp,
  formatPounds,
  formatPoundsKAxis,
  formatPoundsWholeAxis,
} from "../../lib/outlook";
import {
  EMPTY,
  NO_OFFICIAL_SERIES,
  VIEW_OPTIONS,
  legendItemsFor,
  lineSeries,
  mergeSeries,
  niceAxis,
  projectionStartYear,
  trimProjection,
  visibleRows,
} from "../../lib/baseline";

/** meta.units[metric] may be a string or an object with a label/unit field. */
function unitFor(meta, metric) {
  const u = meta?.units?.[metric];
  if (!u) return null;
  if (typeof u === "string") return u;
  return u.label || u.unit || u.description || null;
}

function describeMetric(id, label) {
  const equivalised = /equivalised/i.test(id) || /equivalised/i.test(label);
  const concept = equivalised
    ? "household net income adjusted for household size and composition (equivalised)"
    : "household net income";
  if (/median/i.test(id)) return `${label} is the middle value when households are ranked by ${concept}.`;
  if (/mean/i.test(id)) return `${label} is the average of ${concept} across households.`;
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
  const [adjustment, setAdjustment] = useState("nominal");
  const [viewMode, setViewMode] = useState("both");

  const startYear = useMemo(() => projectionStartYear(data), [data]);
  const outturn = living.outturn?.[metric] || EMPTY;
  const projection = useMemo(
    () => trimProjection(living.projection?.[metric], startYear),
    [living, metric, startYear],
  );
  const noOutturn = outturn.length === 0;
  // With no outturn for this metric, Outturn is disabled and Both shows the projection only.
  const effectiveView = noOutturn && viewMode === "outturn" ? "both" : viewMode;

  const chartData = useMemo(
    () => visibleRows(mergeSeries(outturn, projection, (d) => d[adjustment]), effectiveView),
    [outturn, projection, adjustment, effectiveView],
  );
  const axis = niceAxis(Math.max(...chartData.flatMap((d) => [d.historical ?? 0, d.projection ?? 0])));
  const yMax = axis.domain[1];

  const priceBase = meta.real_price_base;
  const label = living.metrics[metric];
  const units = unitFor(meta, metric);
  const realSuffix = adjustment === "real" ? `, ${priceBase} prices` : "";
  const yFormat = yMax >= 10000 ? formatPoundsKAxis : formatPoundsWholeAxis;

  let summary = null;
  if (projection.length >= 2) {
    const first = projection[0];
    const last = projection[projection.length - 1];
    const a = first[adjustment];
    const b = last[adjustment];
    if (a != null && b != null && a !== 0) {
      const pct = ((b - a) / a) * 100;
      const dir = Math.abs(pct) < 0.05 ? null : pct > 0 ? "increase" : "decrease";
      const qualifiers = [units, adjustment === "real" ? `${priceBase} prices` : null].filter(Boolean);
      summary = (
        <p className="chart-summary">
          {label}
          {qualifiers.length ? ` (${qualifiers.join(", ")})` : ""} is forecast to{" "}
          <strong>{dir ? `${dir} by ${formatOneDp(Math.abs(pct))}%` : "stay flat"}</strong> from{" "}
          {formatPounds(a)} in {first.year} to {formatPounds(b)} by {last.year}.
        </p>
      );
    }
  }

  const description = `${describeMetric(metric, label)} ${
    adjustment === "real" ? `Real values are in ${priceBase} prices. ` : ""
  }${
    noOutturn
      ? "The dashed line shows the PolicyEngine projection."
      : "The solid line shows official statistics; the dashed line shows the PolicyEngine projection."
  }`;

  return (
    <ChartCard
      title="Living standards"
      description={description}
      summary={summary}
      exportOptions={chartData.length ? { filename: `living-standards-${metric}-${adjustment}`, legendItems: legendItemsFor(effectiveView, !noOutturn) } : null}
      controls={
        <>
          <Dropdown
            label="Income metric"
            value={metric}
            onChange={setMetric}
            options={metricIds.map((id) => ({ id, label: living.metrics[id] }))}
          />
          <SegmentedToggle
            label="Price basis"
            value={adjustment}
            onChange={setAdjustment}
            options={[
              { id: "nominal", label: "Nominal" },
              { id: "real", label: "Real" },
            ]}
          />
          <SegmentedToggle
            label="Series shown"
            value={effectiveView}
            onChange={setViewMode}
            options={VIEW_OPTIONS.map((o) =>
              o.id === "outturn" && noOutturn ? { ...o, disabled: true, title: NO_OFFICIAL_SERIES } : o,
            )}
          />
        </>
      }
      footer={noOutturn && <p className="chart-note">{NO_OFFICIAL_SERIES}.</p>}
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
        />
      )}
    </ChartCard>
  );
}
