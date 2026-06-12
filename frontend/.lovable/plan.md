# Sales Intelligence Platform — Build Plan

A production-quality Business Intelligence / Decision Support web app built on the existing TanStack Start (React + TypeScript + Tailwind v4 + shadcn) foundation, using Axios, React Query, and Recharts. Indigo/slate "Power BI" theme with dark/light toggle.

## Data layer

- **Axios client** (`src/lib/api/client.ts`) with base URL from `import.meta.env.VITE_API_BASE_URL` (defaults to `http://localhost:8000`). Short timeout so unreachable backends fail fast.
- **Typed endpoints** in `src/lib/api/sales-api.ts` — TypeScript interfaces matching your exact shapes for all 9 endpoints (`/api/kpis`, `/api/sales/trend`, `/api/countries/performance`, `/api/margins`, `/api/products/pareto`, `/api/customers/retention`, `/api/customers/rfm`, `/api/customers/profile`, `/api/business/insights`).
- **React Query hooks** (`src/hooks/use-sales-data.ts`) — one query hook per endpoint with sensible `staleTime`. All fetching is client-side (browser → your local FastAPI), so real data loads automatically when you run locally.
- **Demo-data fallback**: bundled realistic sample JSON (`src/lib/api/demo-data.ts`) seeded from the example values you provided plus generated trend/RFM rows. The query layer falls back to demo data when the API is unreachable. A global "Demo Data" badge appears in the top bar whenever any data is served from the fallback (tracked via a small context/flag). When the API responds, it switches to live data with no badge.

## Theming & layout

- **Tokens** in `src/styles.css`: indigo primary (`#4f46e5`), slate neutrals (`#0f172a` / `#64748b`), green accent (`#22c55e`), plus chart color tokens and risk colors (green/yellow/red). Full light + dark oklch values.
- **Theme toggle**: `next-themes`-style provider using class strategy + a header toggle button (persisted to localStorage).
- **App shell** (`src/components/layout/`): collapsible shadcn `Sidebar` with section icons + active route highlighting, a top bar with global search, theme toggle, and demo-data badge. Root layout (`__root.tsx`) wraps everything in `QueryClientProvider` + `SidebarProvider` + theme provider.

## Reusable components (`src/components/`)

- `KpiCard` — label, value (formatted currency/number), optional delta/subtext, icon.
- `ChartCard` — titled card wrapper with description + optional toolbar, used for all Recharts.
- Chart wrappers: `RevenueLineChart`, `RevenueAreaChart`, `RankedBarChart`, `StackedBarChart`, `CategoryPieChart`, `ParetoChart` (bar + cumulative line), `RfmScatter`/segment bars.
- `AiInsightPanel` — collapsible panel rendering deterministic natural-language insights derived from the current page's data (e.g. "Australia generates the highest revenue per customer…").
- `AlertCard` — green/yellow/red variants for opportunities/attention/risks.
- State components: `LoadingSkeleton`, `ErrorState`, `EmptyState` (used consistently across pages).
- Formatters (`src/lib/format.ts`): currency, compact numbers, percentages.

## Pages / routes (`src/routes/`)

1. **`/` Dashboard Overview** — 6 KPI cards (Total Revenue, Orders, Customers, Sold Products, Avg Order Value, Revenue/Customer from `/api/kpis`); Revenue Trend (area), Revenue by Country (ranked bar), Revenue by Category (derived from `/api/margins`, bar/donut); strategic insight cards from `/api/business/insights` (Best Market, Highest Margin Category, Best Revenue Year, Retention Risk); AI Insight panel.
2. **`/sales` Sales Analytics** — Monthly Revenue, Orders, AOV, Quantity trends from `/api/sales/trend`; Year + Country filters (URL search params, type-safe); interactive line/area charts.
3. **`/markets` Market Intelligence** — `/api/countries/performance`: revenue by country, revenue/customer, AOV, country ranking table; Top Markets vs Underperforming Markets; ranked bar charts (no live map dependency — clean ranked visualization).
4. **`/products` Product Intelligence** — `/api/margins` + `/api/products/pareto`: margin by category & subcategory (stacked/grouped bars), Pareto chart with 80/20 cumulative line, Top Products table, auto-generated commentary ("Top 20 products generate X% of revenue").
5. **`/customers` Customer Intelligence** — `/api/customers/retention` (frequency distribution, one-time vs repeat), `/api/customers/rfm` (VIP / Loyal / Recent / At-Risk segment breakdown + table), `/api/customers/profile` (gender, marital status, age-group distributions); automatic observations.
6. **`/insights` Executive Insights** — `/api/business/insights`: alert cards (revenue concentration, margin opportunities, retention risks, market opportunities, product dependency risk) color-coded green/yellow/red + a generated executive summary paragraph.

Every route has its own `head()` SEO metadata, `errorComponent`, and `notFoundComponent`, plus an AI Insight panel.

## Technical notes

- Global search filters the nav + offers quick links to entities (countries/products/customers) where data is loaded.
- All charts read live React Query data; loading shows skeletons, failures show error/empty states (before demo fallback engages).
- `.env` documented with `VITE_API_BASE_URL=http://localhost:8000` so it runs immediately; CORS must be enabled on your FastAPI server for browser calls.
- Recharts theming reads CSS variables so charts adapt to dark/light mode.

## Deliverables
Folder structure, API services, typed hooks, routing, reusable components, all 6 pages with charts/tables, theming + dark mode, demo-data fallback, and consistent loading/error/empty states — runnable immediately.