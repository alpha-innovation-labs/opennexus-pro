/**
 * Creates the Solana RPC URL used by the wallet viewer.
 *
 * @param env Environment variables containing optional SOLANA_RPC_URL.
 * @returns Solana RPC URL.
 */
export function createSolanaRpcUrl(env: NodeJS.ProcessEnv): string {
	return env.SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com";
}
