"use client";

// Ported from PolicyEngine/uk-spring-statement-2026
// src/components/ForecastTab.jsx and ForecastTable.jsx.
// Series, sections and labels now come from outlook.json; values arrive as
// fractions and are shown in percent. While the Budget forecast is
// unpublished (forecast.post_published === false) only the pre line is drawn
// and the post column / change are shown as pending.

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors } from "@policyengine/ui-kit/legacy/tokens/colors";
import { chartColors } from "@policyengine/ui-kit/legacy/charts";
import { formatOneDp } from "../lib/outlook";

const HERO_YEAR = "2026";

const pctLabel = (v) => (v == null ? "—" : `${formatOneDp(v)}%`);
const ppLabel = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${formatOneDp(v)}pp`);
const changeClass = (v) =>
  v == null || Math.abs(v) < 0.05 ? "change-zero" : v > 0 ? "change-positive" : "change-negative";

/** Join pre/post into rows of { year, previous, updated, change } in percent. */
function toRows(series, published) {
  const post = Object.fromEntries((series.post || []).map((p) => [p.year, p.value]));
  return (series.pre || []).map((p) => {
    const previous = p.value == null ? null : p.value * 100;
    const updated = published && post[p.year] != null ? post[p.year] * 100 : null;
    return {
      year: p.year,
      previous,
      updated,
      change: previous != null && updated != null ? updated - previous : null,
    };
  });
}

function ForecastLineChart({ rows, title, published, preLabel, postLabel }) {
  if (!rows.length) return null;

  // Only one line while unpublished: draw it teal so it does not read as the
  // grey "official historical" line on the baseline tab.
  const preColour = published ? chartColors.secondary : colors.primary[600];
  const postColour = colors.primary[600];
  const names = { previous: preLabel, updated: postLabel };

  const allValues = rows.flatMap((d) => [d.previous, published ? d.updated : null].filter((v) => v != null));
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const range = dataMax - dataMin;
  const step = range <= 2 ? 0.5 : range <= 5 ? 1 : 2;
  const yMin = Math.floor(dataMin / step - 1) * step;
  const yMax = Math.ceil(dataMax / step + 1) * step;
  const ticks = [];
  for (let v = yMin; v <= yMax + step * 0.01; v += step) ticks.push(Math.round(v * 10) / 10);

  return (
    <div className="section-card">
      <h3>{title}</h3>
      <p className="card-unit">Annual growth rate (%)</p>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.gray[500] }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: colors.gray[500] }}
              tickFormatter={(v) => `${formatOneDp(v).replace(/\.0$/, "")}%`}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={[yMin, yMax]}
              ticks={ticks}
              allowDecimals
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: `1px solid ${colors.border.light}`,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontSize: "0.85rem",
              }}
              formatter={(value, name) => [pctLabel(value), names[name] ?? name]}
            />
            <Legend formatter={(value) => names[value] ?? value} wrapperStyle={{ fontSize: "0.8rem" }} />
            <Line
              type="monotone"
              dataKey="previous"
              stroke={preColour}
              strokeWidth={published ? 2 : 2.5}
              dot={{ r: 3, fill: preColour }}
              activeDot={{ r: 5 }}
              name="previous"
              isAnimationActive={false}
            />
            {published && (
              <Line
                type="monotone"
                dataKey="updated"
                stroke={postColour}
                strokeWidth={2.5}
                dot={{ r: 3, fill: postColour }}
                activeDot={{ r: 5 }}
                name="updated"
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ForecastTableCard({ rows, title, preLabel, postLabel, published }) {
  if (!rows.length) return null;
  return (
    <div className="section-card">
      <h3>{title}</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="forecast-table">
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
                <td>{published ? pctLabel(row.updated) : "Not yet published"}</td>
                <td className={changeClass(row.change)}>{ppLabel(row.change)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ForecastTab({ data }) {
  const [viewMode, setViewMode] = useState("chart");
  const forecast = data?.forecast;

  if (!forecast) {
    return (
      <div className="data-message">
        <p>Forecast data is not available in outlook.json.</p>
      </div>
    );
  }

  const published = Boolean(forecast.post_published);
  const preLabel = forecast.pre_label;
  const postLabel = forecast.post_label;

  const byKey = {};
  forecast.sections.forEach((s) => s.series.forEach((series) => (byKey[series.key] = series)));

  const heroCards = (forecast.headline || [])
    .map((key) => {
      const series = byKey[key];
      if (!series) return null;
      const row = toRows(series, published).find((r) => r.year === HERO_YEAR);
      if (!row) return null;
      return { key, label: `${series.label.replace(/ (inflation|growth)$/i, "")} ${HERO_YEAR}`, ...row };
    })
    .filter(Boolean);

  return (
    <div className="forecast-tab">
      {!published && (
        <div className="data-message" role="status">
          <strong>Budget forecast not yet published</strong> — showing the OBR March 2026 forecast
          only. Each card will compare it with the {postLabel.charAt(0).toLowerCase() + postLabel.slice(1)} once
          the OBR publishes it alongside the Autumn Budget.
        </div>
      )}

      <div className="forecast-grid-3">
        {heroCards.map((card) => (
          <div key={card.key} className="hero-card">
            <div className="hero-label">{card.label}</div>
            {published ? (
              <>
                <div className="hero-value">
                  {pctLabel(card.previous)} &rarr; {pctLabel(card.updated)}
                </div>
                <div className={`hero-change ${changeClass(card.change)}`}>{ppLabel(card.change)}</div>
              </>
            ) : (
              <>
                <div className="hero-value">{pctLabel(card.previous)}</div>
                <div className="hero-pending">Budget revision pending</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="ft-toggle" role="group" aria-label="Chart or table">
        <button
          className={viewMode === "chart" ? "active" : ""}
          aria-pressed={viewMode === "chart"}
          onClick={() => setViewMode("chart")}
        >
          Chart
        </button>
        <button
          className={viewMode === "table" ? "active" : ""}
          aria-pressed={viewMode === "table"}
          onClick={() => setViewMode("table")}
        >
          Table
        </button>
      </div>

      {forecast.sections.map((section) => (
        <div key={section.title}>
          <h2 className="forecast-section-heading">{section.title}</h2>
          <div className="forecast-grid-2">
            {section.series.map((series) => {
              const rows = toRows(series, published);
              return viewMode === "chart" ? (
                <ForecastLineChart
                  key={series.key}
                  rows={rows}
                  title={series.label}
                  published={published}
                  preLabel={preLabel}
                  postLabel={postLabel}
                />
              ) : (
                <ForecastTableCard
                  key={series.key}
                  rows={rows}
                  title={series.label}
                  published={published}
                  preLabel={preLabel}
                  postLabel={postLabel}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
