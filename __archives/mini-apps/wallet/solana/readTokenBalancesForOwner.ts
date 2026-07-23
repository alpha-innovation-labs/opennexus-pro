import { Connection, PublicKey } from "@solana/web3.js";
import type { TokenBalanceRow } from "./TokenBalanceRow.js";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/**
 * Reads parsed SPL token balances for one wallet owner.
 *
 * @param input RPC connection, owner account details, and optional metadata.
 * @returns Non-zero SPL token balance rows.
 */
export async function readTokenBalancesForOwner(input: {
	connection: Connection;
	ownerIndex: number;
	ownerPublicKey: string;
}): Promise<TokenBalanceRow[]> {
	const response = await input.connection.getParsedTokenAccountsByOwner(new PublicKey(input.ownerPublicKey), { programId: TOKEN_PROGRAM_ID });
	return response.value.flatMap((entry) => {
		const info = entry.account.data.parsed.info as { mint: string; tokenAmount: { amount: string; decimals: number; uiAmountString?: string } };
		if (info.tokenAmount.amount === "0") return [];
		return [{
			ownerIndex: input.ownerIndex,
			ownerPublicKey: input.ownerPublicKey,
			mint: info.mint,
			tokenAccount: entry.pubkey.toBase58(),
			amount: info.tokenAmount.amount,
			decimals: info.tokenAmount.decimals,
			uiAmount: info.tokenAmount.uiAmountString ?? info.tokenAmount.amount,
		}];
	});
}
