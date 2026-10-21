"use client";

// Page shell: a compact header (title and tabs), the tab's standfirst, the
// headline strip (Baseline tab), a sticky in-page section nav, then the
// tab's sections. ?tab= keeps the tab in the URL.

import { useEffect, useState } from "react";
import { TABS, FOOTER_ROWS } from "./components/sections";
import { sectionId } from "./components/sections/ForecastSeriesSection";
import HeadlineStrip from "./components/HeadlineStrip";
import SectionNav from "./components/SectionNav";
import { fyDash, loadOutlook } from "./lib/outlook";
import { Note } from "./lib/sources";

function Row({ row, data }) {
  if (row.requires && !data[row.requires]) return null;
  // foot: one note or a list of notes, each said once under the row.
  const foot = [].concat(row.foot ? row.foot(data) : []).filter(Boolean);
  // blocks: each is [A, B] (two-up, rows shared so the cards line up) or [A]
  // (full width). A plain { section } row is one full-width block.
  // Cards whose outlook.json block is missing (e.g. the sample file) are
  // skipped; a pair with one card left renders it full width.
  const blocks = (row.blocks || [[row.section]])
    .map((block) => block.filter((S) => !S.requires || data[S.requires]))
    .filter((block) => block.length);
  if (!blocks.length) return null;
  return (
    <section id={row.id} className={`dashboard-section${row.heading || row.spaced ? " has-heading" : ""}`}>
      {row.heading && <h2 className="section-heading">{row.heading}</h2>}
      {blocks.map((block, i) =>
        block.length > 1 ? (
          <div className="charts-grid section-block" key={i}>
            {block.map((S, j) => (
              <S key={j} data={data} />
            ))}
          </div>
        ) : (
          <div className="section-block" key={i}>
            {(() => {
              const S = block[0];
              return <S data={data} />;
            })()}
          </div>
        ),
      )}
      {foot.map((f) => (
        <Note key={f}>{fyDash(f)}</Note>
      ))}
    </section>
  );
}

/** Section-nav entries for a tab: each headed row, and each forecast section. */
function navItems(tab, data) {
  if (!data) return [];
  return tab.rows.flatMap((row) => {
    if (row.requires && !data[row.requires]) return [];
    if (row.id === "series" && data.forecast)
      return data.forecast.sections.map((s) => ({ id: sectionId(s.title), label: s.title }));
    return row.heading ? [{ id: row.id, label: row.heading }] : [];
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [state, setState] = useState({ loading: true, data: null, isSample: false, error: null });

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some((t) => t.id === tab)) setActiveTab(tab);
    loadOutlook().then((r) => setState({ loading: false, ...r }));
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    const params = new URLSearchParams(window.location.search);
    if (id === TABS[0].id) params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  };

  const { loading, data, isSample, error } = state;
  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const missing = data && tab.requires && !data[tab.requires];

  return (
    <div className="app">
      <header className="page-header">
        <div className="page-inner">
          <h1>UK living standards outlook</h1>
          <div className="tab-navigation" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                className={`tab-button ${activeTab === t.id ? "active" : ""}`}
                onClick={() => handleTabChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="main-content">
        {isSample && (
          <div className="page-notice warning" role="alert">
            <strong>Sample data.</strong> public/data/outlook.json was not found, so every number on this
            page is a placeholder from outlook.sample.json, not PolicyEngine output.
          </div>
        )}

        <p className="dashboard-intro">{tab.intro(data)}</p>

        {data && !missing && tab.id === "baseline" && <HeadlineStrip data={data} />}
        {data && !missing && tab.rows.filter((r) => r.lead).map((row) => <Row key={row.id} row={row} data={data} />)}
        {data && !missing && <SectionNav key={tab.id} items={navItems(tab, data)} />}

        {loading && <p className="dashboard-loading">Loading outlook data…</p>}
        {error && <div className="page-notice warning">Could not load outlook data: {error}</div>}
        {missing && <div className="page-notice warning">This tab's data is not in outlook.json.</div>}

        {data && !missing && (
          <div className="results-container" key={tab.id}>
            {tab.rows.filter((r) => !r.lead).map((row) => (
              <Row key={row.id} row={row} data={data} />
            ))}
          </div>
        )}

        {data && FOOTER_ROWS.map((row) => <Row key={row.id} row={row} data={data} />)}
      </main>
    </div>
  );
}
