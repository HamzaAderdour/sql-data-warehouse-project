import { useSyncExternalStore } from "react";

const demoEndpoints = new Set<string>();
const listeners = new Set<() => void>();
let snapshot = false;

function emit() {
  const next = demoEndpoints.size > 0;
  if (next !== snapshot) {
    snapshot = next;
    listeners.forEach((l) => l());
  }
}

export function markDemo(endpoint: string) {
  if (!demoEndpoints.has(endpoint)) {
    demoEndpoints.add(endpoint);
    emit();
  }
}

export function clearDemo(endpoint: string) {
  if (demoEndpoints.has(endpoint)) {
    demoEndpoints.delete(endpoint);
    emit();
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useIsDemoMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => false,
  );
}
