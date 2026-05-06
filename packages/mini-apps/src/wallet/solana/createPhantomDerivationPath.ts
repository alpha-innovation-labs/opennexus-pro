/**
 * Creates Phantom's Solana derivation path for an account index.
 *
 * @param accountIndex Zero-based Phantom account index.
 * @returns BIP44 Solana derivation path.
 */
export function createPhantomDerivationPath(accountIndex: number): string {
	return `m/44'/501'/${accountIndex}'/0'`;
}
