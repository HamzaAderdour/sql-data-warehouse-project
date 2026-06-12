import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  subtext?: string;
  trend?: { value: number; label?: string };
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6";
  className?: string;
}

const accentBg: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  "chart-2": "bg-[var(--color-chart-2)]/10 text-[var(--color-chart-2)]",
  "chart-3": "bg-[var(--color-chart-3)]/10 text-[var(--color-chart-3)]",
  "chart-4": "bg-[var(--color-chart-4)]/10 text-[var(--color-chart-4)]",
  "chart-5": "bg-[var(--color-chart-5)]/10 text-[var(--color-chart-5)]",
  "chart-6": "bg-[var(--color-chart-6)]/10 text-[var(--color-chart-6)]",
};

export function KpiCard({ label, value, icon: Icon, subtext, trend, accent = "primary", className }: KpiCardProps) {
  const up = trend && trend.value >= 0;
  return (
    <Card className={cn("relative overflow-hidden transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentBg[accent])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium", up ? "text-success" : "text-destructive")}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          )}
          {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
