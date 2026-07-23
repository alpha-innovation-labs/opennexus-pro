import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { createPhantomDerivationPath } from "./createPhantomDerivationPath.js";
import { normalizeMnemonic } from "./normalizeMnemonic.js";

/**
 * Derives one Phantom Solana public key from a recovery phrase.
 *
 * @param mnemonic BIP39 recovery phrase.
 * @param accountIndex Zero-based Phantom account index.
 * @returns Base58 Solana public key.
 */
export function derivePhantomPublicKey(mnemonic: string, accountIndex: number): string {
	const seed = mnemonicToSeedSync(normalizeMnemonic(mnemonic));
	const derived = derivePath(createPhantomDerivationPath(accountIndex), seed.toString("hex"));
	return Keypair.fromSeed(derived.key).publicKey.toBase58();
}
