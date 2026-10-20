"use client";

// Engine, dataset and source metadata plus the data notes, in AB26's
// "About selected policies" accordion (.policy-details-footer). Open by
// default so the caveats stay in view.

import { useState } from "react";
import { splitSource } from "../../lib/outlook";

export default function AboutDataSection({ data }) {
  const [open, setOpen] = useState(true);
  const meta = data.meta;
  if (!meta) return null;
  const source = splitSource(meta.outturn_source);
  const ds = meta.dataset || {};
  const generated = meta.generated_at ? new Date(meta.generated_at) : null;
  const notes = meta.notes || [];

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
        <div className="policy-details-content">
          <dl className="meta-list">
            <dt>Engine</dt>
            <dd>
              policyengine {meta.policyengine} (policyengine-uk {meta.policyengine_uk})
            </dd>
            <dt>Dataset</dt>
            <dd>
              {ds.name}
              {ds.tag ? ` @ ${ds.tag}` : ""}
              {ds.sha256 && ds.sha256 !== ds.tag ? (
                <>
                  {" "}
                  (sha256 <code>{String(ds.sha256).slice(0, 12)}</code>)
                </>
              ) : null}
            </dd>
            {meta.deflator && (
              <>
                <dt>Real terms</dt>
                <dd>
                  {meta.real_price_base} prices; {meta.deflator}
                </dd>
              </>
            )}
            <dt>Outturn source</dt>
            <dd>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}
                </a>
              ) : (
                source.label
              )}
            </dd>
            {generated && !Number.isNaN(generated.getTime()) && (
              <>
                <dt>Generated</dt>
                <dd>
                  {generated.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/London" })}
                </dd>
              </>
            )}
          </dl>
          <ul className="meta-notes">
            {!notes.some((n) => /unvalidated/i.test(n)) && (
              <li className="policy-detail">Projections are unvalidated under this engine version.</li>
            )}
            {notes.map((n) => (
              <li key={n} className="policy-detail">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
