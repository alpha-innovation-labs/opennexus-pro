/**
 * Reports whether argv targets the Nexus package uninstall command.
 *
 * @param argv Raw CLI arguments.
 * @returns True when the first argument is uninstall.
 */
export function isUninstallCommand(argv: readonly string[]): boolean {
	return argv[0] === "uninstall";
}
