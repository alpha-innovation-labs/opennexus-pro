import type { TokenMetadata } from "../metadata/TokenMetadata.js";
import type { TokenBalanceRow } from "./TokenBalanceRow.js";

/**
 * Adds display metadata to token balance rows.
 *
 * @param rows Token balance rows.
 * @param metadata Metadata keyed by mint.
 * @returns Token rows with display metadata.
 */
export function applyTokenMetadata(rows: readonly TokenBalanceRow[], metadata: Record<string, TokenMetadata>): TokenBalanceRow[] {
	return rows.map((row) => ({ ...row, ...metadata[row.mint] }));
}
