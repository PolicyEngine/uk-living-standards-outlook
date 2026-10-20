// Helpers shared by the baseline sections (living standards, poverty).

import { fyStart } from "./outlook";

export const EMPTY = [];

export const OUTTURN_COLOUR = "#9CA3AF";
export const PROJECTION_COLOUR = "#319795";

export const VIEW_OPTIONS = [
  { id: "outturn", label: "Outturn" },
  { id: "both", label: "Both" },
  { id: "forecast", label: "Forecast" },
];

export const NO_OFFICIAL_SERIES = "No official series on this definition";

/**
 * First projection year the charts show: the year after the latest HBAI
 * outturn year anywhere in the file (2025-26 with the current data). The
 * engine's own estimate for outturn years is not drawn; the footer notes how
 * it compares with HBAI.
 */
export function projectionStartYear(data) {
  let last = -Infinity;
  const scan = (rows) => (rows || []).forEach((d) => (last = Math.max(last, fyStart(d.year))));
  Object.values(data?.living_standards?.outturn || {}).forEach(scan);
  Object.values(data?.poverty?.outturn || {}).forEach((byGroup) => Object.values(byGroup || {}).forEach(scan));
  return Number.isFinite(last) ? last + 1 : -Infinity;
}

/** Drop projection rows before the first non-outturn year. */
export const trimProjection = (rows, startYear) => (rows || EMPTY).filter((d) => fyStart(d.year) >= startYear);

/** Merge outturn + projection rows into { year, historical, projection }. */
export function mergeSeries(outturn, projection, pick) {
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

/** Rows with a value on a visible line, so the x axis spans only what is drawn. */
export function visibleRows(rows, viewMode) {
  return rows.filter(
    (d) =>
      (viewMode !== "forecast" && d.historical != null) || (viewMode !== "outturn" && d.projection != null),
  );
}

export function lineSeries(viewMode, hasOutturn = true) {
  return [
    {
      key: "historical",
      name: "Official (historical)",
      colour: OUTTURN_COLOUR,
      hidden: viewMode === "forecast" || !hasOutturn,
    },
    {
      key: "projection",
      name: "Baseline (projection)",
      colour: PROJECTION_COLOUR,
      dashed: true,
      hidden: viewMode === "outturn",
    },
  ];
}

export function legendItemsFor(viewMode, hasOutturn = true) {
  return lineSeries(viewMode, hasOutturn)
    .filter((s) => !s.hidden)
    .map((s) => ({ color: s.colour, label: s.name, type: "line" }));
}

/**
 * Axis from 0 with about five round steps (1, 2, 2.5 or 5 x 10^n) that clear
 * the data maximum by at least 5%. Returns { domain, ticks }.
 */
export function niceAxis(dataMax) {
  const max = dataMax > 0 ? dataMax * 1.05 : 1;
  const raw = max / 5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const n = Math.ceil(max / step);
  const ticks = Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);
  return { domain: [0, ticks[n]], ticks };
}
