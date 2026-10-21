import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import useElementWidth from "../hooks/useElementWidth";
import { yearAxisProps } from "../utils/yearAxis";
import { AXIS, GRID, TICK, TOOLTIP_PROPS } from "../utils/chartStyle";
import ChartKey from "./ChartKey";
import { NARROW } from "./LineSeriesChart";

/**
 * Bar chart in the same style as LineSeriesChart: unit and key above the
 * plot, light horizontal grid. Bars stack when `stacked`; with `signColours`
 * a single series is coloured by sign.
 *
 * series: [{ key, name, colour }]
 * keyItems: [{ label, colour }] overrides the key (e.g. rise/fall colours).
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
  keyItems,
  height: plotHeight = 300,
}) {
  // An x-axis title adds its own height, so the plot itself stays as tall as
  // a line chart's beside it.
  const height = xLabel ? plotHeight + 16 : plotHeight;
  const [ref, width] = useElementWidth();
  const narrow = width > 0 && width < NARROW;
  const yAxisWidth = narrow ? 44 : 52;
  const margin = { top: 22, right: 8, left: 0, bottom: 4 };
  const xAxis = yearAxisProps({
    width,
    count: data.length,
    labels: data.map((d) => xFormat(d[xKey])),
    yAxisWidth,
    margin,
  });
  const items = (keyItems || series.map((s) => ({ label: s.name, colour: s.colour }))).map((k) => ({
    ...k,
    type: "rect",
  }));

  return (
    <div className="chart-frame">
      <ChartKey unit={yLabel} items={items} />
      <div ref={ref} style={{ width: "100%", height }}>
        {width > 0 && (
          <BarChart width={width} height={height} data={data} margin={margin} barCategoryGap="22%">
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey={xKey}
              tickFormatter={xFormat}
              stroke={AXIS}
              {...xAxis}
              interval={xKey === "year" ? xAxis.interval : 0}
              label={
                xLabel
                  ? { value: xLabel, position: "insideBottom", offset: -2, style: { fill: "#6b7280", fontSize: 11 } }
                  : undefined
              }
              height={xLabel ? 42 : xAxis.height}
            />
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
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Tooltip
              formatter={(value, name) => [tooltipFormat(value), name]}
              labelFormatter={xFormat}
              cursor={{ fill: "rgba(49, 151, 149, 0.06)" }}
              {...TOOLTIP_PROPS}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={s.colour}
                stackId={stacked ? "stack" : undefined}
                maxBarSize={48}
                isAnimationActive={false}
              >
                {signColours &&
                  data.map((d, i) => (
                    <Cell key={i} fill={(d[s.key] ?? 0) < 0 ? signColours.negative : signColours.positive} />
                  ))}
              </Bar>
            ))}
          </BarChart>
        )}
      </div>
    </div>
  );
}
