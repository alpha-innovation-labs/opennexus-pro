import type { MiniAppManifest } from "../../registry/MiniAppManifest.js";
import { runWalletManifestCommand } from "./runWalletManifestCommand.js";

/**
 * Wallet mini-app manifest consumed by Nexus CLI routing.
 */
export const walletMiniAppManifest: MiniAppManifest = {
	id: "wallet",
	label: "Wallet",
	features: ["Phantom wallet balance lookup", "macOS Keychain recovery phrase storage", "Helius RPC balance queries"],
	isCommand: (argv) => argv[0] === "wallet",
	isRunnerCommand: () => false,
	runCommand: runWalletManifestCommand,
	runRunner: async () => undefined,
};
