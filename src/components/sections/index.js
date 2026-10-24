// Page layout registry. Each tab lists its rows in order; a row is either one
// full-width section or { blocks: [[A, B], [C]] }: two-up .charts-grid blocks
// whose cards share rows so they line up, or full-width ones. A row may carry
// a heading and one short line under it (foot). Every section is a component in
// this folder that takes { data } (outlook.json).
// To add a section: write the component here and add it to a tab's rows.

import LivingStandardsSection from "./LivingStandardsSection";
import PovertySection from "./PovertySection";
import DecileGrowthSection from "./DecileGrowthSection";
import NonPensionerSplitSection from "./NonPensionerSplitSection";
import ChildPovertyFamilySection from "./ChildPovertyFamilySection";
import InequalitySection from "./InequalitySection";
import DeepPovertySection from "./DeepPovertySection";
import PovertyByGroupSection from "./PovertyByGroupSection";
import ForecastHeadlineSection from "./ForecastHeadlineSection";
import ForecastSeriesSection from "./ForecastSeriesSection";
import RhdiSection from "./RhdiSection";
import AboutDataSection from "./AboutDataSection";
import CaveatsSection from "./CaveatsSection";

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
    intro: (data) => (
      <>
        Projections of UK household incomes and poverty under current legislated policy: the baseline against which
        Autumn Budget 2026 measures are scored. A demo of the{" "}
        <a href="https://policyengine.org" target="_blank" rel="noopener noreferrer">
          PolicyEngine
        </a>{" "}
        baseline for the Autumn Budget 2026. Pre-Budget baseline: OBR March 2026 forecast and policyengine-uk{" "}
        {data?.meta?.policyengine_uk || ""}. Budget measures are not modelled.
      </>
    ),
    rows: [
      {
        id: "incomes",
        heading: "Incomes",
        blocks: [
          [LivingStandardsSection, DecileGrowthSection],
          [NonPensionerSplitSection, InequalitySection],
        ],
        // Said once, under the first section whose charts stop there, and
        // under the cards that use CPI after housing costs.
        foot: (d) => [d.meta?.headline_end_year_note, d.meta?.cpi_ahc_note],
      },
      {
        id: "poverty",
        heading: "Poverty",
        blocks: [[PovertySection, DeepPovertySection], [PovertyByGroupSection]],
      },
      {
        id: "child-poverty",
        heading: "Child poverty",
        requires: "child_poverty_by_family",
        blocks: [[ChildPovertyFamilySection]],
      },
      {
        id: "caveats",
        heading: "What the baseline leaves out",
        section: CaveatsSection,
      },
    ],
  },
  {
    id: "forecast",
    label: "Forecast changes",
    icon: <polyline points="3 17 9 11 13 15 21 7" />,
    intro: (data) =>
      data?.forecast?.post_published
        ? `The OBR economic forecast behind the baseline. This compares the ${data.forecast.pre_label.replace(/\s*\(pre-Budget\)/, "")} forecast with the Autumn Budget 2026 forecast.`
        : "The OBR economic forecast behind the baseline. This shows the OBR March 2026 (pre-Budget) forecast; each chart will add the Autumn Budget 2026 forecast once the OBR publishes it on 28 October.",
    requires: "forecast",
    rows: [
      { id: "headline", section: ForecastHeadlineSection },
      { id: "series", spaced: true, section: ForecastSeriesSection },
      { id: "rhdi", heading: "Household income", requires: "obr_rhdi", section: RhdiSection },
    ],
  },
];

/** Shown under every tab. */
export const FOOTER_ROWS = [{ id: "about-data", section: AboutDataSection }];
