/**
 * Prints nexus pi-packages command usage.
 */
export function printPiPackagesUsage(): void {
	console.log(
		[
			"Usage: nexus pi-packages <subcommand> [args]",
			"",
			"Manage Pi packages from the CLI.",
			"",
			"Subcommands:",
			"  list              Show all configured Pi packages",
			"  enable <source>   Enable a Pi package",
			"  disable <source>  Disable a Pi package",
			"",
			"Examples:",
			"  nexus pi-packages list",
			"  nexus pi-packages enable @aliou/pi-processes",
			"  nexus pi-packages disable pi-chrome",
		].join("\n"),
	);
}
