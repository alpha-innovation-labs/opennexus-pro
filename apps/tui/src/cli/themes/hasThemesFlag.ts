/**
 * Returns whether the CLI arguments target the themes subcommand.
 *
 * @param argv Raw CLI arguments.
 * @returns True when `nexus themes` (with any subcommand) is present.
 */
export function hasThemesFlag(argv: readonly string[]): boolean {
	return argv.includes("themes");
}

/**
 * Returns whether the CLI arguments request theme listing.
 *
 * @param argv Raw CLI arguments.
 * @returns True when `nexus themes list` is present.
 */
export function hasThemesListFlag(argv: readonly string[]): boolean {
	const idx = argv.indexOf("themes");
	return idx !== -1 && argv[idx + 1] === "list";
}

/**
 * Returns whether the CLI arguments request theme setting.
 *
 * @param argv Raw CLI arguments.
 * @returns True when `nexus themes set` is present.
 */
export function hasThemesSetFlag(argv: readonly string[]): boolean {
	const idx = argv.indexOf("themes");
	return idx !== -1 && argv[idx + 1] === "set";
}

/**
 * Reads the theme name argument after `nexus themes set <name>`.
 *
 * @param argv Raw CLI arguments.
 * @returns Theme name, or undefined when not set.
 */
export function readThemeNameArg(argv: readonly string[]): string | undefined {
	const idx = argv.indexOf("themes");
	if (idx === -1 || argv[idx + 1] !== "set") return undefined;
	return argv[idx + 2];
}

/**
 * Reads the theme name argument after `nexus themes list <name>`.
 *
 * @param argv Raw CLI arguments.
 * @returns Theme name, or undefined when not set.
 */
export function readListThemeNameArg(
	argv: readonly string[],
): string | undefined {
	const idx = argv.indexOf("themes");
	if (idx === -1 || argv[idx + 1] !== "list") return undefined;
	return argv[idx + 2];
}
