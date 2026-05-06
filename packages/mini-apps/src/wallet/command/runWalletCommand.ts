import { getWalletCachePath } from "../cache/getWalletCachePath.js";
import { pickCachedWalletSnapshots } from "../cache/pickCachedWalletSnapshots.js";
import { readWalletBalanceCache } from "../cache/readWalletBalanceCache.js";
import { formatWalletSnapshots } from "../format/formatWalletSnapshots.js";
import { readMnemonicFromKeychain } from "../keychain/readMnemonicFromKeychain.js";
import { derivePhantomPublicKeys } from "../solana/derivePhantomPublicKeys.js";
import { normalizeMnemonic } from "../solana/normalizeMnemonic.js";
import { validateMnemonic } from "../solana/validateMnemonic.js";
import { splitWalletCommandArgs } from "./splitWalletCommandArgs.js";

/**
 * Runs the wallet mini-app CLI command using cached balances only.
 *
 * @param argv CLI arguments including the wallet command name.
 * @returns Process exit code.
 */
export async function runWalletCommand(argv: readonly string[]): Promise<number> {
	try {
		const { count, mnemonicArgs } = splitWalletCommandArgs(argv.slice(1));
		const supplied = normalizeMnemonic(mnemonicArgs.join(" "));
		const mnemonic = supplied || await readMnemonicFromKeychain();
		if (!mnemonic || !validateMnemonic(mnemonic)) throw new Error("Provide a valid 12-word phrase or save one with /wallet in Nexus first.");
		const cache = await readWalletBalanceCache(getWalletCachePath(process.env));
		const snapshots = pickCachedWalletSnapshots(cache, derivePhantomPublicKeys(mnemonic, count));
		if (snapshots.length === 0) throw new Error("No cached balances. Open Nexus and press r in /wallet to refresh.");
		console.log(formatWalletSnapshots(snapshots));
		return 0;
	} catch (error) {
		console.error(error instanceof Error ? error.message : "Wallet balance lookup failed.");
		return 1;
	}
}
