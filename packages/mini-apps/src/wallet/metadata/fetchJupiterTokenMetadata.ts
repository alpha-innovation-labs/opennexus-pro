import { fetchJupiterTokenMetadataForMint } from "./fetchJupiterTokenMetadataForMint.js";
import type { TokenMetadata } from "./TokenMetadata.js";

/**
 * Fetches token display metadata from Jupiter's public lite API.
 *
 * @param mints Token mint addresses to resolve.
 * @returns Metadata keyed by mint address.
 */
export async function fetchJupiterTokenMetadata(mints: readonly string[]): Promise<Record<string, TokenMetadata>> {
	const entries = await Promise.all([...new Set(mints)].map(async (mint) => [mint, await fetchJupiterTokenMetadataForMint(mint)] as const));
	const metadata: Record<string, TokenMetadata> = {};
	for (const [mint, value] of entries) {
		if (value) metadata[mint] = value;
	}
	return metadata;
}
