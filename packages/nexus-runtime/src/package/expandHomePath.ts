/**
 * Expands a leading tilde in a package directory path.
 *
 * @param input Raw path value.
 * @param homeDir Home directory to expand against.
 * @returns Expanded absolute-like path.
 */
export function expandHomePath(input: string, homeDir: string): string {
	if (input === "~") return homeDir;
	if (input.startsWith("~/")) return `${homeDir}${input.slice(1)}`;
	return input;
}
