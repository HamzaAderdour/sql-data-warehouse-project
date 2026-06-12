import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Boxes,
  Receipt,
  UserRound,
  Globe2,
  Percent,
  CalendarRange,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartCard } from "@/components/chart-card";
import { BusinessInsightsPanel } from "@/components/business-insights-panel";
import { KpiCardSkeleton, ChartSkeleton } from "@/components/states";
import { TrendChart, RankedBarChart, DonutChart } from "@/components/charts/charts";
import { Card } from "@/components/ui/card";
import { useKpis, useInsights, useSalesTrend, useCountries, useMargins } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber, formatMonth, formatPercent } from "@/lib/format";
import { kpisQuery, insightsQuery, salesTrendQuery, countriesQuery, marginsQuery } from "@/hooks/use-sales-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Sales Intelligence Platform" },
      { name: "description", content: "Executive overview of revenue, orders, customers, and strategic business insights." },
      { property: "og:title", content: "Dashboard · Sales Intelligence Platform" },
      { property: "og:description", content: "Executive overview of revenue, orders, customers, and strategic insights." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(kpisQuery);
    context.queryClient.ensureQueryData(insightsQuery);
    context.queryClient.ensureQueryData(salesTrendQuery);
    context.queryClient.ensureQueryData(countriesQuery);
    context.queryClient.ensureQueryData(marginsQuery);
  },
  component: Dashboard,
});

function Dashboard() {
  const kpis = useKpis();
  const insights = useInsights();
  const trend = useSalesTrend();
  const countries = useCountries();
  const margins = useMargins();

  const categoryData = useMemo(() => {
    if (!margins.data) return [];
    const map = new Map<string, number>();
    for (const r of margins.data) map.set(r.category, (map.get(r.category) ?? 0) + r.revenue);
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [margins.data]);

  const topCountries = useMemo(
    () => (countries.data ? [...countries.data].sort((a, b) => b.revenue - a.revenue).slice(0, 6) : []),
    [countries.data],
  );

  const businessInsights = useMemo(() => {
    const out: string[] = [];
    if (kpis.data) {
      out.push(
        `The business has generated ${formatCurrency(kpis.data.total_revenue)} across ${formatNumber(kpis.data.total_orders)} orders, with an average order value of ${formatCurrency(kpis.data.average_order_value)}.`,
      );
    }
    if (insights.data) {
      out.push(
        `${insights.data.best_country} is the strongest market, delivering ${formatCurrency(insights.data.best_country_revenue_per_customer)} in revenue per customer.`,
      );
      out.push(
        `Revenue is highly concentrated: bikes account for ${formatPercent(insights.data.bikes_revenue_percentage)} of total revenue — a key dependency risk to monitor.`,
      );
      out.push(
        `${formatPercent(insights.data.one_time_customers_percentage)} of customers ordered only once, signalling a clear retention opportunity.`,
      );
    }
    return out;
  }, [kpis.data, insights.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Overview" description="How is the business performing? A real-time executive snapshot." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.isPending || !kpis.data ? (
          Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Total Revenue" value={formatCurrency(kpis.data.total_revenue, { compact: true })} icon={DollarSign} subtext="all time" accent="primary" />
            <KpiCard label="Total Orders" value={formatNumber(kpis.data.total_orders)} icon={ShoppingCart} subtext="orders placed" accent="chart-2" />
            <KpiCard label="Total Customers" value={formatNumber(kpis.data.total_customers)} icon={Users} subtext="unique buyers" accent="chart-3" />
            <KpiCard label="Sold Products" value={formatNumber(kpis.data.sold_products)} icon={Boxes} subtext="distinct products" accent="chart-4" />
            <KpiCard label="Avg Order Value" value={formatCurrency(kpis.data.average_order_value)} icon={Receipt} subtext="per order" accent="chart-6" />
            <KpiCard label="Revenue / Customer" value={formatCurrency(kpis.data.revenue_per_customer)} icon={UserRound} subtext="lifetime" accent="chart-5" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {trend.isPending ? (
          <ChartSkeleton className="lg:col-span-2" />
        ) : (
          <ChartCard title="Revenue Trend" description="Monthly revenue over time" className="lg:col-span-2">
            <TrendChart
              data={trend.data ?? []}
              xKey="sales_month"
              series={[{ key: "revenue", name: "Revenue" }]}
              xTickFormatter={formatMonth}
              valueFormatter={(v) => formatCurrency(v, { compact: true })}
            />
          </ChartCard>
        )}
        {margins.isPending ? (
          <ChartSkeleton />
        ) : (
          <ChartCard title="Revenue by Category" description="Share of revenue per product category">
            <DonutChart data={categoryData} valueFormatter={(v) => formatCurrency(v, { compact: true })} />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {countries.isPending ? (
          <ChartSkeleton className="lg:col-span-2" />
        ) : (
          <ChartCard title="Revenue by Country" description="Top performing markets" className="lg:col-span-2">
            <RankedBarChart
              data={topCountries.map((c) => ({ country: c.country, revenue: c.revenue }))}
              categoryKey="country"
              valueKey="revenue"
              colorByIndex
              valueFormatter={(v) => formatCurrency(v, { compact: true })}
            />
          </ChartCard>
        )}
        <BusinessInsightsPanel insights={businessInsights} loading={kpis.isPending || insights.isPending} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Strategic Insights</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.isPending || !insights.data ? (
            Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-28 animate-pulse" />)
          ) : (
            <>
              <StrategicCard icon={Globe2} label="Best Market" value={insights.data.best_country} sub={`${formatCurrency(insights.data.best_country_revenue_per_customer)} / customer`} />
              <StrategicCard icon={Percent} label="Highest Margin Category" value={insights.data.highest_margin_category} sub={`${formatPercent(insights.data.highest_margin_percentage)} margin`} />
              <StrategicCard icon={CalendarRange} label="Best Revenue Year" value={String(insights.data.best_revenue_year)} sub={formatCurrency(insights.data.best_year_revenue, { compact: true })} />
              <StrategicCard icon={ShieldAlert} label="Retention Risk" value={formatPercent(insights.data.one_time_customers_percentage)} sub="one-time customers" tone="risk" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StrategicCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "risk";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${tone === "risk" ? "text-destructive" : "text-primary"}`} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </Card>
  );
}
