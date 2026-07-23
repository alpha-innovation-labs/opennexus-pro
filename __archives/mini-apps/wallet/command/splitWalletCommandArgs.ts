import { readWalletAccountCount } from "./readWalletAccountCount.js";

/**
 * Splits /wallet arguments into account count and mnemonic words.
 *
 * @param args Slash-command arguments.
 * @returns Parsed count and remaining mnemonic arguments.
 */
export function splitWalletCommandArgs(args: readonly string[]): { count: number; mnemonicArgs: readonly string[] } {
	const first = args[0]?.trim();
	if (first && /^\d+$/u.test(first)) return { count: readWalletAccountCount(args), mnemonicArgs: args.slice(1) };
	return { count: 1, mnemonicArgs: args };
}
