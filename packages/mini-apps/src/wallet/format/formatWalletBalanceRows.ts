import { formatWalletBalanceRow } from "./formatWalletBalanceRow.js";
import type { WalletBalanceRow } from "../solana/WalletBalanceRow.js";

/**
 * Formats wallet balances with one account per line.
 *
 * @param rows Wallet balance rows.
 * @returns Multi-line balance output.
 */
export function formatWalletBalanceRows(rows: WalletBalanceRow[]): string {
	return rows.map((row) => formatWalletBalanceRow(row)).join("\n");
}
