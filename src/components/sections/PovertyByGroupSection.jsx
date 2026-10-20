"use client";

// Poverty and income by group: one breakdown at a time, a dot plot of
// 2025-26 against the headline end year (poverty_by_group).

import { useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import { PALETTE, niceAxis } from "../../lib/baseline";
import { changeVerb, fyDash, formatPct, formatPounds, headlineYear } from "../../lib/outlook";

const MEASURES = {
  relative_ahc: {
    label: "Relative poverty (AHC)",
    pick: (c) => (c.relative_ahc == null ? null : c.relative_ahc * 100),
    format: (v) => formatPct(v),
    tick: (v) => `${v}%`,
    change: (a, b) => changeVerb(b - a, "pp"),
  },
  median_equivalised_income_bhc: {
    label: "Median income (BHC, real)",
    pick: (c) => c.median_equivalised_income_bhc?.real ?? null,
    format: (v) => formatPounds(v),
    tick: (v) => formatPounds(v),
    change: (a, b) => changeVerb(((b - a) / a) * 100, "%"),
  },
};

/** Group names as plural nouns for sentences ("highest among lone parents"). */
const PLURAL = {
  owned_outright: "outright owners",
  mortgage: "people with a mortgage",
  social_rent: "social renters",
  private_rent: "private renters",
  lone_parent: "lone parents",
  couple_with_children: "couples with children",
  single_no_children: "single people without children",
  couple_no_children: "couples without children",
  pensioner: "pensioner families",
  disabled_in_family: "families with a disability benefit recipient",
  no_disabled_in_family: "families without a disability benefit recipient",
};
const among = (breakdown, r) => (breakdown === "region" ? `in ${r.label}` : `among ${PLURAL[r.id] || r.label.toLowerCase()}`);
const forGroup = (breakdown, r) => (breakdown === "region" ? r.label : PLURAL[r.id] || r.label.toLowerCase());

export default function PovertyByGroupSection({ data }) {
  const pbg = data.poverty_by_group;
  const breakdownIds = Object.keys(pbg.breakdowns);
  const [breakdown, setBreakdown] = useState(breakdownIds.includes("family_type") ? "family_type" : breakdownIds[0]);
  const [measure, setMeasure] = useState("relative_ahc");
  const m = MEASURES[measure];
  const from = pbg.years[0];
  const to = pbg.years.includes(headlineYear(data)) ? headlineYear(data) : pbg.years[pbg.years.length - 1];
  const b = pbg.breakdowns[breakdown];

  const rows = Object.entries(b.groups)
    .map(([id, label]) => {
      const cells = b.cells[id] || {};
      const a = cells[from] && !cells[from].suppressed ? m.pick(cells[from]) : null;
      const z = cells[to] && !cells[to].suppressed ? m.pick(cells[to]) : null;
      return { id, label, a, z };
    })
    .filter((r) => r.a != null || r.z != null)
    .sort((x, y) => (y.z ?? y.a) - (x.z ?? x.a));
  const axis = niceAxis(Math.max(...rows.flatMap((r) => [r.a ?? 0, r.z ?? 0])));
  const max = axis.domain[1];
  const pos = (v) => `${(v / max) * 100}%`;

  const moved = rows
    .filter((r) => r.a != null && r.z != null)
    .map((r) => ({ ...r, d: measure === "relative_ahc" ? r.z - r.a : (r.z - r.a) / r.a }))
    .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))[0];
  const top = rows[0];

  return (
    <ChartCard
      title={`By ${b.label.toLowerCase()}`}
      description={`Relative poverty: share of people below 60% of current median income after housing costs. Median income is per person, adjusted for household size, in ${fyDash(data.meta.real_price_base)} prices. Family type is at benefit-unit level; a pensioner family has someone at or above State Pension age. Disability means someone in the family receives DLA, PIP or similar, narrower than HBAI's self-reported definition, and disability benefits count as income. Regions are single-year model estimates (HBAI uses three-year averages).`}
      summary={
        top && (
          <p className="chart-summary">
            {m.label.replace(/ \(.*\)/, "")} is highest {among(breakdown, top)}, at {m.format(top.z ?? top.a)} in{" "}
            {fyDash(to)}
            {moved && m.change(moved.a, moved.z) ? (
              <>
                ; the biggest change since {fyDash(from)} is for {forGroup(breakdown, moved)}, whose{" "}
                {measure === "relative_ahc" ? "rate" : "median income"} <strong>{m.change(moved.a, moved.z)}</strong>
              </>
            ) : null}
            .
          </p>
        )
      }
      controls={
        <>
          <Dropdown
            fieldLabel="Breakdown"
            label="Breakdown"
            value={breakdown}
            onChange={setBreakdown}
            options={breakdownIds.map((id) => ({ id, label: pbg.breakdowns[id].label }))}
          />
          <Dropdown
            fieldLabel="Measure"
            label="Measure"
            wide
            value={measure}
            onChange={setMeasure}
            options={Object.entries(MEASURES).map(([id, x]) => ({ id, label: x.label }))}
          />
        </>
      }
    >
      <div className="dot-plot" role="table" aria-label={`${m.label} by ${b.label.toLowerCase()}, ${fyDash(from)} and ${fyDash(to)}`}>
        <div className="dot-plot-legend" aria-hidden="true">
          <span>
            <i style={{ background: PALETTE.grey }} /> {fyDash(from)}
          </span>
          <span>
            <i style={{ background: PALETTE.teal }} /> {fyDash(to)}
          </span>
        </div>
        {rows.map((r) => {
          const lo = Math.min(r.a ?? r.z, r.z ?? r.a);
          const hi = Math.max(r.a ?? r.z, r.z ?? r.a);
          return (
            <div className="dot-row" role="row" key={r.id}>
              <span className="dot-label" role="rowheader">
                {r.label}
              </span>
              <span className="dot-track" role="cell" aria-label={`${fyDash(from)} ${r.a == null ? "n/a" : m.format(r.a)}, ${fyDash(to)} ${r.z == null ? "n/a" : m.format(r.z)}`}>
                <span className="dot-link" style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }} />
                {r.a != null && <span className="dot from" style={{ left: pos(r.a) }} title={`${fyDash(from)}: ${m.format(r.a)}`} />}
                {r.z != null && <span className="dot to" style={{ left: pos(r.z) }} title={`${fyDash(to)}: ${m.format(r.z)}`} />}
              </span>
              <span className="dot-value" role="cell">
                {r.z == null ? "–" : m.format(r.z)}
              </span>
            </div>
          );
        })}
        <div className="dot-row dot-axis" aria-hidden="true">
          <span className="dot-label" />
          <span className="dot-track">
            {axis.ticks.map((t) => (
              <span key={t} className="dot-tick" style={{ left: pos(t) }}>
                {m.tick(t)}
              </span>
            ))}
          </span>
          <span className="dot-value" />
        </div>
      </div>
    </ChartCard>
  );
}
