import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { WalletBalanceCache } from "./WalletBalanceCache.js";

/**
 * Persists the wallet balance cache to disk.
 *
 * @param cachePath Absolute cache file path.
 * @param cache Cache contents to write.
 */
export async function writeWalletBalanceCache(cachePath: string, cache: WalletBalanceCache): Promise<void> {
	await mkdir(dirname(cachePath), { recursive: true });
	await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}
