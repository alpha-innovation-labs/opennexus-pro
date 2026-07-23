import { Connection, PublicKey } from "@solana/web3.js";
import { fetchJupiterTokenMetadata } from "../metadata/fetchJupiterTokenMetadata.js";
import { applyTokenMetadata } from "./applyTokenMetadata.js";
import { derivePhantomPublicKeys } from "./derivePhantomPublicKeys.js";
import { readTokenBalancesForOwner } from "./readTokenBalancesForOwner.js";
import type { WalletAccountSnapshot } from "./WalletAccountSnapshot.js";

/**
 * Reads SOL and SPL-token snapshots for derived Phantom accounts.
 *
 * @param input Mnemonic, RPC URL, and account count.
 * @returns Account snapshots in account-index order.
 */
export async function readWalletSnapshots(input: { mnemonic: string; rpcUrl: string; count: number }): Promise<WalletAccountSnapshot[]> {
	const connection = new Connection(input.rpcUrl, "confirmed");
	const publicKeyTexts = derivePhantomPublicKeys(input.mnemonic, input.count);
	const publicKeys = publicKeyTexts.map((publicKey) => new PublicKey(publicKey));
	const solBalances = await Promise.all(publicKeys.map((publicKey) => connection.getBalance(publicKey)));
	const tokenGroups = await Promise.all(publicKeyTexts.map((publicKey, index) => readTokenBalancesForOwner({ connection, ownerIndex: index, ownerPublicKey: publicKey })));
	const metadata = await fetchJupiterTokenMetadata([...new Set(tokenGroups.flat().map((row) => row.mint))]);
	return publicKeyTexts.map((publicKey, index) => ({
		sol: { index, publicKey, lamports: solBalances[index] ?? 0 },
		tokens: applyTokenMetadata(tokenGroups[index] ?? [], metadata),
	}));
}
