import { validateMnemonic as validateBip39Mnemonic } from "bip39";
import { normalizeMnemonic } from "./normalizeMnemonic.js";

/**
 * Validates that the supplied recovery phrase is a supported BIP39 mnemonic.
 *
 * @param mnemonic Raw recovery phrase text.
 * @returns True when the mnemonic is valid.
 */
export function validateMnemonic(mnemonic: string): boolean {
	const normalized = normalizeMnemonic(mnemonic);
	const wordCount = normalized.length === 0 ? 0 : normalized.split(" ").length;
	return wordCount === 12 && validateBip39Mnemonic(normalized);
}
