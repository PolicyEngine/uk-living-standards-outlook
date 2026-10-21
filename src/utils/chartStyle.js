// Shared chart styling for the line and bar charts: light horizontal grid, no
// y axis line, muted ticks, a quiet tooltip.

export const GRID = "#eceff1";
export const AXIS = "#cbd2d9";
export const TICK = { fontSize: 11, fill: "#6b7280" };

export const TOOLTIP_PROPS = {
  contentStyle: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "12px",
    boxShadow: "0 4px 12px rgba(17, 24, 39, 0.08)",
  },
  labelStyle: { fontWeight: 600, marginBottom: "2px", color: "#111827" },
  itemStyle: { padding: 0 },
};
