import type { WalletBalanceCache } from "./WalletBalanceCache.js";
import type { WalletAccountSnapshot } from "../solana/WalletAccountSnapshot.js";

/**
 * Picks cached wallet snapshots matching the requested public keys in order.
 *
 * @param cache Wallet balance cache.
 * @param publicKeys Public keys to read from cache.
 * @returns Cached snapshots in requested order.
 */
export function pickCachedWalletSnapshots(cache: WalletBalanceCache, publicKeys: readonly string[]): WalletAccountSnapshot[] {
	return publicKeys.flatMap((publicKey) => {
		const snapshot = cache.snapshotsByPublicKey[publicKey];
		if (snapshot) return [snapshot];
		const sol = cache.rowsByPublicKey[publicKey];
		return sol ? [{ sol, tokens: [] }] : [];
	});
}
