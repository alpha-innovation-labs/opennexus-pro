import { WALLET_KEYCHAIN_ACCOUNT, WALLET_KEYCHAIN_SERVICE } from "./constants.js";
import { runSecurityCommand } from "./runSecurityCommand.js";

/**
 * Reads the wallet recovery phrase from the user's macOS Keychain.
 *
 * @returns Stored mnemonic, or undefined when no item exists.
 */
export async function readMnemonicFromKeychain(): Promise<string | undefined> {
	try {
		const stdout = await runSecurityCommand([
			"find-generic-password",
			"-s",
			WALLET_KEYCHAIN_SERVICE,
			"-a",
			WALLET_KEYCHAIN_ACCOUNT,
			"-w",
		]);
		const mnemonic = stdout.trim();
		return mnemonic.length > 0 ? mnemonic : undefined;
	} catch {
		return undefined;
	}
}
