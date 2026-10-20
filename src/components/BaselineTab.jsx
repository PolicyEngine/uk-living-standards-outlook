"use client";

// Ported from PolicyEngine/scottish-budget-2026-2027
// src/components/BaselineScotlandTab.jsx ("Economic outlook" cards).
// Data now comes from outlook.json instead of hardcoded Scottish series,
// and the headline callouts are computed from the first to the last
// projection year.

import { useMemo, useState } from "react";
import D3LineChart from "./D3LineChart";
import {
  fyStart,
  formatOneDp,
  formatPct,
  formatPctAxis,
  formatPounds,
  formatPoundsKAxis,
  formatPoundsWholeAxis,
  niceMax,
} from "../lib/outlook";

const EMPTY = [];

const GROUP_PHRASE = {
  all: "",
  children: "child ",
  working_age: "working-age ",
  pensioners: "pensioner ",
};

function ViewModeToggle({ value, onChange, outturnDisabled = false }) {
  return (
    <div className="view-toggle" role="group" aria-label="Series shown">
      {[
        ["outturn", "Outturn"],
        ["both", "Both"],
        ["forecast", "Forecast"],
      ].map(([id, label]) => {
        const disabled = outturnDisabled && id === "outturn";
        return (
          <button
            key={id}
            className={value === id ? "active" : ""}
            aria-pressed={value === id}
            disabled={disabled}
            title={disabled ? "No official series on this definition" : undefined}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

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

/** Merge outturn + projection rows into the chart's {year, historical, projection} shape. */
function mergeSeries(outturn, projection, pick) {
  const merged = {};
  (outturn || []).forEach((d) => {
    const v = pick(d);
    if (v == null) return;
    const year = fyStart(d.year);
    merged[year] = { ...(merged[year] || { year }), historical: v };
  });
  (projection || []).forEach((d) => {
    const v = pick(d);
    if (v == null) return;
    const year = fyStart(d.year);
    merged[year] = { ...(merged[year] || { year }), projection: v };
  });
  return Object.values(merged).sort((a, b) => a.year - b.year);
}

function LivingStandardsCard({ living, meta }) {
  const metricIds = Object.keys(living.metrics);
  const [metric, setMetric] = useState(metricIds[0]);
  const [adjustment, setAdjustment] = useState("nominal");
  const [viewMode, setViewMode] = useState("both");

  const outturn = living.outturn?.[metric] || EMPTY;
  const projection = living.projection?.[metric] || EMPTY;
  const noOutturn = outturn.length === 0;
  // With no outturn for this metric, Outturn is disabled and Both shows the projection only.
  const effectiveView = noOutturn && viewMode === "outturn" ? "both" : viewMode;

  const chartData = useMemo(
    () => mergeSeries(outturn, projection, (d) => d[adjustment]),
    [outturn, projection, adjustment],
  );
  const yDomain = useMemo(
    () => [0, niceMax(Math.max(...chartData.flatMap((d) => [d.historical ?? 0, d.projection ?? 0])))],
    [chartData],
  );

  const priceBase = meta.real_price_base;
  const label = living.metrics[metric];
  const units = unitFor(meta, metric);
  const realSuffix = adjustment === "real" ? `, ${priceBase} prices` : "";

  let callout = null;
  if (projection.length >= 2) {
    const first = projection[0];
    const last = projection[projection.length - 1];
    const a = first[adjustment];
    const b = last[adjustment];
    if (a != null && b != null && a !== 0) {
      const pct = ((b - a) / a) * 100;
      const dir = Math.abs(pct) < 0.05 ? null : pct > 0 ? "increase" : "decrease";
      callout = (
        <p className="chart-summary">
          {label}
          {units || adjustment === "real" ? ` (${[units, adjustment === "real" ? `${priceBase} prices` : null].filter(Boolean).join(", ")})` : ""}{" "}
          is forecast to {dir ? `${dir} by ${formatOneDp(Math.abs(pct))}%` : "stay flat"} from{" "}
          {formatPounds(a)} in {first.year} to {formatPounds(b)} by {last.year}.
        </p>
      );
    }
  }

  return (
    <div className="section-box">
      <h3 className="chart-title">Living standards</h3>
      <p className="chart-description">
        {describeMetric(metric, label)}{" "}
        {adjustment === "real" ? `Real values are in ${priceBase} prices. ` : ""}
        {noOutturn
          ? "Dashed lines show PolicyEngine projections."
          : "Solid lines show official statistics; dashed lines show PolicyEngine projections."}
      </p>
      {callout}
      <div className="chart-controls">
        <select
          className="chart-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          aria-label="Income metric"
        >
          {metricIds.map((id) => (
            <option key={id} value={id}>
              {living.metrics[id]}
            </option>
          ))}
        </select>
        <div className="view-toggle" role="group" aria-label="Price basis">
          <button
            className={adjustment === "nominal" ? "active" : ""}
            aria-pressed={adjustment === "nominal"}
            onClick={() => setAdjustment("nominal")}
          >
            Nominal
          </button>
          <button
            className={adjustment === "real" ? "active" : ""}
            aria-pressed={adjustment === "real"}
            onClick={() => setAdjustment("real")}
          >
            Real
          </button>
        </div>
        <ViewModeToggle value={effectiveView} onChange={setViewMode} outturnDisabled={noOutturn} />
      </div>
      {chartData.length === 0 ? (
        <div className="chart-empty">No data for this metric.</div>
      ) : (
        <D3LineChart
          data={chartData}
          yLabel={`${units || "Household income"}${realSuffix}`}
          yFormat={yDomain[1] >= 10000 ? formatPoundsKAxis : formatPoundsWholeAxis}
          yDomain={yDomain}
          viewMode={effectiveView}
        />
      )}
      {noOutturn && <p className="chart-note">No official series on this definition.</p>}
    </div>
  );
}

function PovertyCard({ poverty }) {
  const measureIds = Object.keys(poverty.measures);
  const groupIds = Object.keys(poverty.groups);
  const [measure, setMeasure] = useState(measureIds[0]);
  const [group, setGroup] = useState(groupIds[0]);
  const [viewMode, setViewMode] = useState("both");

  const outturn = poverty.outturn?.[measure]?.[group] || EMPTY;
  const projection = poverty.projection?.[measure]?.[group] || EMPTY;

  const chartData = useMemo(
    () => mergeSeries(outturn, projection, (d) => (d.rate == null ? null : d.rate * 100)),
    [outturn, projection],
  );
  const yDomain = useMemo(
    () => [0, niceMax(Math.max(...chartData.flatMap((d) => [d.historical ?? 0, d.projection ?? 0])))],
    [chartData],
  );

  const isAbsolute = measure.startsWith("absolute");
  const isAHC = measure.endsWith("ahc");

  let callout = null;
  if (projection.length >= 2) {
    const first = projection[0];
    const last = projection[projection.length - 1];
    if (first.rate != null && last.rate != null) {
      const a = first.rate * 100;
      const b = last.rate * 100;
      const pp = b - a;
      const dir = Math.abs(pp) < 0.05 ? null : pp > 0 ? "increase" : "decrease";
      callout = (
        <p className="chart-summary">
          The {GROUP_PHRASE[group] ?? ""}poverty rate is forecast to{" "}
          {dir ? `${dir} by ${formatOneDp(Math.abs(pp))}pp` : "stay flat"} from {formatPct(a)} in{" "}
          {first.year} to {formatPct(b)} by {last.year}.
        </p>
      );
    }
  }

  const noOutturn = outturn.length === 0;
  const noProjection = projection.length === 0;
  const visibleEmpty =
    (viewMode === "outturn" && noOutturn) || (viewMode === "forecast" && noProjection) || chartData.length === 0;

  return (
    <div className="section-box">
      <h3 className="chart-title">Poverty rate</h3>
      <p className="chart-description">
        {isAbsolute
          ? "Absolute poverty measures income below a fixed line (60% of a base-year median) held constant in real terms."
          : "Relative poverty measures income below 60% of the contemporary median income."}{" "}
        {isAHC ? "After housing costs." : "Before housing costs."}
      </p>
      {callout}
      <div className="chart-controls">
        <select
          className="chart-select"
          value={measure}
          onChange={(e) => setMeasure(e.target.value)}
          aria-label="Poverty measure"
        >
          {measureIds.map((id) => (
            <option key={id} value={id}>
              {poverty.measures[id]}
            </option>
          ))}
        </select>
        <select
          className="chart-select"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          aria-label="Population group"
        >
          {groupIds.map((id) => (
            <option key={id} value={id}>
              {poverty.groups[id]}
            </option>
          ))}
        </select>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>
      {visibleEmpty ? (
        <div className="chart-empty">
          {viewMode === "outturn" && noOutturn
            ? `No official outturn series for ${poverty.groups[group].toLowerCase()} on this measure.`
            : "No projection for this selection."}
        </div>
      ) : (
        <D3LineChart
          data={chartData}
          yLabel="Poverty rate"
          yFormat={formatPctAxis}
          yDomain={yDomain}
          viewMode={viewMode}
        />
      )}
      {!visibleEmpty && noOutturn && viewMode === "both" && (
        <p className="chart-note">
          No official outturn series for {poverty.groups[group].toLowerCase()} on this measure; projection only.
        </p>
      )}
    </div>
  );
}

export default function BaselineTab({ data }) {
  return (
    <div className="baseline-tab">
      <h2 className="section-title">Economic outlook</h2>
      <p className="chart-description">
        PolicyEngine projections of UK household incomes and poverty under current legislated
        policy, the baseline against which Autumn Budget 2026 measures are scored.
      </p>
      <div className="charts-row">
        <LivingStandardsCard living={data.living_standards} meta={data.meta} />
        <PovertyCard poverty={data.poverty} />
      </div>
    </div>
  );
}
