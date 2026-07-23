import { readFile } from "node:fs/promises";
import { createEmptyWalletBalanceCache } from "./createEmptyWalletBalanceCache.js";
import type { WalletBalanceCache } from "./WalletBalanceCache.js";

/**
 * Reads the persisted wallet balance cache.
 *
 * @param cachePath Absolute cache file path.
 * @returns Wallet balance cache contents.
 */
export async function readWalletBalanceCache(cachePath: string): Promise<WalletBalanceCache> {
	try {
		const parsed = JSON.parse(await readFile(cachePath, "utf8")) as Partial<WalletBalanceCache>;
		return {
			updatedAt: parsed.updatedAt ?? "",
			rowsByPublicKey: parsed.rowsByPublicKey ?? {},
			snapshotsByPublicKey: parsed.snapshotsByPublicKey ?? {},
		};
	} catch {
		return createEmptyWalletBalanceCache();
	}
}
