import type { WalletBalanceCache } from "./WalletBalanceCache.js";
import type { WalletBalanceRow } from "../solana/WalletBalanceRow.js";

/**
 * Picks cached rows matching the requested public keys in order.
 *
 * @param cache Wallet balance cache.
 * @param publicKeys Public keys to read from cache.
 * @returns Cached rows in requested order.
 */
export function pickCachedWalletBalanceRows(cache: WalletBalanceCache, publicKeys: readonly string[]): WalletBalanceRow[] {
	return publicKeys.flatMap((publicKey) => {
		const row = cache.rowsByPublicKey[publicKey];
		return row ? [row] : [];
	});
}
