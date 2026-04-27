/**
 * Decides whether startup should clear the terminal before first render.
 *
 * @param argv User-provided Nexus arguments after internal startup normalization.
 * @param input Input stream used by Nexus.
 * @param output Output stream used by Nexus.
 * @returns True when this is a fresh interactive launch.
 */
export function shouldClearStartupScreen(
	argv: string[],
	input: { isTTY?: boolean },
	output: { isTTY?: boolean },
): boolean {
	return argv.length === 0 && input.isTTY === true && output.isTTY === true;
}
