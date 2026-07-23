import type { TokenBalanceRow } from "./TokenBalanceRow.js";
import type { WalletBalanceRow } from "./WalletBalanceRow.js";

/**
 * Cached SOL and SPL-token balances for one derived wallet account.
 */
export interface WalletAccountSnapshot {
	sol: WalletBalanceRow;
	tokens: TokenBalanceRow[];
}
