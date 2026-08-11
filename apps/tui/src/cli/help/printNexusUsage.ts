import { createNexusUsageText } from "./createNexusUsageText";

/**
 * Prints the Nexus-owned top-level CLI help text.
 */
export function printNexusUsage(): void {
	console.log(createNexusUsageText());
}
