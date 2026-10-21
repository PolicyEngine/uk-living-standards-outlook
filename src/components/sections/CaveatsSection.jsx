"use client";

// Projection caveats and known baseline gaps (meta.caveats), as a visible
// list at the end of the Baseline tab rather than inside the collapsed About
// panel: several change how the charts above read.

import { fyDash } from "../../lib/outlook";
import { plainWords } from "../../lib/sources";

export default function CaveatsSection({ data }) {
  const caveats = data.meta?.caveats || [];
  if (!caveats.length) return null;
  return (
    <div className="chart-card caveats-card">
      <ul className="meta-notes">
        {caveats.map((c) => (
          <li key={c}>{fyDash(plainWords(c))}</li>
        ))}
      </ul>
    </div>
  );
}
