import type { ProviderName } from "../types.js";
import { usageListeners, usageLoadingProviders } from "./usageStoreState.js";

/**
 * Marks a provider usage request as loading or settled and notifies subscribers.
 *
 * @param provider Provider whose usage state changed.
 * @param loading Whether usage is currently loading.
 */
export function setUsageLoading(provider: ProviderName, loading: boolean): void {
	if (loading) usageLoadingProviders.add(provider);
	else usageLoadingProviders.delete(provider);
	for (const listener of usageListeners) listener();
}
