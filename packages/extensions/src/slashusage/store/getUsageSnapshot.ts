import type { ProviderName, UsageSnapshot } from "../types.js";
import { usageSnapshots } from "./usageStoreState.js";

/**
 * Reads the cached usage snapshot for one provider.
 *
 * @param provider Normalized provider name.
 * @returns Cached usage snapshot.
 */
export function getUsageSnapshot(provider: ProviderName): UsageSnapshot | undefined {
	return usageSnapshots.get(provider);
}
