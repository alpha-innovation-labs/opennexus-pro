import { getWalletTokenLabel } from "./getWalletTokenLabel.js";
import type { WalletChartAsset } from "./WalletChartAsset.js";
import type { WalletModalState } from "./WalletModalState.js";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

/**
 * Returns wallet assets that support Jupiter historical price charts.
 *
 * @param state Current wallet modal state.
 * @returns Chartable SOL and SPL token assets.
 */
export function getWalletModalChartAssets(state: WalletModalState): WalletChartAsset[] {
	return state.snapshots.flatMap((snapshot) => [
		...(snapshot.sol.lamports > 0 ? [{ label: "SOL", mint: WRAPPED_SOL_MINT }] : []),
		...snapshot.tokens.map((token) => ({ label: getWalletTokenLabel(token), mint: token.mint })),
	]);
}
