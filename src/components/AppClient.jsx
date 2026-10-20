"use client";

// Shell ported from PolicyEngine/scottish-budget-2026-2027 src/app/AppClient.jsx
// (sticky title row, pill tab navigation, ?tab= URL sync).

import { useEffect, useState } from "react";
import BaselineTab from "./BaselineTab";
import ForecastTab from "./ForecastTab";
import Footer from "./Footer";
import { loadOutlook } from "../lib/outlook";

const TABS = [
  {
    id: "baseline",
    label: "Baseline outlook",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </>
    ),
  },
  {
    id: "forecast",
    label: "Forecast changes",
    icon: <polyline points="3 17 9 11 13 15 21 7" />,
  },
];

export default function AppClient() {
  const [activeTab, setActiveTab] = useState("baseline");
  const [state, setState] = useState({ loading: true, data: null, isSample: false, error: null });

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some((t) => t.id === tab)) setActiveTab(tab);
    loadOutlook().then((r) => setState({ loading: false, ...r }));
  }, []);

  const selectTab = (id) => {
    setActiveTab(id);
    const params = new URLSearchParams(window.location.search);
    if (id === "baseline") params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  };

  const { loading, data, isSample, error } = state;

  return (
    <div className="app">
      <header className="title-row">
        <div className="title-row-inner">
          <h1>UK living standards outlook</h1>
        </div>
      </header>
      <main className="main-content">
        {isSample && (
          <div className="sample-banner" role="alert">
            <strong>Sample data.</strong> public/data/outlook.json was not found, so every number
            on this page is a placeholder from outlook.sample.json, not PolicyEngine output.
          </div>
        )}

        <p className="app-intro">
          A demo of the{" "}
          <a href="https://policyengine.org" target="_blank" rel="noopener noreferrer">
            PolicyEngine
          </a>{" "}
          baseline for the Autumn Budget 2026: projected household incomes and poverty under
          current policy, and the OBR economic forecast that drives them.
        </p>

        <div className="tab-navigation" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => selectTab(tab.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {tab.icon}
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading outlook data...</p>
          </div>
        )}
        {error && <div className="data-message">Could not load outlook data: {error}</div>}

        {data && (activeTab === "baseline" ? <BaselineTab data={data} /> : <ForecastTab data={data} />)}

        {data && <Footer meta={data.meta} />}
      </main>
    </div>
  );
}
