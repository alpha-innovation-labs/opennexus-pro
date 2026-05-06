import { lamportsToSolText } from "../solana/readWalletBalances.js";
import type { WalletBalanceRow } from "../solana/WalletBalanceRow.js";

/**
 * Formats one wallet balance as a terminal row.
 *
 * @param row Wallet balance data.
 * @param selected Whether SOL is selected.
 * @returns Human-readable balance row.
 */
export function formatWalletBalanceRow(row: WalletBalanceRow, selected = false): string {
	return `${selected ? "›" : `${row.index + 1}.`} ${row.publicKey}  ${lamportsToSolText(row.lamports)} SOL`;
}
