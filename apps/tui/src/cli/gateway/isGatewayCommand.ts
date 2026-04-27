/**
 * Reports whether argv targets the gateway command surface.
 *
 * @param argv Raw CLI args.
 * @returns True when the gateway subcommand is addressed.
 */
export function isGatewayCommand(argv: readonly string[]): boolean {
	return argv[0] === "gateway";
}
