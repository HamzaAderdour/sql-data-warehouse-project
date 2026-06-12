import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AlertCard } from "@/components/alert-card";
import { Card } from "@/components/ui/card";
import { useInsights, insightsQuery } from "@/hooks/use-sales-data";
import { formatCurrency, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Executive Insights · Sales Intelligence Platform" },
      { name: "description", content: "Strategic executive summary: opportunities, attention areas, and business risks." },
      { property: "og:title", content: "Executive Insights · Sales Intelligence Platform" },
      { property: "og:description", content: "Strategic opportunities, attention areas, and business risks." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(insightsQuery);
  },
  component: Insights,
});

function Insights() {
  const insights = useInsights();
  const d = insights.data;

  const summary = useMemo(() => {
    if (!d) return "";
    return `The business has generated ${formatCurrency(d.total_revenue)} in total revenue, peaking in ${d.best_revenue_year} with ${formatCurrency(d.best_year_revenue)}. ${d.best_country} is the strongest market at ${formatCurrency(d.best_country_revenue_per_customer)} revenue per customer, while ${formatPercent(d.bikes_revenue_percentage)} of revenue depends on bikes — a concentration risk. With ${formatPercent(d.one_time_customers_percentage)} of customers buying only once, retention is the single largest opportunity to unlock sustainable growth.`;
  }, [d]);

  return (
    <div className="space-y-6">
      <PageHeader title="Executive Insights" description="Strategy-level summary of opportunities, attention areas, and risks." />

      {d ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-accent/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Executive Summary</h2>
          <p className="mt-2 text-base leading-relaxed text-foreground">{summary}</p>
        </Card>
      ) : (
        <Card className="h-32 animate-pulse" />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {d && (
          <>
            <AlertCard level="opportunity" title="Market Expansion" metric={d.best_country}>
              {d.best_country} delivers {formatCurrency(d.best_country_revenue_per_customer)} per customer — the highest of any market. Increasing acquisition here offers strong, high-value upside.
            </AlertCard>
            <AlertCard level="opportunity" title="Margin Opportunity" metric={`${formatPercent(d.highest_margin_percentage)}`}>
              The {d.highest_margin_category} category carries the highest margin rate. Expanding its share of mix would lift overall profitability.
            </AlertCard>
            <AlertCard level="attention" title="Customer Frequency" metric={formatPercent(d.low_frequency_customers_percentage)}>
              {formatPercent(d.low_frequency_customers_percentage)} of customers are low-frequency buyers. Loyalty and engagement programs could materially raise lifetime value.
            </AlertCard>
            <AlertCard level="risk" title="Revenue Concentration" metric={formatPercent(d.bikes_revenue_percentage)}>
              Bikes account for {formatPercent(d.bikes_revenue_percentage)} of total revenue. This product dependency is a structural risk if demand softens.
            </AlertCard>
            <AlertCard level="risk" title="Retention Risk" metric={formatPercent(d.one_time_customers_percentage)}>
              {formatPercent(d.one_time_customers_percentage)} of customers ordered only once. Without repeat purchases, acquisition costs erode long-term profitability.
            </AlertCard>
            <AlertCard level="opportunity" title="Peak Performance" metric={String(d.best_revenue_year)}>
              {d.best_revenue_year} was the strongest year at {formatCurrency(d.best_year_revenue)}. Replicating its conditions is a clear strategic target.
            </AlertCard>
          </>
        )}
      </div>
    </div>
  );
}
