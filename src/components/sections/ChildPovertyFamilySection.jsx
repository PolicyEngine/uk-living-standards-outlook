"use client";

// Child poverty by family: number of children (1 / 2 / 3+) or family type
// (lone parent / couple), against all children (child_poverty_by_family).

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import Dropdown from "../Dropdown";
import LineSeriesChart from "../LineSeriesChart";
import { PALETTE, joinSeries, niceAxis } from "../../lib/baseline";
import { fyDash, fyLabel, formatPct, formatPctAxis, headlineYear } from "../../lib/outlook";
import { PeSource } from "../../lib/sources";

const SPLITS = {
  children: {
    label: "Number of children",
    groups: [
      ["one_child", "1 child", PALETTE.light],
      ["two_children", "2 children", PALETTE.teal],
      ["three_plus_children", "3+ children", PALETTE.dark],
    ],
  },
  family: {
    label: "Family type",
    groups: [
      ["lone_parent", "Lone-parent", PALETTE.amber],
      ["couple", "Couple", PALETTE.teal],
    ],
  },
};

/** Group as it reads after "children in ...". */
const PHRASE = {
  one_child: "one-child families",
  two_children: "two-child families",
  three_plus_children: "families with three or more children",
  lone_parent: "lone-parent families",
  couple: "couple families",
};

export default function ChildPovertyFamilySection({ data }) {
  const cp = data.child_poverty_by_family;
  const measureIds = Object.keys(cp.measures);
  const [measure, setMeasure] = useState(measureIds[0]);
  const [split, setSplit] = useState("children");
  const groups = SPLITS[split].groups;
  const proj = cp.projection[measure] || {};

  const rows = useMemo(
    () =>
      joinSeries([
        ["all", proj.all, (d) => (d.rate == null ? null : d.rate * 100)],
        ...groups.map(([id]) => [id, proj[id], (d) => (d.rate == null ? null : d.rate * 100)]),
      ]),
    [proj, groups],
  );
  const axis = niceAxis(Math.max(...rows.flatMap((r) => groups.map(([id]) => r[id] ?? 0))));
  const series = [
    { key: "all", name: "All children", colour: PALETTE.grey, dashed: true },
    ...groups.map(([id, name, colour]) => ({ key: id, name, colour, dashed: true })),
  ];

  const end = headlineYear(data);
  const at = (id) => (proj[id] || []).find((r) => r.year === end) || (proj[id] || []).slice(-1)[0];
  const ranked = groups.map(([id, name]) => [name, at(id)?.rate, PHRASE[id]]).filter(([, v]) => v != null);
  ranked.sort((a, b) => b[1] - a[1]);
  const all = at("all");
  const kind = cp.measures[measure].replace(/\s*\(AHC\)/, "").toLowerCase();

  return (
    <ChartCard
      title="Child poverty by family"
      description="Share of children in households below the poverty line, after housing costs. Relative: 60% of current median income; absolute: a fixed real-terms line."
      summary={
        all &&
        ranked.length > 0 && (
          <p className="chart-summary">
            In {fyDash(all.year)}, {kind} child poverty (AHC) is highest for children in{" "}
            <strong>{ranked[0][2]}</strong> at {formatPct(ranked[0][1] * 100)}, against {formatPct(all.rate * 100)} for
            all children.
          </p>
        )
      }
      source={<PeSource />}
      exportOptions={{
        filename: `child-poverty-${split}-${measure}`,
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "line" })),
      }}
      controls={
        <>
          <Dropdown
            fieldLabel="Measure"
            label="Poverty measure"
            value={measure}
            onChange={setMeasure}
            options={measureIds.map((id) => ({ id, label: cp.measures[id] }))}
          />
          <Dropdown
            fieldLabel="Split by"
            label="Split by"
            value={split}
            onChange={setSplit}
            options={Object.entries(SPLITS).map(([id, s]) => ({ id, label: s.label }))}
          />
        </>
      }
    >
      <LineSeriesChart
        data={rows}
        series={series}
        xFormat={fyLabel}
        yFormat={formatPctAxis}
        tooltipFormat={formatPct}
        yLabel="Children in poverty (%)"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
ChildPovertyFamilySection.requires = "child_poverty_by_family";
