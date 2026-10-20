"use client";

// Inequality: Gini and 90:10, BHC or AHC; HBAI outturn solid, projection dashed.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import LineSeriesChart from "../LineSeriesChart";
import { EMPTY, VIEW_OPTIONS, legendItemsFor, lineSeries, mergeSeries, rangeAxis, visibleRows } from "../../lib/baseline";
import { fyDash, fyLabel, headlineSpan } from "../../lib/outlook";

const FORMAT = {
  gini: (v) => v.toFixed(3),
  p90_p10: (v) => v.toFixed(2),
};

export default function InequalitySection({ data }) {
  const ineq = data.inequality;
  const [measure, setMeasure] = useState("gini");
  const [basis, setBasis] = useState("bhc");
  const [viewMode, setViewMode] = useState("both");
  const outturn = ineq.outturn?.[measure]?.[basis] || EMPTY;
  const projection = ineq.projection?.[measure]?.[basis] || EMPTY;
  const fmt = FORMAT[measure] || ((v) => v.toFixed(2));

  const rows = useMemo(
    () => visibleRows(mergeSeries(outturn, projection, (d) => d.value), viewMode),
    [outturn, projection, viewMode],
  );
  const axis = rangeAxis(rows.flatMap((r) => [r.historical, r.projection]), { pad: 0.2 });
  const noOutturn = outturn.length === 0;

  const span = headlineSpan(projection, data);
  let summary = null;
  if (span) {
    const [a, b] = span;
    const same = fmt(a.value) === fmt(b.value);
    summary = (
      <p className="chart-summary">
        The {ineq.measures[measure].replace(/ coefficient/, "")} ({basis.toUpperCase()}){" "}
        {same ? (
          <>
            <strong>stays flat</strong> at {fmt(a.value)} from {fyDash(a.year)} to {fyDash(b.year)}
          </>
        ) : (
          <>
            <strong>{b.value > a.value ? "rises" : "falls"}</strong> from {fmt(a.value)} in {fyDash(a.year)} to{" "}
            {fmt(b.value)} by {fyDash(b.year)}
          </>
        )}
        .
      </p>
    );
  }

  return (
    <ChartCard
      title="Inequality"
      description="Gini: 0 is perfect equality, 1 is one household holding all income. 90:10: income at the 90th percentile over income at the 10th. The model's Gini is about 3 points below HBAI's in 2024–25. HBAI outturn: Table 1.2b."
      summary={summary}
      footer={<p className="chart-note">Read the projection as a change, not a level.</p>}
      exportOptions={rows.length ? { filename: `inequality-${measure}-${basis}`, legendItems: legendItemsFor(viewMode, !noOutturn) } : null}
      controls={
        <>
          <Dropdown
            fieldLabel="Measure"
            label="Inequality measure"
            value={measure}
            onChange={setMeasure}
            options={Object.keys(ineq.measures).map((id) => ({ id, label: ineq.measures[id] }))}
          />
          <Dropdown
            fieldLabel="Housing costs"
            label="Housing costs"
            value={basis}
            onChange={setBasis}
            options={Object.keys(ineq.bases).map((id) => ({ id, label: id === "bhc" ? "Before (BHC)" : "After (AHC)" }))}
          />
          <Dropdown
            fieldLabel="Period"
            label="Series shown"
            value={viewMode}
            onChange={setViewMode}
            options={VIEW_OPTIONS}
          />
        </>
      }
    >
      <LineSeriesChart
        data={rows}
        series={lineSeries(viewMode, !noOutturn)}
        xFormat={fyLabel}
        yFormat={(v) => (measure === "gini" ? v.toFixed(2) : v.toFixed(1))}
        tooltipFormat={fmt}
        yLabel={ineq.measures[measure]}
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}
