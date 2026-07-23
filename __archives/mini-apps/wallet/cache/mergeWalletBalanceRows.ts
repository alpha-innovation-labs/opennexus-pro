import type { WalletBalanceCache } from "./WalletBalanceCache.js";
import type { WalletBalanceRow } from "../solana/WalletBalanceRow.js";

/**
 * Merges freshly fetched balance rows into the cache.
 *
 * @param cache Existing wallet balance cache.
 * @param rows Fresh wallet balance rows.
 * @returns Updated wallet balance cache.
 */
export function mergeWalletBalanceRows(cache: WalletBalanceCache, rows: readonly WalletBalanceRow[]): WalletBalanceCache {
	const rowsByPublicKey = { ...cache.rowsByPublicKey };
	for (const row of rows) rowsByPublicKey[row.publicKey] = row;
	return { updatedAt: new Date().toISOString(), rowsByPublicKey };
}
