import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Customized } from "recharts";
import { PolicyEngineLogo } from "../utils/chartLogo";
import useElementWidth from "../hooks/useElementWidth";
import { yearAxisProps } from "../utils/yearAxis";
import { LEGEND_HEIGHT, NARROW } from "./LineSeriesChart";

/**
 * Bar chart in the same house style as LineSeriesChart (grid, ticks, axis
 * label, legend clear of the logo). Bars stack when `stacked`; with
 * `signColours` a single series is coloured by sign (gain / loss).
 *
 * series: [{ key, name, colour }]
 */
export default function BarSeriesChart({
  data,
  series,
  xKey = "year",
  xFormat = (v) => v,
  xLabel,
  yFormat = (v) => v,
  tooltipFormat = yFormat,
  yLabel,
  yDomain,
  yTicks,
  stacked = false,
  signColours = null,
  // Custom legend entries, e.g. gain/loss colours for signColours.
  legendPayload,
  height = 350,
}) {
  const [ref, width] = useElementWidth();
  const narrow = width > 0 && width < NARROW;
  const yAxisWidth = narrow ? 58 : 70;
  const margin = { top: 20, right: narrow ? 12 : 30, left: narrow ? 0 : 20, bottom: 10 };
  const xAxis = yearAxisProps({
    width,
    count: data.length,
    labels: data.map((d) => xFormat(d[xKey])),
    yAxisWidth,
    margin,
    narrow: narrow && xKey === "year",
  });

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      {width > 0 && (
        <BarChart width={width} height={height} data={data} margin={margin} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={xFormat}
            {...xAxis}
            label={
              xLabel
                ? { value: xLabel, position: "insideBottom", offset: -2, style: { fill: "#374151", fontSize: 12, fontWeight: 500 } }
                : undefined
            }
            // With an axis title, match the fiscal-year axis height so
            // paired cards keep their x axes level.
            height={xLabel ? Math.max(xAxis.height + 16, 50) : xAxis.height}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={yFormat}
            tick={{ fontSize: 11, fill: "#666" }}
            width={yAxisWidth}
            allowDecimals
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              dx: narrow ? 4 : -10,
              style: { textAnchor: "middle", fill: "#374151", fontSize: 12, fontWeight: 500 },
            }}
          />
          <ReferenceLine y={0} stroke="#9ca3af" />
          <Tooltip
            formatter={(value, name) => [tooltipFormat(value), name]}
            labelFormatter={xFormat}
            cursor={{ fill: "rgba(49, 151, 149, 0.06)" }}
            contentStyle={{
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
          />
          {(
            <Legend
              verticalAlign="bottom"
              align="center"
              // Reserve two legend lines on wide charts so paired cards keep
              // their x axes level whether a legend wraps or not.
              height={narrow ? undefined : LEGEND_HEIGHT}
              iconType="square"
              iconSize={12}
              payload={legendPayload}
              wrapperStyle={
                narrow
                  ? { paddingTop: "12px", paddingBottom: "26px" }
                  : { paddingTop: "15px", paddingRight: "100px" }
              }
              formatter={(value) => (
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>{value}</span>
              )}
            />
          )}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.colour}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={56}
              isAnimationActive={false}
            >
              {signColours &&
                data.map((d, i) => (
                  <Cell key={i} fill={(d[s.key] ?? 0) < 0 ? signColours.negative : signColours.positive} />
                ))}
            </Bar>
          ))}
          <Customized component={PolicyEngineLogo} />
        </BarChart>
      )}
    </div>
  );
}
