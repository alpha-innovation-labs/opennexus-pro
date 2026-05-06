import { formatTokenBalanceRow } from "./formatTokenBalanceRow.js";
import { formatWalletBalanceRow } from "./formatWalletBalanceRow.js";
import type { WalletAccountSnapshot } from "../solana/WalletAccountSnapshot.js";

/**
 * Formats one wallet account snapshot with SOL and SPL tokens.
 *
 * @param snapshot Wallet account snapshot.
 * @param selectedAssetIndex Selected global chartable asset index.
 * @param assetStartIndex First global chartable asset index in this snapshot.
 * @returns Human-readable snapshot lines.
 */
export function formatWalletSnapshot(snapshot: WalletAccountSnapshot, selectedAssetIndex = -1, assetStartIndex = 0): string[] {
	const solSelectable = snapshot.sol.lamports > 0;
	const tokenStartIndex = assetStartIndex + (solSelectable ? 1 : 0);
	return [
		formatWalletBalanceRow(snapshot.sol, solSelectable && assetStartIndex === selectedAssetIndex),
		...snapshot.tokens.map((token, index) => formatTokenBalanceRow(token, tokenStartIndex + index === selectedAssetIndex)),
	];
}
