/**
 * One derived wallet account balance row.
 */
export interface WalletBalanceRow {
	index: number;
	publicKey: string;
	lamports: number;
}
