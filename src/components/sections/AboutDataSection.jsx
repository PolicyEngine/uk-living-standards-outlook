"use client";

// "About this data": AB26's "About selected policies" accordion
// (.policy-details-footer), collapsed by default. Open, it shows a compact
// key-value block (model, data, prices, sources) and the notes as a short
// list; notes longer than NOTE_LIMIT are cut, with the full text in a nested
// "Technical notes" disclosure.

import { useState } from "react";
import { fyDash, splitSource } from "../../lib/outlook";

const NOTE_LIMIT = 160;
const OBR_EFO_URL = "https://obr.uk/economic-and-fiscal-outlooks/";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "microcosm-uk-2024-25-national-20261019T083323Z-6cba5d71" -> "Microcosm UK national, 19 Oct 2026, 6cba5d71". */
function describeDataset(ds) {
  const tag = ds.tag || "";
  const name = /^microcosm[_-]uk/i.test(ds.name || tag) ? "Microcosm UK" : ds.name || tag;
  const parts = [/national/i.test(tag) ? `${name} national` : name];
  const m = tag.match(/(\d{4})(\d{2})(\d{2})T\d+Z-([0-9a-f]{6,})$/i);
  if (m) {
    parts.push(`${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`);
    parts.push(m[4].slice(0, 8));
  } else if (ds.sha256) {
    parts.push(String(ds.sha256).slice(0, 8));
  }
  return parts.join(", ");
}

/** HBAI source label -> "HBAI FYE 2025". */
function shortHbai(label) {
  const m = label.match(/Households Below Average Income.*?FYE \d{4} to (FYE \d{4})/i);
  return m ? `HBAI ${m[1]}` : label;
}

function shorten(note) {
  if (note.length <= NOTE_LIMIT) return note;
  const cut = note.slice(0, NOTE_LIMIT);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:(]+$/, "")}…`;
}

export default function AboutDataSection({ data }) {
  const [open, setOpen] = useState(false);
  const meta = data.meta;
  if (!meta) return null;
  const hbai = splitSource(meta.outturn_source);
  const ds = meta.dataset || {};
  const efo =
    (meta.deflator || "").match(/OBR EFO ([A-Z][a-z]+ \d{4})/) ||
    (data.forecast?.pre_label || "").match(/OBR ([A-Z][a-z]+ \d{4})/);
  const deflatorText = meta.deflator || "";
  const deflator = /consumer_price_index_ahc|CPI after housing costs/i.test(deflatorText)
    ? "OBR CPI (BHC), CPI after housing costs (AHC)"
    : /OBR CPI/i.test(deflatorText)
      ? "OBR CPI"
      : null;
  const notes = [
    ...((meta.notes || []).some((n) => /unvalidated/i.test(n))
      ? []
      : ["Projections are unvalidated under this engine version."]),
    ...(meta.notes || []),
  ];
  const long = notes.filter((n) => n.length > NOTE_LIMIT);

  return (
    <div id="about-data" className="policy-details-footer">
      <button className="policy-details-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        About this data
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {open && (
        <div className="policy-details-content about-data">
          <dl className="meta-list">
            <dt>Model</dt>
            <dd>
              policyengine {meta.policyengine} / policyengine-uk {meta.policyengine_uk}
            </dd>
            <dt>Data</dt>
            <dd>{describeDataset(ds)}</dd>
            {meta.real_price_base && (
              <>
                <dt>Prices</dt>
                <dd>{[fyDash(meta.real_price_base), deflator].filter(Boolean).join(", ")}</dd>
              </>
            )}
            <dt>Sources</dt>
            <dd>
              {hbai.url ? (
                <a href={hbai.url} target="_blank" rel="noopener noreferrer" title={hbai.label}>
                  {shortHbai(hbai.label)}
                </a>
              ) : (
                shortHbai(hbai.label)
              )}
              {efo && (
                <>
                  {" · "}
                  <a href={OBR_EFO_URL} target="_blank" rel="noopener noreferrer">
                    OBR EFO {efo[1]}
                  </a>
                </>
              )}
            </dd>
          </dl>
          <ul className="meta-notes">
            {notes.map((n) => (
              <li key={n}>{fyDash(shorten(n))}</li>
            ))}
          </ul>
          {long.length > 0 && (
            <details className="technical-notes">
              <summary>Technical notes</summary>
              <ul className="meta-notes">
                {long.map((n) => (
                  <li key={n}>{fyDash(n)}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
