"use client";

// Page shell mirrors PolicyEngine/uk-autumn-budget-dashboard-2026 src/App.jsx:
// .app > .main-content > sticky .title-row, pill .tab-navigation,
// .dashboard-intro, then the tab's sections. ?tab= keeps the tab in the URL.

import { useEffect, useState } from "react";
import { TABS, FOOTER_ROWS } from "./components/sections";
import { loadOutlook } from "./lib/outlook";

function Row({ row, data }) {
  if (row.grid) {
    return (
      <div className="charts-grid dashboard-section">
        {row.grid.map((Section, i) => (
          <Section key={i} data={data} />
        ))}
      </div>
    );
  }
  const Section = row.section;
  return (
    <div className="dashboard-section">
      <Section data={data} />
    </div>
  );
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
      <main className="main-content">
        <div className="title-row">
          <h1>UK living standards outlook</h1>
        </div>

        <div className="tab-navigation" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`tab-button ${activeTab === t.id ? "active" : ""}`}
              onClick={() => handleTabChange(t.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {t.icon}
              </svg>
              {t.label}
            </button>
          ))}
        </div>

        {isSample && (
          <div className="page-notice warning" role="alert">
            <strong>Sample data.</strong> public/data/outlook.json was not found, so every number on this
            page is a placeholder from outlook.sample.json, not PolicyEngine output.
          </div>
        )}

        <p className="dashboard-intro">
          {tab.intro} A demo of the{" "}
          <a href="https://policyengine.org" target="_blank" rel="noopener noreferrer">
            PolicyEngine
          </a>{" "}
          baseline for the Autumn Budget 2026.
        </p>

        {loading && <p className="dashboard-loading">Loading outlook data…</p>}
        {error && <div className="page-notice warning">Could not load outlook data: {error}</div>}
        {missing && <div className="page-notice warning">This tab's data is not in outlook.json.</div>}

        {data && !missing && (
          <div className="results-container" key={tab.id}>
            {tab.rows.map((row) => (
              <Row key={row.id} row={row} data={data} />
            ))}
          </div>
        )}

        {data && FOOTER_ROWS.map((row) => <Row key={row.id} row={row} data={data} />)}
      </main>
    </div>
  );
}
