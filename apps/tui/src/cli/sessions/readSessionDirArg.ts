/**
 * Reads the optional session-dir argument from the CLI.
 *
 * @param argv Raw CLI arguments.
 * @returns The requested session directory, if present.
 */
export function readSessionDirArg(argv: readonly string[]): string | undefined {
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--session-dir" && typeof argv[index + 1] === "string") {
			return argv[index + 1];
		}
		if (arg.startsWith("--session-dir=")) {
			return arg.slice("--session-dir=".length);
		}
	}

	return undefined;
}
