"use client";

// Poverty rate card. Logic ported from the scottish-budget-2026-2027
// "Economic outlook" card; chrome and chart follow uk-autumn-budget-dashboard-2026.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import LineSeriesChart from "../LineSeriesChart";
import { changeVerb, fyDash, fyLabel, formatPct, formatPctAxis, headlineSpan } from "../../lib/outlook";
import {
  EMPTY,
  VIEW_OPTIONS,
  legendItemsFor,
  lineSeries,
  mergeSeries,
  niceAxis,
  projectionStartYear,
  trimProjection,
  visibleRows,
} from "../../lib/baseline";
import { HbaiSource } from "../../lib/sources";

const GROUP_SUFFIX = {
  all: "",
  children: " among children",
  working_age: " among working-age adults",
  pensioners: " among pensioners",
};

export default function PovertySection({ data }) {
  const poverty = data.poverty;
  const measureIds = Object.keys(poverty.measures);
  const groupIds = Object.keys(poverty.groups);
  const [measure, setMeasure] = useState(measureIds[0]);
  const [group, setGroup] = useState(groupIds[0]);
  const [viewMode, setViewMode] = useState("both");

  const startYear = useMemo(() => projectionStartYear(data), [data]);
  const outturn = poverty.outturn?.[measure]?.[group] || EMPTY;
  const projection = useMemo(
    () => trimProjection(poverty.projection?.[measure]?.[group], startYear),
    [poverty, measure, group, startYear],
  );

  const chartData = useMemo(
    () =>
      visibleRows(
        mergeSeries(outturn, projection, (d) => (d.rate == null ? null : d.rate * 100)),
        viewMode,
      ),
    [outturn, projection, viewMode],
  );
  const axis = niceAxis(Math.max(...chartData.flatMap((d) => [d.historical ?? 0, d.projection ?? 0])));
  const yMax = axis.domain[1];

  const isAbsolute = measure.startsWith("absolute");
  const isAHC = measure.endsWith("ahc");
  const groupName = poverty.groups[group].toLowerCase();

  let summary = null;
  const span = headlineSpan(projection, data);
  if (span && span[0].rate != null && span[1].rate != null) {
    const [first, last] = span;
    const a = first.rate * 100;
    const b = last.rate * 100;
    const verb = changeVerb(b - a, "pp");
    const kind = isAbsolute ? "Absolute" : "Relative";
    const line = isAbsolute ? "fixed real-terms line" : "60% of current median";
    summary = (
      <p className="chart-summary">
        {kind} poverty{GROUP_SUFFIX[group] ?? ""} ({isAHC ? "AHC" : "BHC"}, {line}){" "}
        {verb ? (
          <>
            <strong>{verb}</strong>, from {formatPct(a)} in {fyDash(first.year)} to {formatPct(b)} by{" "}
            {fyDash(last.year)}.
          </>
        ) : (
          <>
            <strong>stays flat</strong> at {formatPct(a)} from {fyDash(first.year)} to {fyDash(last.year)}.
          </>
        )}
      </p>
    );
  }

  const noOutturn = outturn.length === 0;
  const noProjection = projection.length === 0;
  const visibleEmpty =
    (viewMode === "outturn" && noOutturn) || (viewMode === "forecast" && noProjection) || chartData.length === 0;

  const description = `${
    isAbsolute
      ? "Absolute poverty measures income below a fixed line (60% of a base-year median) held constant in real terms."
      : "Relative poverty measures income below 60% of the contemporary median income."
  } ${isAHC ? "After housing costs." : "Before housing costs."}`;

  return (
    <ChartCard
      title="Poverty rate"
      description={description}
      summary={summary}
      source={<HbaiSource />}
      exportOptions={visibleEmpty ? null : { filename: `poverty-${measure}-${group}`, legendItems: legendItemsFor(viewMode, !noOutturn) }}
      controls={
        <>
          <Dropdown
            fieldLabel="Measure"
            label="Poverty measure"
            value={measure}
            onChange={setMeasure}
            options={measureIds.map((id) => ({ id, label: poverty.measures[id] }))}
          />
          <Dropdown
            fieldLabel="Group"
            label="Population group"
            value={group}
            onChange={setGroup}
            options={groupIds.map((id) => ({ id, label: poverty.groups[id] }))}
          />
          <Dropdown fieldLabel="Period" label="Series shown" value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />
        </>
      }
      footer={
        !visibleEmpty &&
        noOutturn &&
        viewMode === "both" && (
          <p className="chart-note">
            No official outturn series for {groupName} on this measure; projection only.
          </p>
        )
      }
    >
      {visibleEmpty ? (
        <div className="chart-empty">
          {viewMode === "outturn" && noOutturn
            ? `No official outturn series for ${groupName} on this measure.`
            : "No projection for this selection."}
        </div>
      ) : (
        <LineSeriesChart
          data={chartData}
          series={lineSeries(viewMode, !noOutturn)}
          xFormat={fyLabel}
          yFormat={formatPctAxis}
          tooltipFormat={formatPct}
          yLabel="Poverty rate"
          yDomain={axis.domain}
          yTicks={axis.ticks}
        />
      )}
    </ChartCard>
  );
}
