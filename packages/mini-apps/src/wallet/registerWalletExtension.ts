import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { handleWalletExtensionCommand } from "./command/handleWalletExtensionCommand.js";

/**
 * Registers the wallet mini-app slash command.
 *
 * @param pi Pi extension API.
 */
export function registerWalletExtension(pi: ExtensionAPI): void {
	pi.registerCommand("wallet", {
		description: "Show Phantom wallet balances from a Keychain-stored recovery phrase",
		handler: handleWalletExtensionCommand,
		menuGroup: "Mini-Apps",
	});
}
