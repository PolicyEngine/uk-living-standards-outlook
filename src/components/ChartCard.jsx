import { useRef } from "react";
import { CHART_LOGO } from "../utils/chartLogo";
import { exportChartAsSvg } from "../utils/exportChartAsSvg";
import { fyDash } from "../lib/outlook";
import { Note, plainWords } from "../lib/sources";
import "./ChartExport.css";

/** Small ⓘ next to a card title; the definition shows on hover or focus. */
export function InfoTip({ text }) {
  if (!text) return null;
  return (
    <span className="info-tip" tabIndex={0} aria-label={text}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span className="info-tip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

/**
 * Card with AB26's chart header (h2, SVG export button). The description is
 * a definition shown in an ⓘ tooltip next to the title; the card's one block
 * of text is the dynamic summary sentence. Caveats that change how the chart
 * reads go in `notes` (strings from outlook.json or nodes), shown as visible
 * notes under the chart, never only in the tooltip.
 *
 * exportOptions: { filename, legendItems } shows the export button; the SVG
 * is taken from the Recharts chart inside the card body.
 */
export default function ChartCard({
  title,
  description,
  summary,
  controls,
  exportOptions,
  children,
  footer,
  notes,
  source,
  className = "",
}) {
  const chartRef = useRef(null);

  const handleExport = async () => {
    // The y-axis unit is drawn in HTML above the plot, so carry it into the
    // exported file's description.
    const unit = chartRef.current?.querySelector(".chart-unit")?.textContent;
    const text = typeof description === "string" ? description : "";
    await exportChartAsSvg(chartRef, exportOptions.filename, {
      title,
      description: unit ? `${text} Vertical axis: ${unit}.`.trim() : text,
      legendItems: exportOptions.legendItems || [],
      logo: CHART_LOGO,
    });
  };

  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <h3>
          {title}
          <InfoTip text={description} />
        </h3>
        {exportOptions && (
          <button
            className="export-button"
            onClick={handleExport}
            title="Download as SVG"
            aria-label="Download chart as SVG"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}
      </div>
      {/* Every slot always renders, so two-up cards share subgrid rows
          (header, summary, controls, chart, footer) and line up. */}
      <div className="chart-slot chart-slot-summary">{summary}</div>
      <div className="chart-slot chart-slot-controls">
        {controls && <div className="chart-controls">{controls}</div>}
      </div>
      <div ref={chartRef} className="chart-area">
        {children}
      </div>
      <div className="chart-slot chart-slot-footer">
        {footer}
        {(notes || []).filter(Boolean).map((n) => (
          <Note key={typeof n === "string" ? n : undefined}>{typeof n === "string" ? fyDash(plainWords(n)) : n}</Note>
        ))}
      </div>
      <div className="chart-slot chart-slot-source">{source && <p className="chart-source">{source}</p>}</div>
    </div>
  );
}
