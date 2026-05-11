/**
 * Prints Nexus install command usage.
 */
export function printInstallUsage(): void {
  console.log([
    "Usage: nexus install <source> [-l]",
    "",
    "Install an extension package and add it to Nexus settings.",
    "",
    "Options:",
    "  -l, --local    Install project-locally (.nexus/settings.json)",
    "",
    "Examples:",
    "  nexus install @aliou/pi-processes",
    "  nexus install npm:@aliou/pi-processes",
    "  nexus install https://pi.dev/packages/@aliou/pi-processes?name=process",
    "  nexus install git:github.com/user/repo",
    "  nexus install ./local/path",
  ].join("\n"));
}
