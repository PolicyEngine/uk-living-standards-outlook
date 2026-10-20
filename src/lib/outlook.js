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

/** 2030 -> "2030-31". */
export const fyLabel = (start) => `${start}-${String(start + 1).slice(-2)}`;

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
