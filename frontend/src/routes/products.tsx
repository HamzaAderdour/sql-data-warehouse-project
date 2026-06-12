import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ChartCard } from "@/components/chart-card";
import { BusinessInsightsPanel } from "@/components/business-insights-panel";
import { ChartSkeleton } from "@/components/states";
import { GroupedBarChart, RankedBarChart, ParetoChart } from "@/components/charts/charts";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMargins, usePareto, marginsQuery, paretoQuery } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Intelligence · Sales Intelligence Platform" },
      { name: "description", content: "Product profitability, margin analysis, and Pareto 80/20 revenue concentration." },
      { property: "og:title", content: "Product Intelligence · Sales Intelligence Platform" },
      { property: "og:description", content: "Margin analysis and Pareto 80/20 revenue concentration." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(marginsQuery);
    context.queryClient.ensureQueryData(paretoQuery);
  },
  component: Products,
});

function Products() {
  const margins = useMargins();
  const pareto = usePareto();

  const byCategory = useMemo(() => {
    if (!margins.data) return [];
    const map = new Map<string, { revenue: number; margin: number }>();
    for (const r of margins.data) {
      const cur = map.get(r.category) ?? { revenue: 0, margin: 0 };
      cur.revenue += r.revenue;
      cur.margin += r.estimated_margin;
      map.set(r.category, cur);
    }
    return Array.from(map, ([category, v]) => ({ category, revenue: v.revenue, margin: v.margin })).sort((a, b) => b.revenue - a.revenue);
  }, [margins.data]);

  const bySubcategory = useMemo(
    () => (margins.data ? [...margins.data].sort((a, b) => b.margin_percentage - a.margin_percentage).map((r) => ({ name: r.subcategory, value: r.margin_percentage })) : []),
    [margins.data],
  );

  const top20Pct = useMemo(() => {
    if (!pareto.data || pareto.data.length === 0) return 0;
    const count = Math.max(1, Math.ceil(pareto.data.length * 0.2));
    const sorted = [...pareto.data].sort((a, b) => a.product_rank - b.product_rank);
    return sorted.slice(0, count).reduce((s, p) => s + p.revenue_percentage, 0);
  }, [pareto.data]);

  const businessInsights = useMemo(() => {
    const out: string[] = [];
    if (pareto.data && pareto.data.length) {
      out.push(`The top 20% of products generate ${formatPercent(top20Pct)} of total revenue — a textbook Pareto concentration.`);
      out.push(`${pareto.data[0].product_name} is the single best-selling product, contributing ${formatPercent(pareto.data[0].revenue_percentage)} of revenue.`);
    }
    if (byCategory.length) {
      const topMarginSub = bySubcategory[0];
      if (topMarginSub) out.push(`${topMarginSub.name} has the highest margin rate at ${formatPercent(topMarginSub.value)}, making it a profitability priority.`);
      out.push(`Revenue is led by the ${byCategory[0].category} category at ${formatCurrency(byCategory[0].revenue, { compact: true })}, creating product-line dependency risk.`);
    }
    return out;
  }, [pareto.data, byCategory, bySubcategory, top20Pct]);

  const topProducts = useMemo(
    () => (pareto.data ? [...pareto.data].sort((a, b) => a.product_rank - b.product_rank).slice(0, 10) : []),
    [pareto.data],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Product Intelligence" description="Profitability, margins, and product concentration analysis." />

      <Card className="border-primary/20 bg-primary/5 p-5">
        <p className="text-sm font-medium text-primary">Executive Commentary</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {pareto.data ? `Top ${Math.max(1, Math.ceil((pareto.data?.length ?? 0) * 0.2))} products generate ${formatPercent(top20Pct)} of total revenue.` : "Analyzing product concentration…"}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {margins.isPending ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Revenue & Margin by Category" description="Estimated margin contribution per category">
              <GroupedBarChart data={byCategory} categoryKey="category" series={[{ key: "revenue", name: "Revenue" }, { key: "margin", name: "Margin", color: "var(--color-chart-3)" }]} valueFormatter={(v) => formatCurrency(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Margin % by Subcategory" description="Profitability rate per subcategory">
              <RankedBarChart data={bySubcategory.map((s) => ({ name: s.name, value: s.value }))} categoryKey="name" valueKey="value" colorByIndex valueFormatter={(v) => formatPercent(v)} />
            </ChartCard>
          </>
        )}
      </div>

      {pareto.isPending ? (
        <ChartSkeleton />
      ) : (
        <ChartCard title="Pareto Revenue Analysis (80/20)" description="Product revenue with cumulative contribution">
          <ParetoChart data={topProducts.map((p) => ({ name: `#${p.product_rank}`, revenue: p.revenue, cumulative: p.cumulative_revenue_percentage }))} categoryKey="name" barKey="revenue" lineKey="cumulative" valueFormatter={(v) => formatCurrency(v, { compact: true })} />
        </ChartCard>
      )}

      <BusinessInsightsPanel insights={businessInsights} loading={margins.isPending || pareto.isPending} />

      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">Top Products</h2>
          <p className="text-sm text-muted-foreground">Ranked by revenue contribution</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">Cumulative %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.product_key}>
                  <TableCell className="font-medium text-muted-foreground">{p.product_rank}</TableCell>
                  <TableCell className="font-medium">{p.product_name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.subcategory}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(p.revenue, { compact: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(p.quantity_sold)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPercent(p.revenue_percentage)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPercent(p.cumulative_revenue_percentage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
