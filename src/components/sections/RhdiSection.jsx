"use client";

// OBR real household disposable income per person (obr_rhdi): outturn solid,
// OBR forecast dashed. A national-accounts measure, not comparable in level
// with the survey-based HBAI incomes on the Baseline tab.

import { useMemo } from "react";
import ChartCard from "../ChartCard";
import LineSeriesChart from "../LineSeriesChart";
import { PALETTE, rangeAxis } from "../../lib/baseline";
import { changeVerb, fyDash, fyLabel, fyStart, formatPounds } from "../../lib/outlook";
import { ObrSource } from "../../lib/sources";

export default function RhdiSection({ data }) {
  const r = data.obr_rhdi;
  const rows = useMemo(() => {
    const s = r?.series || [];
    const lastOutturn = s.filter((d) => d.type === "outturn").slice(-1)[0];
    return s.map((d) => ({
      year: fyStart(d.year),
      outturn: d.type === "outturn" ? d.value : null,
      // Start the dashed line at the last outturn year so the two join.
      forecast: d.type !== "outturn" || d === lastOutturn ? d.value : null,
    }));
  }, [r]);
  if (!r || !rows.length) return null;

  const fc = r.series.filter((d) => d.type !== "outturn");
  const a = fc[0];
  const b = fc[fc.length - 1];
  const verb = a && b ? changeVerb(((b.value - a.value) / a.value) * 100, "%") : null;
  const axis = rangeAxis(rows.flatMap((d) => [d.outturn, d.forecast]), { pad: 0.3 });
  const series = [
    { key: "outturn", name: "Outturn (ONS)", colour: PALETTE.grey },
    { key: "forecast", name: "OBR March 2026 forecast", colour: PALETTE.teal, dashed: true },
  ];

  return (
    <ChartCard
      title="Real household disposable income per person (OBR)"
      description={`${r.definition}; ${r.unit}. Includes non-profit institutions and imputed income.`}
      summary={
        a &&
        b && (
          <p className="chart-summary">
            Real household disposable income per person <strong>{verb || "stays flat"}</strong> in the OBR
            forecast, from {formatPounds(a.value)} in {fyDash(a.year)} to{" "}
            {formatPounds(b.value)} by {fyDash(b.year)} (national accounts, not comparable in level with the
            Baseline tab).
          </p>
        )
      }
      source={<ObrSource />}
      exportOptions={{
        filename: "obr-rhdi-per-person",
        legendItems: series.map((s) => ({ color: s.colour, label: s.name, type: "line" })),
      }}
    >
      <LineSeriesChart
        data={rows}
        series={series}
        xFormat={fyLabel}
        yFormat={formatPounds}
        tooltipFormat={formatPounds}
        yLabel="£ per person, 2023 prices"
        yDomain={axis.domain}
        yTicks={axis.ticks}
      />
    </ChartCard>
  );
}

// Rendered only when outlook.json has this block (App.jsx Row).
RhdiSection.requires = "obr_rhdi";
