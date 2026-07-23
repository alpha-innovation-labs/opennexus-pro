/**
 * Reads the optional wallet account count from slash-command arguments.
 *
 * @param args Slash-command arguments.
 * @returns Account count bounded to a safe display range.
 */
export function readWalletAccountCount(args: readonly string[]): number {
	const first = args[0]?.trim();
	if (!first) return 1;
	const parsed = Number.parseInt(first, 10);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return Math.min(parsed, 20);
}
