import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { readMnemonicFromKeychain } from "../keychain/readMnemonicFromKeychain.js";
import { saveMnemonicToKeychain } from "../keychain/saveMnemonicToKeychain.js";
import { normalizeMnemonic } from "../solana/normalizeMnemonic.js";
import { validateMnemonic } from "../solana/validateMnemonic.js";

/**
 * Resolves the recovery phrase from command args, Keychain, or UI prompt.
 *
 * @param args Slash-command arguments after any account count.
 * @param ctx Extension command context.
 * @returns Valid normalized mnemonic or undefined when unavailable.
 */
export async function resolveWalletMnemonic(args: readonly string[], ctx: ExtensionCommandContext): Promise<string | undefined> {
	const supplied = normalizeMnemonic(args.join(" "));
	if (supplied && validateMnemonic(supplied)) {
		await saveMnemonicToKeychain(supplied);
		return supplied;
	}

	const stored = await readMnemonicFromKeychain();
	if (stored && validateMnemonic(stored)) return normalizeMnemonic(stored);

	if (!ctx.hasUI) return undefined;
	const prompted = await ctx.ui.input("Wallet recovery phrase", "Enter 12 words; saved to macOS Keychain");
	if (!prompted) return undefined;
	const mnemonic = normalizeMnemonic(prompted);
	if (!validateMnemonic(mnemonic)) throw new Error("Recovery phrase must be a valid 12-word BIP39 mnemonic.");
	await saveMnemonicToKeychain(mnemonic);
	return mnemonic;
}
