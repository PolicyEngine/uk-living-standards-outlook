"use client";

// Forecast series by section, as charts or tables. Ported from
// uk-spring-statement-2026 ForecastTab/ForecastTable; chrome and chart follow
// uk-autumn-budget-dashboard-2026 (pre-Budget grey solid, post-Budget teal dashed).

import { useState } from "react";
import ChartCard from "../ChartCard";
import SegmentedToggle from "../SegmentedToggle";
import LineSeriesChart from "../LineSeriesChart";
import { changeClass, pctLabel, percentAxis, ppLabel, toRows } from "../../lib/forecast";
import { formatOneDp } from "../../lib/outlook";

const pctTick = (v) => `${formatOneDp(v).replace(/\.0$/, "")}%`;

function seriesFor(published, preLabel, postLabel) {
  // While unpublished only the pre line is drawn: teal, so it does not read
  // as a greyed-out comparison line.
  if (!published) return [{ key: "previous", name: preLabel, colour: "#319795" }];
  return [
    { key: "previous", name: preLabel, colour: "#9CA3AF" },
    { key: "updated", name: postLabel, colour: "#319795", dashed: true },
  ];
}

function ForecastChartCard({ series, published, preLabel, postLabel }) {
  const rows = toRows(series, published);
  if (!rows.length) return null;
  const lines = seriesFor(published, preLabel, postLabel);
  const values = rows.flatMap((d) => [d.previous, published ? d.updated : null]).filter((v) => v != null);
  const axis = percentAxis(values);
  return (
    <ChartCard
      title={series.label}
      exportOptions={{
        filename: `forecast-${series.key}`,
        legendItems: lines.map((l) => ({ color: l.colour, label: l.name, type: "line" })),
      }}
    >
      <LineSeriesChart
        data={rows}
        series={lines}
        yFormat={pctTick}
        tooltipFormat={pctLabel}
        yLabel="Annual growth (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
        height={320}
      />
    </ChartCard>
  );
}

function ForecastTableCard({ series, published, preLabel, postLabel }) {
  const rows = toRows(series, published);
  if (!rows.length) return null;
  return (
    <ChartCard title={series.label} description="Annual growth rate (%).">
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>{preLabel}</th>
              <th>{postLabel}</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{pctLabel(row.previous)}</td>
                {published ? <td>{pctLabel(row.updated)}</td> : <td className="pending">Not yet published</td>}
                <td className={changeClass(row.change)}>{ppLabel(row.change)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

export default function ForecastSeriesSection({ data }) {
  const [viewMode, setViewMode] = useState("chart");
  const forecast = data.forecast;
  const published = Boolean(forecast.post_published);
  const Card = viewMode === "chart" ? ForecastChartCard : ForecastTableCard;

  return (
    <div>
      {forecast.sections.map((section, i) => (
        <div key={section.title} className="series-block">
          <div className="section-toolbar">
            <h2 className="section-heading">{section.title}</h2>
            {i === 0 && (
              <SegmentedToggle
                label="Chart or table"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { id: "chart", label: "Chart" },
                  { id: "table", label: "Table" },
                ]}
              />
            )}
          </div>
          <div className="charts-grid">
            {section.series.map((series) => (
              <Card
                key={series.key}
                series={series}
                published={published}
                preLabel={forecast.pre_label}
                postLabel={forecast.post_label}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
