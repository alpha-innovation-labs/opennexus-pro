/**
 * Wraps an OSC notification sequence for tmux passthrough when needed.
 *
 * @param sequence Raw OSC escape sequence.
 * @param env Environment variables.
 * @returns Sequence wrapped for tmux when active.
 */
export function wrapForTmux(
	sequence: string,
	env: NodeJS.ProcessEnv = process.env,
): string {
	if (!env.TMUX) return sequence;
	const escaped = sequence.split("\x1b").join("\x1b\x1b");
	return `\x1bPtmux;${escaped}\x1b\\`;
}
