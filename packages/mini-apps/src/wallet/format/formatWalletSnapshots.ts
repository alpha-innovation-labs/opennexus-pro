import { formatWalletSnapshot } from "./formatWalletSnapshot.js";
import type { WalletAccountSnapshot } from "../solana/WalletAccountSnapshot.js";

/**
 * Formats wallet account snapshots with one balance or token per line.
 *
 * @param snapshots Wallet account snapshots.
 * @param selectedAssetIndex Selected global chartable asset index.
 * @returns Multi-line wallet output.
 */
export function formatWalletSnapshots(snapshots: WalletAccountSnapshot[], selectedAssetIndex = -1): string {
	let assetStartIndex = 0;
	return snapshots.flatMap((snapshot) => {
		const lines = formatWalletSnapshot(snapshot, selectedAssetIndex, assetStartIndex);
		assetStartIndex += (snapshot.sol.lamports > 0 ? 1 : 0) + snapshot.tokens.length;
		return lines;
	}).join("\n");
}
