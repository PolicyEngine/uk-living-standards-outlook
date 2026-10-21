// X-axis props for year ticks, shared by the line and bar charts. Labels are
// never rotated: when they would collide, every other (or every third) label
// is shown instead. Line charts put the first and last points on the plot
// edges, so the chart's right margin must leave room for half the last label
// (`edgeRoom`); without it "2029–30" is cut to "2029–3" on phones.

export const labelWidthOf = (labels) => Math.max(1, ...labels.map((l) => String(l).length)) * 6.4 + 8;

export function yearAxisProps({ width, count, labels, yAxisWidth, margin, values }) {
  const plotWidth = Math.max(0, width - yAxisWidth - margin.left - margin.right);
  const perTick = count > 1 ? plotWidth / (count - 1) : plotWidth;
  const labelWidth = labelWidthOf(labels);
  let interval = 0;
  while (perTick * (interval + 1) < labelWidth && interval < count) interval += 1;
  // Count the skipped labels back from the end, so the last year always shows.
  const ticks = values && interval > 0 ? values.filter((_, i) => (count - 1 - i) % (interval + 1) === 0) : undefined;
  return {
    interval: ticks ? 0 : interval,
    ticks,
    height: 26,
    tickMargin: 8,
    tickLine: false,
    tick: { fontSize: 11, fill: "#6b7280" },
  };
}

/** Right margin that keeps a centred end label inside the chart. */
export const edgeRoom = (labels) => Math.ceil(labelWidthOf(labels) / 2) + 2;
