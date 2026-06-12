import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ChartCard } from "@/components/chart-card";
import { BusinessInsightsPanel } from "@/components/business-insights-panel";
import { ChartSkeleton } from "@/components/states";
import { GroupedBarChart, DonutChart } from "@/components/charts/charts";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, Sparkles, AlertTriangle } from "lucide-react";
import { useRetention, useRfm, useProfiles, retentionQuery, rfmQuery, profilesQuery } from "@/hooks/use-sales-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customer Intelligence · Sales Intelligence Platform" },
      { name: "description", content: "Retention, RFM segmentation, and customer demographics analysis." },
      { property: "og:title", content: "Customer Intelligence · Sales Intelligence Platform" },
      { property: "og:description", content: "Retention, RFM segmentation, and customer demographics." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(retentionQuery);
    context.queryClient.ensureQueryData(rfmQuery);
    context.queryClient.ensureQueryData(profilesQuery);
  },
  component: Customers,
});

const SEGMENTS = [
  { key: "VIP Customer", label: "VIP", icon: Crown, accent: "primary" as const },
  { key: "Loyal Customer", label: "Loyal", icon: Heart, accent: "chart-3" as const },
  { key: "Recent Customer", label: "Recent", icon: Sparkles, accent: "chart-2" as const },
  { key: "At Risk Customer", label: "At Risk", icon: AlertTriangle, accent: "chart-5" as const },
];

function Customers() {
  const retention = useRetention();
  const rfm = useRfm();
  const profiles = useProfiles();

  const segmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of rfm.data ?? []) map.set(c.customer_segment, (map.get(c.customer_segment) ?? 0) + 1);
    return map;
  }, [rfm.data]);

  const repeat = useMemo(() => {
    if (!retention.data) return { one: 0, repeat: 0, total: 0 };
    const one = retention.data.find((r) => r.purchase_frequency === 1)?.customers ?? 0;
    const total = retention.data.reduce((s, r) => s + r.customers, 0);
    return { one, repeat: total - one, total };
  }, [retention.data]);

  const demo = useMemo(() => {
    const agg = (field: "gender" | "marital_status" | "age_group") => {
      const map = new Map<string, number>();
      for (const r of profiles.data ?? []) map.set(r[field], (map.get(r[field]) ?? 0) + r.customers);
      return Array.from(map, ([name, value]) => ({ name, value }));
    };
    return { gender: agg("gender"), marital: agg("marital_status"), age: agg("age_group") };
  }, [profiles.data]);

  const businessInsights = useMemo(() => {
    const out: string[] = [];
    if (repeat.total) {
      const onePct = (repeat.one / repeat.total) * 100;
      out.push(`${formatPercent(onePct)} of customers are one-time buyers — improving repeat purchase rate is the largest growth lever.`);
    }
    const vip = segmentCounts.get("VIP Customer") ?? 0;
    if (vip) out.push(`${formatNumber(vip)} VIP customers drive disproportionate value and should be prioritised for retention programs.`);
    const atRisk = segmentCounts.get("At Risk Customer") ?? 0;
    if (atRisk) out.push(`${formatNumber(atRisk)} customers are flagged At Risk and are prime candidates for win-back campaigns.`);
    if (demo.age.length) {
      const topAge = [...demo.age].sort((a, b) => b.value - a.value)[0];
      out.push(`The ${topAge.name} age group is the largest customer segment by headcount.`);
    }
    return out;
  }, [repeat, segmentCounts, demo]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Intelligence" description="Behaviour, segmentation, and demographic analysis." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTS.map((s) => (
          <KpiCard key={s.key} label={`${s.label} Customers`} value={formatNumber(segmentCounts.get(s.key) ?? 0)} icon={s.icon} accent={s.accent} subtext="RFM segment" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {retention.isPending ? (
          <ChartSkeleton className="lg:col-span-2" />
        ) : (
          <ChartCard title="Purchase Frequency Distribution" description="Customers grouped by number of purchases" className="lg:col-span-2">
            <GroupedBarChart data={(retention.data ?? []).map((r) => ({ freq: `${r.purchase_frequency}x`, customers: r.customers }))} categoryKey="freq" series={[{ key: "customers", name: "Customers" }]} valueFormatter={(v) => formatNumber(v, { compact: true })} />
          </ChartCard>
        )}
        {retention.isPending ? (
          <ChartSkeleton />
        ) : (
          <ChartCard title="One-Time vs Repeat" description="Customer loyalty split">
            <DonutChart data={[{ name: "One-Time", value: repeat.one }, { name: "Repeat", value: repeat.repeat }]} valueFormatter={(v) => formatNumber(v, { compact: true })} />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {profiles.isPending ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Gender Distribution" description="Customers by gender">
              <DonutChart data={demo.gender} valueFormatter={(v) => formatNumber(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Marital Status" description="Customers by marital status">
              <DonutChart data={demo.marital} valueFormatter={(v) => formatNumber(v, { compact: true })} />
            </ChartCard>
            <ChartCard title="Age Groups" description="Customers by age group">
              <GroupedBarChart data={demo.age.map((a) => ({ name: a.name, customers: a.value }))} categoryKey="name" series={[{ key: "customers", name: "Customers", color: "var(--color-chart-4)" }]} valueFormatter={(v) => formatNumber(v, { compact: true })} />
            </ChartCard>
          </>
        )}
      </div>

      <BusinessInsightsPanel insights={businessInsights} loading={retention.isPending || rfm.isPending || profiles.isPending} />

      <Card className="p-5">
        <h2 className="font-semibold text-foreground">RFM Segments</h2>
        <p className="text-sm text-muted-foreground">Recency, Frequency & Monetary segmentation overview</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from(segmentCounts, ([seg, count]) => (
            <Badge key={seg} variant="secondary" className="gap-1.5 px-3 py-1">
              {seg} <span className="font-semibold">{formatNumber(count)}</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
