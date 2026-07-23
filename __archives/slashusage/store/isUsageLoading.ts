import type { ProviderName } from "../types.js";
import { usageLoadingProviders } from "./usageStoreState.js";

/**
 * Checks whether a provider usage refresh is currently in flight.
 *
 * @param provider Provider to inspect.
 * @returns True while usage is loading.
 */
export function isUsageLoading(provider: ProviderName): boolean {
	return usageLoadingProviders.has(provider);
}
