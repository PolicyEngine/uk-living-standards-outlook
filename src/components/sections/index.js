// Page layout registry. Each tab lists its rows in order; a row is either one
// full-width section or { grid: [...] } for AB26's two-up .charts-grid. Every
// section is a component in this folder that takes { data } (outlook.json).
// To add a section: write the component here and add it to a tab's rows.

import LivingStandardsSection from "./LivingStandardsSection";
import PovertySection from "./PovertySection";
import ForecastStatusSection from "./ForecastStatusSection";
import ForecastHeadlineSection from "./ForecastHeadlineSection";
import ForecastSeriesSection from "./ForecastSeriesSection";
import AboutDataSection from "./AboutDataSection";

export const TABS = [
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
    intro:
      "Projections of UK household incomes and poverty under current legislated policy: the baseline against which Autumn Budget 2026 measures are scored.",
    rows: [{ id: "living-poverty", grid: [LivingStandardsSection, PovertySection] }],
  },
  {
    id: "forecast",
    label: "Forecast changes",
    icon: <polyline points="3 17 9 11 13 15 21 7" />,
    intro:
      "The OBR economic forecast that drives the baseline, and how the Autumn Budget 2026 forecast revises it once published.",
    requires: "forecast",
    rows: [
      { id: "status", section: ForecastStatusSection },
      { id: "headline", section: ForecastHeadlineSection },
      { id: "series", section: ForecastSeriesSection },
    ],
  },
];

/** Shown under every tab. */
export const FOOTER_ROWS = [{ id: "about-data", section: AboutDataSection }];
