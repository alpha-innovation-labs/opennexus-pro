/**
 * Checks whether argv contains the subagent command prefix.
 *
 * Skips "--" (from npx/tsx) and the script path ("apps/tui/src/index.ts")
 * to find the real CLI command.
 *
 * @param argv Raw CLI arguments (from process.argv.slice(2)).
 * @returns True when the first real CLI argument is "subagent".
 */
export function hasSubagentFlag(argv: readonly string[]): boolean {
	const realArgs = argv.filter((a) => a !== "--");
	const scriptPath = "apps/tui/src/index.ts";
	const cliArgs = realArgs[0] === scriptPath ? realArgs.slice(1) : realArgs;
	return cliArgs[0] === "subagent";
}
