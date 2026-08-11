/**
 * Reports whether argv targets the Nexus package install command.
 *
 * @param argv Raw CLI arguments.
 * @returns True when the first argument is install.
 */
export function isInstallCommand(argv: readonly string[]): boolean {
	return argv[0] === "install";
}
