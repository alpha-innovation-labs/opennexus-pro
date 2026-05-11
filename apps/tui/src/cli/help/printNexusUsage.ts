import { isCliFeatureAvailable } from "../features/isCliFeatureAvailable.js";
import { createNexusUsageText } from "./createNexusUsageText.js";

/**
 * Prints the Nexus-owned top-level CLI help text.
 */
export function printNexusUsage(): void {
	console.log(createNexusUsageText({
		annotation: isCliFeatureAvailable("annotation"),
		automations: isCliFeatureAvailable("automations"),
		socialAutomation: isCliFeatureAvailable("social-automation"),
		socialChat: isCliFeatureAvailable("social-chat"),
	}));
}
