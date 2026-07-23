import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { derivePhantomPublicKeys } from "./derivePhantomPublicKeys.js";
import type { WalletBalanceRow } from "./WalletBalanceRow.js";

/**
 * Reads balances for derived Phantom Solana accounts.
 *
 * @param input Mnemonic, RPC URL, and number of accounts to query.
 * @returns Balance rows in account-index order.
 */
export async function readWalletBalances(input: { mnemonic: string; rpcUrl: string; count: number }): Promise<WalletBalanceRow[]> {
	const connection = new Connection(input.rpcUrl, "confirmed");
	const publicKeys = derivePhantomPublicKeys(input.mnemonic, input.count);
	const balances = await Promise.all(publicKeys.map((publicKey) => connection.getBalance(new PublicKey(publicKey))));
	return publicKeys.map((publicKey, index) => ({ index, publicKey, lamports: balances[index] ?? 0 }));
}

/**
 * Converts lamports to a SOL string without losing display precision.
 *
 * @param lamports Lamports to format.
 * @returns SOL balance string.
 */
export function lamportsToSolText(lamports: number): string {
	return (lamports / LAMPORTS_PER_SOL).toLocaleString("en-US", { maximumFractionDigits: 9 });
}
