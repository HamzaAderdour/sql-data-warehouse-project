export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

export const AXIS_COLOR = "var(--color-muted-foreground)";
export const GRID_COLOR = "var(--color-border)";

export const axisProps = {
  stroke: AXIS_COLOR,
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;
