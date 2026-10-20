import { useRef } from "react";
import { CHART_LOGO } from "../utils/chartLogo";
import { exportChartAsSvg } from "../utils/exportChartAsSvg";
import "./ChartExport.css";

/**
 * Card with AB26's chart header (h2, description, SVG export button).
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
  className = "",
}) {
  const chartRef = useRef(null);

  const handleExport = async () => {
    await exportChartAsSvg(chartRef, exportOptions.filename, {
      title,
      description: typeof description === "string" ? description : "",
      legendItems: exportOptions.legendItems || [],
      logo: CHART_LOGO,
    });
  };

  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <div>
          <h2>{title}</h2>
          {description && <p className="chart-description">{description}</p>}
        </div>
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
      <div className="chart-slot chart-slot-footer">{footer}</div>
    </div>
  );
}
