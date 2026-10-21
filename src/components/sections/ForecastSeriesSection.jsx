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
import { ObrSource, PeDerivedSource } from "../../lib/sources";

// CPI after housing costs and social rent are PolicyEngine derivations, not OBR series.
const DERIVED = new Set(["cpi_ahc", "social_rent"]);
const sourceFor = (series) => (DERIVED.has(series.key) ? <PeDerivedSource /> : <ObrSource />);
// Line names for derived series: they follow the OBR forecast but are not OBR's.
const DERIVED_LABEL = "PolicyEngine derivation from the OBR March 2026 forecast";

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
  const derived = DERIVED.has(series.key);
  const lines = seriesFor(published, derived ? DERIVED_LABEL : preLabel, derived ? `PolicyEngine derivation from the ${postLabel}` : postLabel);
  const values = rows.flatMap((d) => [d.previous, published ? d.updated : null]).filter((v) => v != null);
  const axis = percentAxis(values);
  return (
    <ChartCard
      title={series.label}
      source={sourceFor(series)}
      exportOptions={{
        filename: `forecast-${series.key}`,
        legendItems: lines.map((l) => ({ color: l.colour, label: l.name, type: "line", dash: l.dashed ? "8 4" : undefined })),
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
    <ChartCard title={series.label} description="Annual growth rate (%)." source={sourceFor(series)}>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>{DERIVED.has(series.key) ? "PolicyEngine derivation (pre-Budget)" : preLabel}</th>
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

/** Anchor id for a forecast section heading (also used by the section nav). */
export const sectionId = (title) => `forecast-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`;

export default function ForecastSeriesSection({ data }) {
  const [viewMode, setViewMode] = useState("chart");
  const forecast = data.forecast;
  const published = Boolean(forecast.post_published);
  const Card = viewMode === "chart" ? ForecastChartCard : ForecastTableCard;

  return (
    <div>
      {forecast.sections.map((section, i) => (
        <div key={section.title} id={sectionId(section.title)} className="series-block">
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
