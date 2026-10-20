import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Customized,
} from "recharts";
import { PolicyEngineLogo } from "../utils/chartLogo";
import useElementWidth from "../hooks/useElementWidth";

/** Below this width the legend drops the logo gutter and sits above the logo. */
const NARROW = 520;

/**
 * Line chart in the AB26 house style (EmploymentIncomeChart /
 * BudgetaryImpactChart): grid 3 3 #e0e0e0, 11px #666 ticks, 12px/500 #374151
 * axis label, bottom legend clear of the PolicyEngine logo.
 *
 * series: [{ key, name, colour, dashed?, hidden? }]
 */
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
  height = 350,
}) {
  const [ref, width] = useElementWidth();
  const narrow = width > 0 && width < NARROW;
  const visible = series.filter((s) => !s.hidden);

  // Year ticks: every year when there is room; every other year on narrow
  // charts; rotated when a straight label would collide with its neighbour.
  const yAxisWidth = narrow ? 58 : 70;
  const margin = { top: 20, right: narrow ? 12 : 30, left: narrow ? 0 : 20, bottom: 10 };
  const plotWidth = Math.max(0, width - yAxisWidth - margin.left - margin.right);
  const perTick = data.length ? plotWidth / data.length : plotWidth;
  const longest = Math.max(1, ...data.map((d) => String(xFormat(d[xKey])).length));
  const labelWidth = longest * 6.6 + 10;
  const tickInterval = narrow && data.length > 6 ? 1 : 0;
  const rotate = perTick * (tickInterval + 1) < labelWidth;

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      {width > 0 && (
        <LineChart
          width={width}
          height={height}
          data={data}
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={xKey}
            tickFormatter={xFormat}
            tick={{ fontSize: 11, fill: "#666" }}
            interval={tickInterval}
            angle={rotate ? -40 : 0}
            textAnchor={rotate ? "end" : "middle"}
            height={rotate ? Math.ceil(longest * 6.6 * 0.64 + 20) : 30}
            tickMargin={rotate ? 4 : 6}
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
              style: {
                textAnchor: "middle",
                fill: "#374151",
                fontSize: 12,
                fontWeight: 500,
              },
            }}
          />
          <Tooltip
            formatter={(value, name) => [tooltipFormat(value), name]}
            labelFormatter={xFormat}
            contentStyle={{
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="line"
            iconSize={18}
            wrapperStyle={
              narrow
                ? { paddingTop: "12px", paddingBottom: "26px" }
                : { paddingTop: "15px", paddingRight: "140px" }
            }
            payload={visible.map((s) => ({
              value: s.name,
              type: "line",
              color: s.colour,
              payload: { strokeDasharray: s.dashed ? "8 4" : "0" },
            }))}
            formatter={(value) => (
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{value}</span>
            )}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.colour}
              strokeWidth={3}
              strokeDasharray={s.dashed ? "8 4" : undefined}
              dot={{ r: 3, fill: s.colour, stroke: s.colour, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              hide={s.hidden}
              // Recharts 2's draw-in animation intermittently left lines
              // undrawn after a data change in the static export; off.
              isAnimationActive={false}
            />
          ))}
          <Customized component={PolicyEngineLogo} />
        </LineChart>
      )}
    </div>
  );
}
