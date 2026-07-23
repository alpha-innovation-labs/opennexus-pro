import type { TokenBalanceRow } from "@nexus/mini-apps/wallet/solana/TokenBalanceRow.js";

/**
 * Returns the display label for one wallet token row.
 *
 * @param token Token balance row.
 * @returns Token display label.
 */
export function getWalletTokenLabel(token: TokenBalanceRow): string {
	return token.symbol ?? token.name ?? token.mint;
}
