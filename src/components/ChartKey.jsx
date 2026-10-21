/**
 * The row above a chart: the y-axis unit on the left (instead of a rotated
 * axis title) and, when the chart needs one, a key on the right. Lines show
 * their dash pattern; bars a square swatch.
 *
 * items: [{ label, colour, dash?, type: "line" | "rect" }]
 */
export default function ChartKey({ unit, items = [] }) {
  return (
    <div className="chart-key">
      <span className="chart-unit">{unit}</span>
      {items.length > 0 && (
        <ul className="chart-key-items">
          {items.map((it) => (
            <li key={it.label}>
              {it.type === "rect" ? (
                <i className="key-swatch" style={{ background: it.colour }} aria-hidden="true" />
              ) : (
                <svg width="22" height="10" aria-hidden="true">
                  <line x1="1" y1="5" x2="21" y2="5" stroke={it.colour} strokeWidth="2.5" strokeDasharray={it.dash} />
                </svg>
              )}
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
