/**
 * Lazily loads the wallet command to avoid loading Solana crypto on unrelated CLI startup.
 *
 * @param argv Wallet command arguments.
 * @returns Wallet command exit code.
 */
export async function runWalletManifestCommand(argv: readonly string[]): Promise<number> {
	const { runWalletCommand } = await import("./runWalletCommand.js");
	return runWalletCommand(argv);
}
