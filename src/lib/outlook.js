// Data loading and formatting helpers for public/data/outlook.json.
// Shape is defined in DATA_CONTRACT.md at the repo root.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

async function fetchJson(path) {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

/**
 * Load the real outlook; fall back to the placeholder sample when it is
 * missing or unreadable. Returns { data, isSample, error }.
 */
export async function loadOutlook() {
  try {
    const data = await fetchJson("/data/outlook.json");
    return { data, isSample: false, error: null };
  } catch (primaryError) {
    try {
      const data = await fetchJson("/data/outlook.sample.json");
      return { data, isSample: true, error: null };
    } catch (sampleError) {
      return { data: null, isSample: false, error: sampleError.message };
    }
  }
}

/** "2024-25" -> 2024 (numeric x value for the line chart). */
export const fyStart = (fy) => parseInt(String(fy).slice(0, 4), 10);

/** 2030 -> "2030–31" (en dash). */
export const fyLabel = (start) => `${start}–${String(start + 1).slice(-2)}`;

/** Display a fiscal year from the data ("2025-26") with an en dash: "2025–26". */
export const fyDash = (fy) => String(fy ?? "").replace(/(\d{4})-(\d{2})(?!\d)/g, "$1–$2");

const gb = (opts) => new Intl.NumberFormat("en-GB", opts);
const pct1 = gb({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const k1 = gb({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const k0 = gb({ maximumFractionDigits: 0 });

/** 41234 -> "£41.2k"; 719 -> "£719" (weekly or equivalised figures stay in pounds). */
export const formatPounds = (v) => (Math.abs(v) >= 10000 ? `£${k1.format(v / 1000)}k` : `£${k0.format(v)}`);
/** Axis tick formatters: "£40k" style, or whole pounds for small scales. */
export const formatPoundsKAxis = (v) => `£${k0.format(v / 1000)}k`;
export const formatPoundsWholeAxis = (v) => `£${k0.format(v)}`;
/** 13.2 (already a percentage) -> "13.2%" */
export const formatPct = (v) => `${pct1.format(v)}%`;
/** Axis ticks: 12 -> "12%" */
export const formatPctAxis = (v) => `${k0.format(v)}%`;
/** 1.06 -> "1.1" */
export const formatOneDp = (v) => pct1.format(v);

/** Round an axis maximum up to a tidy value. */
export function niceMax(v) {
  if (!(v > 0)) return 1;
  const padded = v * 1.1;
  const mag = 10 ** Math.floor(Math.log10(padded));
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10];
  const n = padded / mag;
  return (steps.find((s) => s >= n) ?? 10) * mag;
}

/** Pull the first http(s) URL out of free text. */
export function splitSource(text) {
  if (!text) return { label: "", url: null };
  const m = String(text).match(/https?:\/\/\S+/);
  if (!m) return { label: String(text), url: null };
  const url = m[0].replace(/[).,;]+$/, "");
  const label = String(text).replace(m[0], "").replace(/[\s:;,(–-]+$/, "").trim();
  return { label: label || url, url };
}

/** End year for headline comparisons (meta.headline_end_year, e.g. "2029-30"). */
export const headlineYear = (data) => data?.meta?.headline_end_year || null;

/** Start year for headline changes (meta.headline_start_year, e.g. "2025-26"). */
export const headlineStartYear = (data) => data?.meta?.headline_start_year || null;

/**
 * Headline-start row (2025-26; the first row if absent) and the headline-year
 * row (or the last row) of a projection. Series that also carry the model's
 * 2024-25 point still report change from 2025-26.
 */
export function headlineSpan(rows, data) {
  if (!rows || rows.length < 2) return null;
  const start = headlineStartYear(data);
  const end = headlineYear(data);
  const first = (start && rows.find((r) => r.year === start)) || rows[0];
  const last = (end && rows.find((r) => r.year === end)) || rows[rows.length - 1];
  return first === last ? null : [first, last];
}

/** Round to one decimal place, so a change agrees with the values shown. */
export const round1 = (v) => (v == null ? v : Math.round(v * 10) / 10);

/** "rises 10.0%" / "falls 1.3pp" / null when the change rounds to zero. */
export function changeVerb(delta, unit) {
  if (delta == null || Math.abs(delta) < 0.05) return null;
  return `${delta > 0 ? "rises" : "falls"} ${formatOneDp(Math.abs(delta))}${unit}`;
}

/** "rises 10.0%" -> "rises": the direction alone, for a figure the headline strip already gives. */
export const directionOf = (verb) => (verb ? verb.split(" ")[0] : "stays flat");

/** Section notes minus the 2030-31 UC step, which meta.headline_end_year_note states once. */
export const sectionNotes = (notes) =>
  (notes || []).filter((n) => !/baseline discontinuity|UC health element protection|^Series end in/i.test(n));
