import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ChartCard } from "@/components/chart-card";
import { BusinessInsightsPanel } from "@/components/business-insights-panel";
import { ChartSkeleton } from "@/components/states";
import { TrendChart } from "@/components/charts/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesTrend, salesTrendQuery, countriesQuery } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber, formatMonth } from "@/lib/format";

export const Route = createFileRoute("/sales")({
  validateSearch: (search: Record<string, unknown>) => ({
    year: typeof search.year === "string" ? search.year : "all",
  }),
  head: () => ({
    meta: [
      { title: "Sales Analytics · Sales Intelligence Platform" },
      { name: "description", content: "Analyze monthly revenue, orders, average order value, and quantity trends." },
      { property: "og:title", content: "Sales Analytics · Sales Intelligence Platform" },
      { property: "og:description", content: "Monthly revenue, orders, AOV, and quantity trends with filters." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(salesTrendQuery);
    context.queryClient.ensureQueryData(countriesQuery);
  },
  component: SalesAnalytics,
});

function SalesAnalytics() {
  const { year } = Route.useSearch();
  const navigate = Route.useNavigate();
  const trend = useSalesTrend();
  

  const years = useMemo(() => {
    if (!trend.data) return [];
    return Array.from(new Set(trend.data.map((d) => d.sales_year))).sort();
  }, [trend.data]);

  const filtered = useMemo(() => {
    if (!trend.data) return [];
    return year === "all" ? trend.data : trend.data.filter((d) => String(d.sales_year) === year);
  }, [trend.data, year]);

  const totals = useMemo(() => {
    const rev = filtered.reduce((s, d) => s + d.revenue, 0);
    const orders = filtered.reduce((s, d) => s + d.orders, 0);
    const qty = filtered.reduce((s, d) => s + d.quantity_sold, 0);
    return { rev, orders, qty, aov: orders ? rev / orders : 0 };
  }, [filtered]);

  const businessInsights = useMemo(() => {
    if (filtered.length === 0) return [];
    const peak = [...filtered].sort((a, b) => b.revenue - a.revenue)[0];
    const out = [
      `For ${year === "all" ? "the full period" : year}, total revenue reached ${formatCurrency(totals.rev)} across ${formatNumber(totals.orders)} orders.`,
      `Peak month was ${formatMonth(peak.sales_month)} with ${formatCurrency(peak.revenue)} in revenue.`,
      `The average order value over this selection is ${formatCurrency(totals.aov)}.`,
    ];
    if (filtered.length > 1) {
      const first = filtered[0].revenue;
      const last = filtered[filtered.length - 1].revenue;
      const change = first ? ((last - first) / first) * 100 : 0;
      out.push(`Revenue ${change >= 0 ? "grew" : "declined"} ${Math.abs(change).toFixed(1)}% from the first to the last month in view.`);
    }
    return out;
  }, [filtered, totals, year]);

  const loading = trend.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="Deep-dive into sales performance trends over time."
        actions={
          <Select value={year} onValueChange={(v) => navigate({ search: { year: v } })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Monthly Revenue Trend" description="Revenue generated each month">
              <TrendChart data={filtered} xKey="sales_month" series={[{ key: "revenue", name: "Revenue" }]} xTickFormatter={formatMonth} valueFormatter={(v) => formatCurrency(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Orders Trend" description="Number of orders per month">
              <TrendChart data={filtered} xKey="sales_month" series={[{ key: "orders", name: "Orders", color: "var(--color-chart-2)" }]} type="line" xTickFormatter={formatMonth} valueFormatter={(v) => formatNumber(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Average Order Value Trend" description="Mean value per order over time">
              <TrendChart data={filtered} xKey="sales_month" series={[{ key: "average_order_value", name: "Avg Order Value", color: "var(--color-chart-4)" }]} type="line" xTickFormatter={formatMonth} valueFormatter={(v) => formatCurrency(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Quantity Sold Trend" description="Units sold per month">
              <TrendChart data={filtered} xKey="sales_month" series={[{ key: "quantity_sold", name: "Quantity", color: "var(--color-chart-3)" }]} xTickFormatter={formatMonth} valueFormatter={(v) => formatNumber(v, { compact: true })} />
            </ChartCard>
          </>
        )}
      </div>

      <BusinessInsightsPanel insights={businessInsights} loading={loading} />
    </div>
  );
}
