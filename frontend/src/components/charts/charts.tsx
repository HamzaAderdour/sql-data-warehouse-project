import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisProps, CHART_COLORS, GRID_COLOR } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import { formatNumber } from "@/lib/format";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Datum = Record<string, any>;
type ValueFormatter = (v: number) => string;

const defaultFmt: ValueFormatter = (v) => formatNumber(v, { compact: true });

interface SeriesDef {
  key: string;
  name: string;
  color?: string;
}

interface TrendChartProps {
  data: Datum[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  valueFormatter?: ValueFormatter;
  xTickFormatter?: (v: string) => string;
  type?: "area" | "line";
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 300,
  valueFormatter = defaultFmt,
  xTickFormatter,
  type = "area",
}: TrendChartProps) {
  const ChartEl = type === "area" ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartEl data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} tickFormatter={xTickFormatter} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={(v) => valueFormatter(Number(v))} width={56} />
        <Tooltip content={<ChartTooltip formatter={(v) => valueFormatter(v)} labelFormatter={(l) => (xTickFormatter ? xTickFormatter(String(l)) : l)} />} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
        {series.map((s, i) =>
          type === "area" ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ),
        )}
      </ChartEl>
    </ResponsiveContainer>
  );
}

interface RankedBarChartProps {
  data: Datum[];
  categoryKey: string;
  valueKey: string;
  height?: number;
  valueFormatter?: ValueFormatter;
  color?: string;
  colorByIndex?: boolean;
}

export function RankedBarChart({
  data,
  categoryKey,
  valueKey,
  height = 300,
  valueFormatter = defaultFmt,
  color = CHART_COLORS[0],
  colorByIndex = false,
}: RankedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" {...axisProps} tickFormatter={(v) => valueFormatter(Number(v))} />
        <YAxis type="category" dataKey={categoryKey} {...axisProps} width={120} />
        <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} content={<ChartTooltip formatter={(v) => valueFormatter(v)} />} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} fill={color} name={valueKey}>
          {colorByIndex && data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface GroupedBarChartProps {
  data: Datum[];
  categoryKey: string;
  series: SeriesDef[];
  height?: number;
  valueFormatter?: ValueFormatter;
  stacked?: boolean;
}

export function GroupedBarChart({
  data,
  categoryKey,
  series,
  height = 300,
  valueFormatter = defaultFmt,
  stacked = false,
}: GroupedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={categoryKey} {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => valueFormatter(Number(v))} width={56} />
        <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} content={<ChartTooltip formatter={(v) => valueFormatter(v)} />} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
            fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
  valueFormatter?: ValueFormatter;
  innerRadius?: number;
}

export function DonutChart({ data, height = 300, valueFormatter = defaultFmt, innerRadius = 60 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={innerRadius + 40} paddingAngle={2} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={(v) => valueFormatter(v)} />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ParetoChartProps {
  data: Datum[];
  categoryKey: string;
  barKey: string;
  lineKey: string;
  height?: number;
  valueFormatter?: ValueFormatter;
}

export function ParetoChart({ data, categoryKey, barKey, lineKey, height = 340, valueFormatter = defaultFmt }: ParetoChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={categoryKey} {...axisProps} angle={-40} textAnchor="end" interval={0} height={60} />
        <YAxis yAxisId="left" {...axisProps} tickFormatter={(v) => valueFormatter(Number(v))} width={56} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={(v) => `${v}%`} domain={[0, 100]} width={44} />
        <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} content={<ChartTooltip formatter={(v, n) => (n.includes("Cumulative") ? `${v.toFixed(1)}%` : valueFormatter(v))} />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey={barKey} name="Revenue" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey={lineKey} name="Cumulative %" stroke={CHART_COLORS[4]} strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
