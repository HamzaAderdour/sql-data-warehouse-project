import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ChartCard } from "@/components/chart-card";
import { BusinessInsightsPanel } from "@/components/business-insights-panel";
import { ChartSkeleton } from "@/components/states";
import { RankedBarChart } from "@/components/charts/charts";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCountries, countriesQuery } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Market Intelligence · Sales Intelligence Platform" },
      { name: "description", content: "Analyze country performance, revenue per customer, and market rankings." },
      { property: "og:title", content: "Market Intelligence · Sales Intelligence Platform" },
      { property: "og:description", content: "Country performance, revenue per customer, and market rankings." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(countriesQuery);
  },
  component: Markets,
});

function Markets() {
  const countries = useCountries();

  const sorted = useMemo(
    () => (countries.data ? [...countries.data].sort((a, b) => b.revenue - a.revenue) : []),
    [countries.data],
  );

  const businessInsights = useMemo(() => {
    if (sorted.length === 0) return [];
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const bestPerCust = [...sorted].sort((a, b) => b.revenue_per_customer - a.revenue_per_customer)[0];
    return [
      `${top.country} leads all markets with ${formatCurrency(top.revenue)} in total revenue from ${formatNumber(top.customers)} customers.`,
      `${bestPerCust.country} has the highest revenue per customer at ${formatCurrency(bestPerCust.revenue_per_customer)}, signalling premium demand and strong expansion potential.`,
      `${bottom.country} is the lowest-performing market (${formatCurrency(bottom.revenue)}) and may warrant a review of pricing or go-to-market strategy.`,
    ];
  }, [sorted]);

  return (
    <div className="space-y-6">
      <PageHeader title="Market Intelligence" description="Country-level performance and market opportunity analysis." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {countries.isPending ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Revenue by Country" description="Total revenue per market">
              <RankedBarChart data={sorted.map((c) => ({ country: c.country, revenue: c.revenue }))} categoryKey="country" valueKey="revenue" colorByIndex valueFormatter={(v) => formatCurrency(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Revenue per Customer" description="Customer value by market">
              <RankedBarChart data={[...sorted].sort((a, b) => b.revenue_per_customer - a.revenue_per_customer).map((c) => ({ country: c.country, value: c.revenue_per_customer }))} categoryKey="country" valueKey="value" colorByIndex valueFormatter={(v) => formatCurrency(v)} />
            </ChartCard>
          </>
        )}
      </div>

      <BusinessInsightsPanel insights={businessInsights} loading={countries.isPending} />

      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">Country Ranking</h2>
          <p className="text-sm text-muted-foreground">All markets ranked by total revenue</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Customers</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Rev / Customer</TableHead>
                <TableHead className="text-right">Avg Order Value</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c, i) => (
                <TableRow key={c.country}>
                  <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.country}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(c.revenue, { compact: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(c.customers)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(c.orders)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(c.revenue_per_customer)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(c.average_order_value)}</TableCell>
                  <TableCell>
                    {i < Math.ceil(sorted.length / 3) ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">Top Market</Badge>
                    ) : i >= sorted.length - Math.ceil(sorted.length / 3) ? (
                      <Badge variant="outline" className="border-destructive/40 text-destructive">Underperforming</Badge>
                    ) : (
                      <Badge variant="secondary">Mid</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
