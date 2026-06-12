import { queryOptions, useQuery } from "@tanstack/react-query";
import { salesApi } from "@/lib/api/sales-api";

const STALE = 5 * 60 * 1000;

export const kpisQuery = queryOptions({ queryKey: ["kpis"], queryFn: salesApi.getKpis, staleTime: STALE });
export const insightsQuery = queryOptions({ queryKey: ["insights"], queryFn: salesApi.getInsights, staleTime: STALE });
export const salesTrendQuery = queryOptions({ queryKey: ["sales-trend"], queryFn: salesApi.getSalesTrend, staleTime: STALE });
export const countriesQuery = queryOptions({ queryKey: ["countries"], queryFn: salesApi.getCountries, staleTime: STALE });
export const marginsQuery = queryOptions({ queryKey: ["margins"], queryFn: salesApi.getMargins, staleTime: STALE });
export const paretoQuery = queryOptions({ queryKey: ["pareto"], queryFn: salesApi.getPareto, staleTime: STALE });
export const retentionQuery = queryOptions({ queryKey: ["retention"], queryFn: salesApi.getRetention, staleTime: STALE });
export const rfmQuery = queryOptions({ queryKey: ["rfm"], queryFn: salesApi.getRfm, staleTime: STALE });
export const profilesQuery = queryOptions({ queryKey: ["profiles"], queryFn: salesApi.getProfiles, staleTime: STALE });

export const useKpis = () => useQuery(kpisQuery);
export const useInsights = () => useQuery(insightsQuery);
export const useSalesTrend = () => useQuery(salesTrendQuery);
export const useCountries = () => useQuery(countriesQuery);
export const useMargins = () => useQuery(marginsQuery);
export const usePareto = () => useQuery(paretoQuery);
export const useRetention = () => useQuery(retentionQuery);
export const useRfm = () => useQuery(rfmQuery);
export const useProfiles = () => useQuery(profilesQuery);
