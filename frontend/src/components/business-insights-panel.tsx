import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessInsightsPanelProps {
  insights: string[];
  loading?: boolean;
  className?: string;
}

export function BusinessInsightsPanel({ insights, loading, className }: BusinessInsightsPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-accent/40 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Business Insights</h3>
          <p className="text-xs text-muted-foreground">
            Business observations derived from analytics data
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
            ))
          : insights.map((text, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{text}</span>
              </li>
            ))}
      </ul>
    </div>
  );
}
