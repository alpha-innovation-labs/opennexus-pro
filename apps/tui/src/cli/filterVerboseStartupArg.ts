/**
 * Removes Pi's verbose startup flag so upstream startup help cannot render in Nexus.
 *
 * @param args Raw app arguments.
 * @returns Arguments without verbose startup flags.
 */
export function filterVerboseStartupArg(args: string[]): string[] {
	return args.filter((arg) => arg !== "--verbose");
}
