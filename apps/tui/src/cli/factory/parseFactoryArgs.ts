/**
 * Parsed factory subcommand arguments.
 */
export type FactoryArgs =
	| { command: "list" }
	| { command: "explain" }
	| { command: "help"; invalidSubcommand?: never }
	| { command: string; invalidSubcommand: string };

/**
 * Parses factory CLI arguments into a subcommand.
 *
 * @param argv Raw CLI arguments (from process.argv.slice(2)).
 * @returns Parsed arguments.
 */
export function parseFactoryArgs(
	argv: readonly string[],
): FactoryArgs {
	const realArgs = argv.filter((a) => a !== "--");
	const scriptPath = "apps/tui/src/index.ts";
	const cliArgs = realArgs[0] === scriptPath ? realArgs.slice(1) : realArgs;

	const subcommand = cliArgs[1];

	if (!subcommand) {
		return { command: "help" };
	}

	switch (subcommand) {
		case "list":
			return { command: "list" };
		case "explain":
			return { command: "explain" };
		case "help":
			return { command: "help" };
		default:
			return { command: "help", invalidSubcommand: subcommand };
	}
}
