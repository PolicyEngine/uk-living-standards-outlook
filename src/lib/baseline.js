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

/**
 * Axis over [min, max] (optionally forced to include 0) with about five round
 * steps. For series that do not start at zero (Gini, 90:10) or that go
 * negative (growth). Returns { domain, ticks }.
 */
export function rangeAxis(values, { includeZero = false, pad = 0.05 } = {}) {
  const vals = values.filter((v) => v != null && Number.isFinite(v));
  if (!vals.length) return { domain: [0, 1], ticks: [0, 1] };
  let lo = Math.min(...vals, ...(includeZero ? [0] : []));
  let hi = Math.max(...vals, ...(includeZero ? [0] : []));
  const span = hi - lo || Math.abs(hi) || 1;
  if (!(includeZero && lo === 0)) lo -= span * pad;
  if (!(includeZero && hi === 0)) hi += span * pad;
  const raw = (hi - lo) / 5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = start; v <= end + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}

/** Rows of { year, value } -> chart rows keyed by fiscal-year start. */
export const byYear = (rows, pick = (d) => d.value) =>
  (rows || []).map((d) => ({ year: fyStart(d.year), value: pick(d) }));

/** Join several { year, ... } series into one row per year: { year, [key]: value }. */
export function joinSeries(entries) {
  const out = {};
  entries.forEach(([key, rows, pick]) =>
    (rows || []).forEach((d) => {
      const year = fyStart(d.year);
      const v = pick(d);
      if (v == null) return;
      out[year] = { ...(out[year] || { year }), [key]: v };
    }),
  );
  return Object.values(out).sort((a, b) => a.year - b.year);
}

/** Chart palette (teal ramp + neutral), as the published UK dashboards. */
export const PALETTE = {
  dark: "#285E61",
  teal: "#319795",
  light: "#81E6D9",
  grey: "#9CA3AF",
  amber: "#D97706",
  red: "#B91C1C",
};
