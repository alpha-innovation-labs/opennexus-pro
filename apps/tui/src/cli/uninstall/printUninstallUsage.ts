/**
 * Prints Nexus uninstall command usage.
 */
export function printUninstallUsage(): void {
	console.log(
		[
			"Usage: nexus uninstall <source> [-l]",
			"",
			"Uninstall an extension package and remove it from Nexus settings.",
			"",
			"Options:",
			"  -l, --local    Remove from project-local settings (.nexus/settings.json)",
			"",
			"Examples:",
			"  nexus uninstall @aliou/pi-processes",
			"  nexus uninstall npm:@aliou/pi-processes",
			"  nexus uninstall git:github.com/user/repo",
			"  nexus uninstall ./local/path",
		].join("\n"),
	);
}
