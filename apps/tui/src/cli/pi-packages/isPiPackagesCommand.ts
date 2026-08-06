/**
 * Reports whether argv targets the Nexus pi-packages CLI subcommand.
 *
 * Matches: `nexus pi-packages <subcommand> [args]`
 *
 * @param argv Raw CLI arguments.
 * @returns True when the first argument is "pi-packages".
 */
export function isPiPackagesCommand(argv: readonly string[]): boolean {
  return argv[0] === "pi-packages";
}
