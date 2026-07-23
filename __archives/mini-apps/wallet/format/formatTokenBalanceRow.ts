import type { TokenBalanceRow } from "../solana/TokenBalanceRow.js";

/**
 * Formats one SPL token balance as a terminal row.
 *
 * @param row Token balance data.
 * @param selected Whether this token is selected.
 * @returns Human-readable token balance row.
 */
export function formatTokenBalanceRow(row: TokenBalanceRow, selected = false): string {
	const label = row.symbol ?? row.name ?? row.mint;
	const image = row.imageUrl ? ` 🖼 ${row.imageUrl}` : "";
	return `   ${selected ? "›" : "•"} ${label}  ${row.uiAmount}${image}`;
}
