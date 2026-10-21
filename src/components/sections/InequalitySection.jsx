"use client";

// Inequality: Gini and 90:10, BHC or AHC; HBAI outturn solid, projection dashed.

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import { EMPTY, VIEW_OPTIONS, legendItemsFor, lineSeries, mergeSeries, rangeAxis, shadeFrom, visibleRows } from "../../lib/baseline";
import { inStrip } from "../../lib/headline";
import { fyDash, fyLabel, headlineSpan } from "../../lib/outlook";
import { HbaiSource } from "../../lib/sources";

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
        {inStrip("inequality", { measure, basis }) ? (
          // The headline strip gives this selection's figures.
          <>
            <strong>{same ? "stays flat" : b.value > a.value ? "rises" : "falls"}</strong> from {fyDash(a.year)} to{" "}
            {fyDash(b.year)}
          </>
        ) : same ? (
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
      description="Gini: 0 is perfect equality, 1 is one person holding all income. 90:10: income at the 90th percentile over income at the 10th. Official figures: Households Below Average Income, Table 1.2b."
      summary={summary}
      notes={(ineq.notes || []).filter((n) => !/^Outturn is/.test(n))}
      source={<HbaiSource />}
      exportOptions={rows.length ? { filename: `inequality-${measure}-${basis}`, legendItems: legendItemsFor(viewMode, !noOutturn) } : null}
      controls={
        <>
          <SegmentedToggle
            fieldLabel="Measure"
            label="Inequality measure"
            value={measure}
            onChange={setMeasure}
            options={Object.keys(ineq.measures).map((id) => ({ id, label: ineq.measures[id].replace(/ coefficient$/, "") }))}
          />
          <SegmentedToggle
            fieldLabel="Housing costs"
            label="Housing costs"
            value={basis}
            onChange={setBasis}
            options={Object.keys(ineq.bases).map((id) => ({ id, label: id.toUpperCase(), title: id === "bhc" ? "Before housing costs" : "After housing costs" }))}
          />
          <SegmentedToggle
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
        projectionFrom={shadeFrom(rows, viewMode, !noOutturn)}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
InequalitySection.requires = "inequality";
