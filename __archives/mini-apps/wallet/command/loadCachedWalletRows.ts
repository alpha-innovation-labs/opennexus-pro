import { getWalletCachePath } from "@nexus/mini-apps/wallet/cache/getWalletCachePath.js";
import { pickCachedWalletSnapshots } from "@nexus/mini-apps/wallet/cache/pickCachedWalletSnapshots.js";
import { readWalletBalanceCache } from "@nexus/mini-apps/wallet/cache/readWalletBalanceCache.js";
import { derivePhantomPublicKeys } from "@nexus/mini-apps/wallet/solana/derivePhantomPublicKeys.js";
import type { WalletModalState } from "../ui/WalletModalState.js";

/**
 * Loads cached balance snapshots for derived wallet accounts without network calls.
 *
 * @param mnemonic Recovery phrase used only to derive public keys.
 * @param count Account count.
 * @returns Initial wallet modal state.
 */
export async function loadCachedWalletRows(mnemonic: string, count: number): Promise<WalletModalState> {
	const cache = await readWalletBalanceCache(getWalletCachePath(process.env));
	const publicKeys = derivePhantomPublicKeys(mnemonic, count);
	const snapshots = pickCachedWalletSnapshots(cache, publicKeys);
	return { snapshots, updatedAt: cache.updatedAt, loading: false, selectedTokenIndex: 0, selectedTrendingIndex: 0, status: snapshots.length > 0 ? "Showing cached balances." : "No cache found; fetching once now." };
}
