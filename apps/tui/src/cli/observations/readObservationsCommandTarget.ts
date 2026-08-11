/**
 * Reads the target argument from an observations command while skipping known flags.
 *
 * @param argv Raw observations command argv.
 * @returns Target argument when present.
 */
export function readObservationsCommandTarget(
	argv: readonly string[],
): string | undefined {
	for (let index = 2; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg) continue;
		if (arg === "--json") continue;
		if (arg === "--session-dir") {
			index += 1;
			continue;
		}
		if (arg.startsWith("--session-dir=")) continue;
		if (arg.startsWith("-")) continue;
		return arg;
	}
	return undefined;
}
