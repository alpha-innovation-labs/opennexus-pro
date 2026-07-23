/**
 * One SPL token balance held by a wallet account.
 */
export interface TokenBalanceRow {
	ownerIndex: number;
	ownerPublicKey: string;
	mint: string;
	tokenAccount: string;
	amount: string;
	decimals: number;
	uiAmount: string;
	symbol?: string;
	name?: string;
	imageUrl?: string;
	imageBase64?: string;
	imageMimeType?: string;
}
