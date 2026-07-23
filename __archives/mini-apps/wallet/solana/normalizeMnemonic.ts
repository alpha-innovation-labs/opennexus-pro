/**
 * Normalizes whitespace and case for a BIP39 recovery phrase.
 *
 * @param mnemonic Raw recovery phrase text.
 * @returns Normalized mnemonic text.
 */
export function normalizeMnemonic(mnemonic: string): string {
	return mnemonic.trim().toLowerCase().split(/\s+/u).join(" ");
}
