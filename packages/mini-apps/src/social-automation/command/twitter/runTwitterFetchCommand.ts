import { fetchTwitterAccounts } from "../../core/twitter/fetchTwitterAccounts.js";
import { hasFlag } from "../hasFlag.js";
import { readFlagValue } from "../readFlagValue.js";
import { readRepeatedFlagValues } from "../readRepeatedFlagValues.js";

/**
 * Runs the social automation Twitter fetch command.
 *
 * @param argv Raw CLI args.
 * @returns Exit code.
 */
export async function runTwitterFetchCommand(argv: readonly string[]): Promise<number> {
	const accounts = readRepeatedFlagValues(argv, "--account");
	if (accounts.length === 0) {
		console.error("Usage: nexus social-automation twitter fetch --account <handle>");
		return 1;
	}
	const limitValue = readFlagValue(argv, "--limit");
	const summary = await fetchTwitterAccounts({ accounts, dbPath: readFlagValue(argv, "--db"), nitterBase: readFlagValue(argv, "--nitter-base"), limit: limitValue ? Number(limitValue) : undefined });
	if (hasFlag(argv, "--json")) console.log(JSON.stringify(summary, null, 2));
	else console.log(`Twitter fetched=${summary.fetched} inserted=${summary.inserted} skipped=${summary.skipped} failures=${summary.failures.length}`);
	return summary.failures.length === accounts.length ? 1 : 0;
}
