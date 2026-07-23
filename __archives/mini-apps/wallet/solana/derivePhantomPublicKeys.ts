import { derivePhantomPublicKey } from "./derivePhantomPublicKey.js";

/**
 * Derives Phantom Solana public keys for account indices.
 *
 * @param mnemonic BIP39 recovery phrase.
 * @param count Number of accounts to derive.
 * @returns Derived base58 public keys.
 */
export function derivePhantomPublicKeys(mnemonic: string, count: number): string[] {
	return Array.from({ length: count }, (_, index) => derivePhantomPublicKey(mnemonic, index));
}
