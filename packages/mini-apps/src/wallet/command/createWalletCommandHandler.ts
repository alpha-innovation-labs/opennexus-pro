import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { formatWalletSnapshots } from "@nexus/mini-apps/wallet/format/formatWalletSnapshots.js";
import { resolveWalletMnemonic } from "@nexus/mini-apps/wallet/command/resolveWalletMnemonic.js";
import { splitWalletCommandArgs } from "@nexus/mini-apps/wallet/command/splitWalletCommandArgs.js";
import { loadCachedWalletRows } from "./loadCachedWalletRows.js";
import { showWalletModal } from "./showWalletModal.js";

/**
 * Creates the /wallet command handler that stores mnemonic locally and shows cached balances.
 *
 * @returns Slash-command handler.
 */
export function createWalletCommandHandler(): (args: string, ctx: ExtensionCommandContext) => Promise<void> {
	return async (args, ctx) => {
		try {
			const parsedArgs = args.trim().length > 0 ? args.trim().split(/\s+/u) : [];
			const { count, mnemonicArgs } = splitWalletCommandArgs(parsedArgs);
			const mnemonic = await resolveWalletMnemonic(mnemonicArgs, ctx);
			if (!mnemonic) throw new Error("No recovery phrase provided or stored in macOS Keychain.");
			if (ctx.hasUI) return showWalletModal(ctx, mnemonic, count);
			const cached = await loadCachedWalletRows(mnemonic, count);
			console.log(cached.snapshots.length > 0 ? formatWalletSnapshots(cached.snapshots) : "No cached balances. Open Nexus and press r in /wallet to refresh.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Wallet balance lookup failed.";
			if (ctx.hasUI) ctx.ui.notify(message, "error");
			else console.error(message);
		}
	};
}
