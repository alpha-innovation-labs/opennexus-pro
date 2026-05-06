import type { WalletAccountSnapshot } from "../solana/WalletAccountSnapshot.js";
import type { WalletBalanceRow } from "../solana/WalletBalanceRow.js";

/**
 * Persisted wallet balance cache without recovery phrase material.
 */
export interface WalletBalanceCache {
	updatedAt: string;
	rowsByPublicKey: Record<string, WalletBalanceRow>;
	snapshotsByPublicKey: Record<string, WalletAccountSnapshot>;
}
