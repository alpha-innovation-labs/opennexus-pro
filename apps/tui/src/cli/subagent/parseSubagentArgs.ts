/**
 * Parse subagent CLI arguments into command + args + flags.
 *
 * Handles two invocation modes:
 *   1. Direct Node: `npx tsx -- apps/tui/src/index.ts subagent send ...`
 *      — process.argv.slice(2) = ["--", "apps/tui/src/index.ts", "subagent", ...]
 *   2. Via just's [positional-arguments] + "$@":
 *      process.argv.slice(2) = ["subagent", "send", ...]
 */
export function parseSubagentArgs(): {
	command: string;
	args: string[];
	flags: Record<string, string>;
} {
	const raw = process.argv.slice(2);

	// Skip "--" that npx/tsx inserts before the script path.
	const tokens = raw.filter((a) => a !== "--");

	// If there's only one token and it contains spaces, it was forwarded
	// via just's [positional-arguments] + "$@" — split it back out.
	let flat: string[];
	if (tokens.length === 1 && tokens[0].includes(" ")) {
		flat = tokens[0].split(/\s+/);
	} else {
		flat = tokens;
	}

	// Skip the script path ("apps/tui/src/index.ts") if present.
	const scriptPath = "apps/tui/src/index.ts";
	const cliArgs = flat[0] === scriptPath ? flat.slice(1) : flat;

	// Strip "subagent" — it's the dispatch prefix, not a real argument.
	const subagentIndex = cliArgs.indexOf("subagent");
	const realArgs =
		subagentIndex >= 0 ? cliArgs.slice(subagentIndex + 1) : cliArgs;

	const command = realArgs[0] ?? "help";
	const rest = realArgs.slice(1);
	const args: string[] = [];
	const flags: Record<string, string> = {};

	for (let i = 0; i < rest.length; i++) {
		if (rest[i].startsWith("--")) {
			const key = rest[i].slice(2);
			const next = rest[i + 1];
			if (next && !next.startsWith("--")) {
				flags[key] = next;
				i++;
			} else {
				flags[key] = "true";
			}
		} else {
			args.push(rest[i]);
		}
	}

	return { command, args, flags };
}
