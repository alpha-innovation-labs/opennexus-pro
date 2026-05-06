import { mergeWalletSnapshots } from "@nexus/mini-apps/wallet/cache/mergeWalletSnapshots.js";
import { createSolanaRpcUrl } from "@nexus/mini-apps/wallet/config/createSolanaRpcUrl.js";
import { getWalletCachePath } from "@nexus/mini-apps/wallet/cache/getWalletCachePath.js";
import { readWalletBalanceCache } from "@nexus/mini-apps/wallet/cache/readWalletBalanceCache.js";
import { writeWalletBalanceCache } from "@nexus/mini-apps/wallet/cache/writeWalletBalanceCache.js";
import { readWalletSnapshots } from "@nexus/mini-apps/wallet/solana/readWalletSnapshots.js";
import type { WalletModalState } from "../ui/WalletModalState.js";

/**
 * Refreshes wallet SOL and SPL-token balances from RPC and updates cache.
 *
 * @param mnemonic Recovery phrase used to derive public keys.
 * @param count Account count.
 * @returns Refreshed wallet modal state.
 */
export async function refreshWalletRows(mnemonic: string, count: number): Promise<WalletModalState> {
	const cachePath = getWalletCachePath(process.env);
	const snapshots = await readWalletSnapshots({ mnemonic, count, rpcUrl: createSolanaRpcUrl(process.env) });
	const cache = mergeWalletSnapshots(await readWalletBalanceCache(cachePath), snapshots);
	await writeWalletBalanceCache(cachePath, cache);
	return { snapshots, updatedAt: cache.updatedAt, loading: false, selectedTokenIndex: 0, status: "Cache refreshed from public Solana RPC." };
}
