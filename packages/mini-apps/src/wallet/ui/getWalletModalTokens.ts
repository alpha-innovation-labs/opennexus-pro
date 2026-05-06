import type { TokenBalanceRow } from "@nexus/mini-apps/wallet/solana/TokenBalanceRow.js";
import type { WalletModalState } from "./WalletModalState.js";

/**
 * Flattens token rows currently visible in the wallet modal.
 *
 * @param state Current wallet modal state.
 * @returns Token balance rows.
 */
export function getWalletModalTokens(state: WalletModalState): TokenBalanceRow[] {
	return state.snapshots.flatMap((snapshot) => snapshot.tokens);
}
