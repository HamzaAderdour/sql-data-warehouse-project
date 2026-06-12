export function formatCurrency(value: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals } = opts;
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals ?? (compact ? 1 : 0),
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals } = opts;
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals ?? (compact ? 1 : 0),
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function formatMonth(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { year: "2-digit", month: "short" }).format(d);
}
