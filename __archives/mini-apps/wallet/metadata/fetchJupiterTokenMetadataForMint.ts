import { fetchImageAsBase64 } from "./fetchImageAsBase64.js";
import type { TokenMetadata } from "./TokenMetadata.js";

/**
 * Fetches display metadata for one token mint from Jupiter's public lite API.
 *
 * @param mint Token mint address.
 * @returns Token metadata when Jupiter has a match.
 */
export async function fetchJupiterTokenMetadataForMint(mint: string): Promise<TokenMetadata | undefined> {
	try {
		const response = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mint)}`);
		if (!response.ok) return undefined;
		const tokens = await response.json() as Array<{ id?: string; symbol?: string; name?: string; icon?: string; logoURI?: string }>;
		const token = tokens.find((item) => item.id === mint);
		if (!token?.id) return undefined;
		const imageUrl = token.icon ?? token.logoURI;
		const image = imageUrl ? await fetchImageAsBase64(imageUrl) : undefined;
		return { mint: token.id, symbol: token.symbol, name: token.name, imageUrl, ...image };
	} catch {
		return undefined;
	}
}
