import type { ReactNode } from "react";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: ReactNode;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: ReactNode) => ReactNode;
}

export function ChartTooltip({ active, payload, label, formatter, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {label != null && (
        <p className="mb-1.5 font-medium text-popover-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-medium tabular-nums text-popover-foreground">
              {formatter && typeof item.value === "number"
                ? formatter(item.value, String(item.name ?? ""))
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
