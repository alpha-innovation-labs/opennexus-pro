import type { ProviderName, UsageSnapshot } from "../types.js";

export const usageSnapshots = new Map<ProviderName, UsageSnapshot>();
export const usageLoadingProviders = new Set<ProviderName>();
export const usageListeners = new Set<() => void>();
