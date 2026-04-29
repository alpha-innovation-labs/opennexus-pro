/**
 * Reads the session id passed to the observations CLI flag.
 *
 * @param argv Raw CLI arguments.
 * @returns Session id when provided.
 */
export function readObservationsSessionIdArg(argv: string[]): string | undefined {
	const equalsArg = argv.find((arg) => arg.startsWith("--observations="));
	if (equalsArg) return equalsArg.slice("--observations=".length).trim() || undefined;
	const flagIndex = argv.indexOf("--observations");
	if (flagIndex === -1) return undefined;
	const nextArg = argv[flagIndex + 1];
	return nextArg && !nextArg.startsWith("-") ? nextArg : undefined;
}
