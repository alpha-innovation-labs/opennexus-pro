import type { WalletBalanceCache } from "./WalletBalanceCache.js";
import type { WalletAccountSnapshot } from "../solana/WalletAccountSnapshot.js";

/**
 * Merges freshly fetched wallet snapshots into the cache.
 *
 * @param cache Existing wallet balance cache.
 * @param snapshots Fresh wallet account snapshots.
 * @returns Updated wallet balance cache.
 */
export function mergeWalletSnapshots(cache: WalletBalanceCache, snapshots: readonly WalletAccountSnapshot[]): WalletBalanceCache {
	const rowsByPublicKey = { ...cache.rowsByPublicKey };
	const snapshotsByPublicKey = { ...cache.snapshotsByPublicKey };
	for (const snapshot of snapshots) {
		rowsByPublicKey[snapshot.sol.publicKey] = snapshot.sol;
		snapshotsByPublicKey[snapshot.sol.publicKey] = snapshot;
	}
	return { updatedAt: new Date().toISOString(), rowsByPublicKey, snapshotsByPublicKey };
}
