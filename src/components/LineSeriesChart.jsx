import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, Customized } from "recharts";
import useElementWidth from "../hooks/useElementWidth";
import { edgeRoom, yearAxisProps } from "../utils/yearAxis";
import { AXIS, GRID, TICK, TOOLTIP_PROPS } from "../utils/chartStyle";
import { measureTextWidth } from "../utils/textMeasure";
import ChartKey from "./ChartKey";

/** Below this width charts use the tighter phone layout. */
export const NARROW = 520;

/**
 * Line chart. The y-axis unit sits above the plot (ChartKey), not rotated
 * beside it. With one or two lines that carry a short `label`, each line is
 * labelled at its end instead of in a key; three or more lines get a key.
 * `projectionFrom` (an x value) shades the projection years and labels them.
 *
 * series: [{ key, name, label?, colour, dashed?, dash?, hidden? }]. `dash`
 * is an SVG dash pattern (see DASH in lib/baseline); `dashed` alone means
 * "8 4". Lines on one chart differ in pattern as well as colour.
 */
export const dashOf = (s) => s.dash ?? (s.dashed ? "8 4" : undefined);

const LABEL_FONT = 11.5;

/** End-of-line labels, nudged apart when two would overlap. */
function EndLabels({ xAxisMap, yAxisMap, data, lines, xKey }) {
  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
  if (!xAxis || !yAxis) return null;
  const labels = lines
    .map((s) => {
      const pts = data.filter((d) => d[s.key] != null);
      const last = pts[pts.length - 1];
      if (!last) return null;
      const prev = pts[pts.length - 2];
      const x = xAxis.scale(last[xKey]);
      const y = yAxis.scale(last[s.key]);
      const w = measureTextWidth(s.label, { fontSize: LABEL_FONT, fontWeight: "600", fontFamily: "Inter, sans-serif" });
      // Right-aligned to the end point; left-aligned if it would run off the plot.
      const anchor = x - w < xAxis.x ? "start" : "end";
      const left = anchor === "end" ? x - w : x;
      // Put the label on the open side of the line: under it when the line
      // comes down into its end point, above it otherwise.
      const py = prev ? yAxis.scale(prev[s.key]) : y;
      const falling = py < y - 1;
      // Where the last segment is under the label's far edge, so the label
      // clears the line along its whole width, not just at the end point.
      const px = prev ? xAxis.scale(prev[xKey]) : x;
      const edge = anchor === "end" ? left : left + w;
      const t = px === x ? 0 : Math.min(1, Math.max(0, (x - edge) / (x - px)));
      const yEdge = y + (py - y) * t;
      return { ...s, x, y, falling, top: Math.min(y, yEdge), bottom: Math.max(y, yEdge), left, right: left + w, anchor };
    })
    .filter(Boolean)
    .sort((a, b) => a.y - b.y);
  const above = (l) => l.top - 8;
  const below = (l) => l.bottom + 16;
  labels.forEach((l) => (l.ty = l.falling ? below(l) : above(l)));
  // Two labels that share horizontal space: the higher line's label goes
  // above it and the lower line's below it, so neither sits on the other line.
  for (let i = 1; i < labels.length; i += 1) {
    const a = labels[i - 1];
    const b = labels[i];
    if (a.left < b.right && b.left < a.right) {
      a.ty = above(a);
      b.ty = Math.max(below(b), a.ty + 15);
    }
  }
  return (
    <g className="end-labels">
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.ty}
          textAnchor={l.anchor}
          fontSize={LABEL_FONT}
          fontWeight={600}
          fill={l.textColour || l.colour}
          stroke="white"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {l.label}
        </text>
      ))}
    </g>
  );
}

export default function LineSeriesChart({
  data,
  series,
  xKey = "year",
  xFormat = (v) => v,
  yFormat = (v) => v,
  tooltipFormat = yFormat,
  yLabel,
  yDomain,
  yTicks,
  projectionFrom,
  projectionLabel = "Projection",
  height = 300,
}) {
  const [ref, width] = useElementWidth();
  const narrow = width > 0 && width < NARROW;
  const visible = series.filter((s) => !s.hidden);
  const direct = visible.length <= 2 && visible.every((s) => s.label);
  const labels = data.map((d) => xFormat(d[xKey]));

  const yAxisWidth = narrow ? 44 : 52;
  const margin = { top: 22, right: edgeRoom(labels), left: 0, bottom: 4 };
  const xAxis = yearAxisProps({ width, count: data.length, labels, yAxisWidth, margin });
  const last = data.length ? data[data.length - 1][xKey] : null;
  const shade = projectionFrom != null && last != null && projectionFrom !== last;

  return (
    <div className="chart-frame">
      <ChartKey
        unit={yLabel}
        items={
          direct
            ? []
            : visible.map((s) => ({ label: s.name, colour: s.colour, dash: dashOf(s), type: "line" }))
        }
      />
      <div ref={ref} style={{ width: "100%", height }}>
        {width > 0 && (
          <LineChart width={width} height={height} data={data} margin={margin}>
            {shade && (
              <ReferenceArea
                x1={projectionFrom}
                x2={last}
                fill="#319795"
                fillOpacity={0.05}
                stroke="none"
                ifOverflow="hidden"
                label={{
                  value: projectionLabel,
                  position: "insideTopLeft",
                  offset: 6,
                  style: { fontSize: 10.5, fill: "#5f7f80", fontWeight: 600, letterSpacing: "0.04em" },
                }}
              />
            )}
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey={xKey} tickFormatter={xFormat} stroke={AXIS} {...xAxis} />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={yFormat}
              tick={TICK}
              axisLine={false}
              tickLine={false}
              width={yAxisWidth}
              allowDecimals
            />
            <Tooltip
              formatter={(value, name) => [tooltipFormat(value), name]}
              labelFormatter={xFormat}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              {...TOOLTIP_PROPS}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.colour}
                strokeWidth={2.5}
                strokeDasharray={dashOf(s)}
                dot={{ r: 2.5, fill: s.colour, stroke: s.colour, strokeWidth: 1 }}
                activeDot={{ r: 4.5, stroke: "white", strokeWidth: 2 }}
                connectNulls={false}
                hide={s.hidden}
                // Recharts 2's draw-in animation intermittently left lines
                // undrawn after a data change in the static export; off.
                isAnimationActive={false}
              />
            ))}
            {direct && <Customized component={(p) => <EndLabels {...p} data={data} lines={visible} xKey={xKey} />} />}
          </LineChart>
        )}
      </div>
    </div>
  );
}
