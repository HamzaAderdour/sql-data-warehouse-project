import axios from "axios";
import { markDemo, clearDemo } from "./demo-store";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  timeout: 6000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetch from the API. If the backend is unreachable, fall back to bundled
 * demo data and flag the endpoint as demo so the UI can surface a badge.
 */
export async function fetchWithFallback<T>(path: string, demo: T): Promise<T> {
  try {
    const res = await apiClient.get<T>(path);
    clearDemo(path);
    return res.data;
  } catch {
    markDemo(path);
    return demo;
  }
}
