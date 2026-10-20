// X-axis props for year ticks, shared by the line and bar charts: every year
// when there is room, every other year on narrow charts, and rotated −40°
// when a straight label would collide with its neighbour.

export function yearAxisProps({ width, count, labels, yAxisWidth, margin, narrow }) {
  const plotWidth = Math.max(0, width - yAxisWidth - margin.left - margin.right);
  const perTick = count ? plotWidth / count : plotWidth;
  const longest = Math.max(1, ...labels.map((l) => String(l).length));
  const labelWidth = longest * 6.6 + 10;
  const interval = narrow && count > 6 ? 1 : 0;
  const rotate = perTick * (interval + 1) < labelWidth;
  return {
    interval,
    angle: rotate ? -40 : 0,
    textAnchor: rotate ? "end" : "middle",
    // Fiscal-year axes ("2025–26") always reserve the rotated height, so
    // two-up cards' x axes sit at the same height whether or not they rotate.
    height: longest >= 7 || rotate ? Math.ceil(Math.max(longest, 7) * 6.6 * 0.64 + 20) : 30,
    tickMargin: rotate ? 4 : 6,
    tick: { fontSize: 11, fill: "#666" },
  };
}
