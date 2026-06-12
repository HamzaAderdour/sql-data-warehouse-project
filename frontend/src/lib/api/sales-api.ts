import { fetchWithFallback } from "./client";
import {
  demoCountries,
  demoInsights,
  demoKpis,
  demoMargins,
  demoPareto,
  demoProfiles,
  demoRetention,
  demoRfm,
  demoSalesTrend,
} from "./demo-data";
import type {
  BusinessInsights,
  CountryPerformance,
  CustomerProfileRow,
  Kpis,
  MarginRow,
  ParetoRow,
  RetentionRow,
  RfmCustomer,
  SalesTrendPoint,
} from "./types";

export const salesApi = {
  getKpis: () => fetchWithFallback<Kpis>("/api/kpis", demoKpis),
  getInsights: () => fetchWithFallback<BusinessInsights>("/api/business/insights", demoInsights),
  getSalesTrend: () => fetchWithFallback<SalesTrendPoint[]>("/api/sales/trend", demoSalesTrend),
  getCountries: () => fetchWithFallback<CountryPerformance[]>("/api/countries/performance", demoCountries),
  getMargins: () => fetchWithFallback<MarginRow[]>("/api/margins", demoMargins),
  getPareto: () => fetchWithFallback<ParetoRow[]>("/api/products/pareto", demoPareto),
  getRetention: () => fetchWithFallback<RetentionRow[]>("/api/customers/retention", demoRetention),
  getRfm: () => fetchWithFallback<RfmCustomer[]>("/api/customers/rfm", demoRfm),
  getProfiles: () => fetchWithFallback<CustomerProfileRow[]>("/api/customers/profile", demoProfiles),
};
