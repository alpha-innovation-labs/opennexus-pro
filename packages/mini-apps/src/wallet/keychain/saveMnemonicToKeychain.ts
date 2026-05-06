import { WALLET_KEYCHAIN_ACCOUNT, WALLET_KEYCHAIN_SERVICE } from "./constants.js";
import { runSecurityCommand } from "./runSecurityCommand.js";

/**
 * Saves or replaces the wallet recovery phrase in the user's macOS Keychain.
 *
 * @param mnemonic Recovery phrase to store locally.
 */
export async function saveMnemonicToKeychain(mnemonic: string): Promise<void> {
	await runSecurityCommand([
		"add-generic-password",
		"-U",
		"-s",
		WALLET_KEYCHAIN_SERVICE,
		"-a",
		WALLET_KEYCHAIN_ACCOUNT,
		"-w",
		mnemonic,
	]);
}
