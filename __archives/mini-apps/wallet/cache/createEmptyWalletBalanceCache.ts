import type { WalletBalanceCache } from "./WalletBalanceCache.js";

/**
 * Creates an empty wallet balance cache.
 *
 * @returns Empty wallet balance cache.
 */
export function createEmptyWalletBalanceCache(): WalletBalanceCache {
	return { updatedAt: "", rowsByPublicKey: {}, snapshotsByPublicKey: {} };
}
