import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertOctagon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AlertLevel = "opportunity" | "attention" | "risk";

const config: Record<AlertLevel, { icon: LucideIcon; cls: string; chip: string; label: string }> = {
  opportunity: {
    icon: CheckCircle2,
    cls: "border-l-success/70 bg-success/5",
    chip: "bg-success/15 text-success",
    label: "Opportunity",
  },
  attention: {
    icon: AlertCircle,
    cls: "border-l-warning/70 bg-warning/5",
    chip: "bg-warning/20 text-warning-foreground dark:text-warning",
    label: "Attention",
  },
  risk: {
    icon: AlertOctagon,
    cls: "border-l-destructive/70 bg-destructive/5",
    chip: "bg-destructive/15 text-destructive",
    label: "Risk",
  },
};

interface AlertCardProps {
  level: AlertLevel;
  title: string;
  children: ReactNode;
  metric?: string;
}

export function AlertCard({ level, title, children, metric }: AlertCardProps) {
  const { icon: Icon, cls, chip, label } = config[level];
  return (
    <Card className={cn("border-l-4 p-5", cls)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", level === "opportunity" ? "text-success" : level === "attention" ? "text-warning" : "text-destructive")} />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", chip)}>{label}</span>
      </div>
      {metric && <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{metric}</p>}
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </Card>
  );
}
