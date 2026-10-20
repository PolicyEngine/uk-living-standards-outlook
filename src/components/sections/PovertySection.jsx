"use client";

// Poverty rate card. Logic ported from the scottish-budget-2026-2027
// "Economic outlook" card; chrome and chart follow uk-autumn-budget-dashboard-2026.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import { fyLabel, formatOneDp, formatPct, formatPctAxis } from "../../lib/outlook";
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

const GROUP_PHRASE = {
  all: "",
  children: "child ",
  working_age: "working-age ",
  pensioners: "pensioner ",
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
  if (projection.length >= 2) {
    const first = projection[0];
    const last = projection[projection.length - 1];
    if (first.rate != null && last.rate != null) {
      const a = first.rate * 100;
      const b = last.rate * 100;
      const pp = b - a;
      const dir = Math.abs(pp) < 0.05 ? null : pp > 0 ? "increase" : "decrease";
      summary = (
        <p className="chart-summary">
          The {GROUP_PHRASE[group] ?? ""}poverty rate is forecast to{" "}
          <strong>{dir ? `${dir} by ${formatOneDp(Math.abs(pp))}pp` : "stay flat"}</strong> from{" "}
          {formatPct(a)} in {first.year} to {formatPct(b)} by {last.year}.
        </p>
      );
    }
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
      exportOptions={visibleEmpty ? null : { filename: `poverty-${measure}-${group}`, legendItems: legendItemsFor(viewMode, !noOutturn) }}
      controls={
        <>
          <Dropdown
            label="Poverty measure"
            value={measure}
            onChange={setMeasure}
            options={measureIds.map((id) => ({ id, label: poverty.measures[id] }))}
          />
          <Dropdown
            label="Population group"
            value={group}
            onChange={setGroup}
            options={groupIds.map((id) => ({ id, label: poverty.groups[id] }))}
          />
          <SegmentedToggle label="Series shown" value={viewMode} onChange={setViewMode} options={VIEW_OPTIONS} />
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
