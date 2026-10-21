// Headline strip: four 2025-26 -> 2029-30 changes, computed from outlook.json
// with the same helpers the cards use, so the rounding always agrees. Each
// figure is stated once on the page: a card whose current selection is one of
// these drops the from/to numbers from its lead sentence (see `inStrip`).

import { changeVerb, formatPct, formatPounds, fyDash, headlineSpan, round1 } from "./outlook";

const pp = (d) => `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d).toFixed(1)}pp`;

/** The selections the strip covers, by card. */
export const STRIP = {
  income: { metric: "median_equivalised_income", adjustment: "real" },
  poverty: [
    { measure: "absolute_bhc", group: "all" },
    { measure: "relative_ahc", group: "children" },
  ],
  inequality: { measure: "gini", basis: "bhc" },
};

/** Is this card selection shown in the headline strip? */
export function inStrip(card, sel) {
  const s = STRIP[card];
  const match = (o) => Object.entries(o).every(([k, v]) => sel[k] === v);
  return Array.isArray(s) ? s.some(match) : match(s);
}

export function headlineTiles(data) {
  const tiles = [];
  const add = (t) => t && tiles.push(t);

  const inc = headlineSpan(data.living_standards?.projection?.median_equivalised_income, data);
  if (inc && inc[0].real && inc[1].real != null) {
    const [a, b] = inc;
    const d = ((b.real - a.real) / a.real) * 100;
    add({
      id: "income",
      href: "#incomes",
      label: "Real median income",
      qualifier: `Before housing costs, ${fyDash(data.meta.real_price_base)} prices`,
      from: formatPounds(a.real),
      to: formatPounds(b.real),
      change: changeVerb(d, "%") || "stays flat",
      years: [a.year, b.year],
    });
  }

  const rate = (rows, label, qualifier, href, id) => {
    const s = headlineSpan(rows, data);
    if (!s || s[0].rate == null || s[1].rate == null) return null;
    const a = round1(s[0].rate * 100);
    const b = round1(s[1].rate * 100);
    const d = round1(b - a);
    return {
      id,
      href,
      label,
      qualifier,
      from: formatPct(a),
      to: formatPct(b),
      change: Math.abs(d) < 0.05 ? "stays flat" : pp(d),
      years: [s[0].year, s[1].year],
    };
  };
  const pov = data.poverty?.projection;
  add(rate(pov?.absolute_bhc?.all, "Absolute poverty", "All people, before housing costs", "#poverty", "abs-poverty"));
  add(
    rate(pov?.relative_ahc?.children, "Relative child poverty", "After housing costs", "#child-poverty", "child-poverty"),
  );

  const g = headlineSpan(data.inequality?.projection?.gini?.bhc, data);
  if (g) {
    const [a, b] = g;
    const fa = a.value.toFixed(3);
    const fb = b.value.toFixed(3);
    add({
      id: "gini",
      href: "#incomes",
      label: "Income inequality (Gini)",
      qualifier: "Before housing costs; 0 is perfect equality",
      from: fa,
      to: fb,
      change: fa === fb ? "stays flat" : b.value > a.value ? "rises" : "falls",
      years: [a.year, b.year],
    });
  }
  return tiles;
}
